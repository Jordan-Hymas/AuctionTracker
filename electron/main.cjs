const { app, BrowserWindow, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

const IS_DEV = !app.isPackaged;
const DEV_BACKEND_PORT = 3001;
const DEV_FRONTEND_URL = 'http://127.0.0.1:5173';
const EMBEDDED_PORT_CANDIDATES = [5000, 5001, 5002];
const STARTUP_TIMEOUT_MS = 20000;
const FIRST_RUN_MARKER_FILE = '.auctiontracker-first-run-complete';

let displayWindow = null;
let controlWindow = null;
let backendProcess = null;
let backendExitReason = null;
let runtimeBaseUrl = null;
let backendLogTail = [];

function lockDownWindow(window) {
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

function getRuntimeDataPaths() {
  const appDataDir = path.join(app.getPath('userData'), 'data');
  return {
    appDataDir,
    databasePath: path.join(appDataDir, 'auction.db'),
    uploadDir: path.join(appDataDir, 'uploads'),
  };
}

function getFrontendDistPath() {
  const root = path.resolve(__dirname, '..');
  return IS_DEV
    ? path.join(root, 'frontend', 'dist')
    : path.join(app.getAppPath(), 'frontend', 'dist');
}

function maybeResetEmbeddedDataOnFirstLaunch() {
  if (IS_DEV) return;

  const markerPath = path.join(app.getPath('userData'), FIRST_RUN_MARKER_FILE);
  if (fs.existsSync(markerPath)) return;

  const { appDataDir, databasePath, uploadDir } = getRuntimeDataPaths();
  fs.mkdirSync(appDataDir, { recursive: true });

  const databaseArtifacts = [
    databasePath,
    `${databasePath}-shm`,
    `${databasePath}-wal`,
    `${databasePath}-journal`,
    `${databasePath}.backup`,
  ];

  for (const artifactPath of databaseArtifacts) {
    try {
      if (fs.existsSync(artifactPath)) {
        fs.rmSync(artifactPath, { force: true });
      }
    } catch (error) {
      console.warn(`[electron] Failed to remove ${artifactPath}: ${error.message}`);
    }
  }

  try {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[electron] Failed to clear uploads directory ${uploadDir}: ${error.message}`);
  }

  fs.writeFileSync(markerPath, `${new Date().toISOString()}\n`, 'utf8');
  console.log('[electron] First launch detected. Embedded app data was reset to a clean state.');
}

function getWindowIconPath() {
  const root = path.resolve(__dirname, '..');
  const candidates = IS_DEV
    ? [path.join(root, 'build', 'icon.png'), path.join(root, 'icon.png')]
    : process.platform === 'win32'
      ? [path.join(process.resourcesPath, 'icon.ico'), path.join(process.resourcesPath, 'icon.png')]
      : [path.join(process.resourcesPath, 'icon.png')];

  return candidates.find((iconPath) => fs.existsSync(iconPath));
}

function applyDockIcon() {
  if (process.platform !== 'darwin') return;

  const root = path.resolve(__dirname, '..');
  const candidates = IS_DEV
    ? [path.join(root, 'build', 'icon.png'), path.join(root, 'icon.png')]
    : [path.join(process.resourcesPath, 'icon.icns'), path.join(process.resourcesPath, 'icon.png')];

  for (const iconPath of candidates) {
    if (!fs.existsSync(iconPath)) continue;
    const iconImage = nativeImage.createFromPath(iconPath);
    if (!iconImage.isEmpty()) {
      app.dock.setIcon(iconImage);
      console.log(`[electron] Dock icon set from ${iconPath}`);
      return;
    }
  }
}

function appendBackendLog(prefix, chunk) {
  const text = String(chunk);
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    backendLogTail.push(`${prefix}${line}`);
  }
  if (backendLogTail.length > 30) {
    backendLogTail = backendLogTail.slice(-30);
  }
}

function getBackendPaths() {
  const root = path.resolve(__dirname, '..');
  const packagedAppRoot = app.getAppPath();
  return {
    entry: IS_DEV
      ? path.join(root, 'backend', 'dist', 'index.js')
      : path.join(packagedAppRoot, 'backend', 'dist', 'index.js'),
    cwd: IS_DEV
      ? path.join(root, 'backend')
      : path.dirname(packagedAppRoot),
  };
}

function getBackendEnv() {
  const { databasePath, uploadDir } = getRuntimeDataPaths();

  return {
    ...process.env,
    NODE_ENV: 'production',
    ELECTRON_EMBEDDED: '1',
    PORT_CANDIDATES: EMBEDDED_PORT_CANDIDATES.join(','),
    DATABASE_PATH: databasePath,
    UPLOAD_DIR: uploadDir,
    FRONTEND_DIST_PATH: getFrontendDistPath(),
    SERVE_FRONTEND: '1',
    CORS_ORIGIN: '*',
  };
}

function startBackend() {
  const { entry, cwd } = getBackendPaths();
  backendProcess = spawn(process.execPath, [entry], {
    cwd,
    env: {
      ...getBackendEnv(),
      ELECTRON_RUN_AS_NODE: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  backendProcess.stdout.on('data', (data) => {
    appendBackendLog('[backend] ', data);
    process.stdout.write(`[backend] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    appendBackendLog('[backend] ', data);
    process.stderr.write(`[backend] ${data}`);
  });

  backendProcess.on('exit', (code, signal) => {
    const reason = code !== null ? `code ${code}` : `signal ${signal}`;
    backendExitReason = reason;
    console.log(`[backend] exited with ${reason}`);
  });
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGTERM');
  }
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 500) {
        res.resume();
        reject(new Error(`Unexpected response ${res.statusCode || 'unknown'}`));
        return;
      }

      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(1500, () => req.destroy());
  });
}

