const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const IS_DEV = !app.isPackaged;
const DEV_BACKEND_PORT = 3001;
const DEV_FRONTEND_URL = 'http://127.0.0.1:5173';
const EMBEDDED_PORT_CANDIDATES = [5000, 5001, 5002];
const STARTUP_TIMEOUT_MS = 20000;

let displayWindow = null;
let controlWindow = null;
let backendProcess = null;
let backendExitReason = null;
let runtimeBaseUrl = null;
let backendLogTail = [];

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
  const root = path.resolve(__dirname, '..');
  const appDataDir = path.join(app.getPath('userData'), 'data');
  const uploadDir = path.join(appDataDir, 'uploads');
  const frontendDistPath = IS_DEV
    ? path.join(root, 'frontend', 'dist')
    : path.join(app.getAppPath(), 'frontend', 'dist');

  return {
    ...process.env,
    NODE_ENV: 'production',
    ELECTRON_EMBEDDED: '1',
    PORT_CANDIDATES: EMBEDDED_PORT_CANDIDATES.join(','),
    DATABASE_PATH: path.join(appDataDir, 'auction.db'),
    UPLOAD_DIR: uploadDir,
    FRONTEND_DIST_PATH: frontendDistPath,
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
  displayWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    autoHideMenuBar: true,
    title: 'AuctionTracker Display',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  displayWindow.removeMenu();
  await displayWindow.loadURL(url);
  displayWindow.maximize();
}

async function createControlWindow(url) {
  controlWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 700,
    autoHideMenuBar: true,
    title: 'AuctionTracker Control',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  controlWindow.removeMenu();
  await controlWindow.loadURL(url);
}

app.whenReady().then(async () => {
  try {
    if (IS_DEV) {
      await waitForUrl(`${DEV_FRONTEND_URL}/`);
      await waitForUrl(`http://127.0.0.1:${DEV_BACKEND_PORT}/api/v1/health`);
      runtimeBaseUrl = DEV_FRONTEND_URL;
    } else {
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