function waitForUrl(url, timeoutMs = STARTUP_TIMEOUT_MS) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          resolve();
          return;
        }

        retry();
      });

      req.on('error', retry);
      req.setTimeout(1500, () => {
        req.destroy();
      });
    };

    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(check, 300);
    };

    check();
  });
}

async function waitForEmbeddedNetworkInfo(timeoutMs = STARTUP_TIMEOUT_MS) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (backendExitReason) {
      const recentLog = backendLogTail.length > 0
        ? `\nRecent backend logs:\n${backendLogTail.slice(-10).join('\n')}`
        : '';
      throw new Error(
        `Embedded server exited before startup (${backendExitReason}).${recentLog}`
      );
    }

    for (const port of EMBEDDED_PORT_CANDIDATES) {
      try {
        const info = await getJson(`http://127.0.0.1:${port}/api/v1/network-info`);
        if (info && typeof info.port === 'number') {
          return info;
        }
      } catch (error) {
        // Keep probing candidate ports until timeout.
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(
    `Embedded server did not become ready. Ensure one of ports 5000, 5001, or 5002 is free and allowed through firewall.`
  );
}

async function createDisplayWindow(url) {
  const windowIconPath = getWindowIconPath();
  displayWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    autoHideMenuBar: true,
    title: 'Auction Tracker (NPCE) - Display',
    icon: windowIconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  lockDownWindow(displayWindow);
  displayWindow.removeMenu();
  await displayWindow.loadURL(url);
  displayWindow.maximize();
}

async function createControlWindow(url) {
  const windowIconPath = getWindowIconPath();
  controlWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 700,
    autoHideMenuBar: true,
    title: 'Auction Tracker (NPCE) - Control Panel',
    icon: windowIconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  lockDownWindow(controlWindow);
  controlWindow.removeMenu();
  await controlWindow.loadURL(url);
}

app.whenReady().then(async () => {
  try {
    applyDockIcon();

    if (IS_DEV) {
      await waitForUrl(`${DEV_FRONTEND_URL}/`);
      await waitForUrl(`http://127.0.0.1:${DEV_BACKEND_PORT}/api/v1/health`);
      runtimeBaseUrl = DEV_FRONTEND_URL;
    } else {
      maybeResetEmbeddedDataOnFirstLaunch();
      startBackend();
      const networkInfo = await waitForEmbeddedNetworkInfo();
      runtimeBaseUrl = `http://localhost:${networkInfo.port}`;

      console.log(`[electron] Embedded server port: ${networkInfo.port}`);
      console.log(`[electron] LAN IP: ${networkInfo.lanIp || 'not detected'}`);
      console.log(`[electron] Control URL (LAN): ${networkInfo.controlUrlLan || 'Unavailable'}`);
      console.log(`[electron] Control URL (Local): ${networkInfo.controlUrlLocal}`);

      if (!networkInfo.lanIp) {
        dialog.showMessageBox({
          type: 'warning',
          title: 'LAN Address Not Found',
          message: 'No LAN IPv4 address was detected.',
          detail:
            'Other devices may not reach the control panel. Check that you are connected to a network and allow this app through Windows Defender Firewall.',
        });
      }
    }

    await createDisplayWindow(`${runtimeBaseUrl}/`);
    await createControlWindow(`${runtimeBaseUrl}/control`);
  } catch (error) {
    dialog.showErrorBox(
      'AuctionTracker Startup Error',
      `Failed to start application services.\n\n${error.message}\n\nTroubleshooting:\n1) Ensure ports 5000, 5001, 5002 are not in use.\n2) Allow the app through Windows Defender Firewall for private networks.`
    );
    app.quit();
  }

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createDisplayWindow(`${runtimeBaseUrl}/`);
      await createControlWindow(`${runtimeBaseUrl}/control`);
    }
  });
});

app.on('before-quit', () => {
  stopBackend();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
