const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const BACKEND_PORT = Number(process.env.BACKEND_PORT || 3001);
const USE_EXTERNAL_BACKEND = process.env.ELECTRON_USE_EXTERNAL_BACKEND === '1';
const IS_DEV = !app.isPackaged;

let mainWindow = null;
let backendProcess = null;

function getBackendPaths() {
  if (IS_DEV) {
    const root = path.resolve(__dirname, '..');
    return {
      entry: path.join(root, 'backend', 'dist', 'index.js'),
      cwd: path.join(root, 'backend'),
    };
  }

  return {
    entry: path.join(process.resourcesPath, 'backend', 'dist', 'index.js'),
    cwd: path.join(process.resourcesPath, 'backend'),
  };
}

function getBackendEnv() {
  const appDataDir = path.join(app.getPath('userData'), 'data');
  const uploadDir = path.join(appDataDir, 'uploads');

  return {
    ...process.env,
    NODE_ENV: IS_DEV ? 'development' : 'production',
    PORT: String(BACKEND_PORT),
    DATABASE_PATH: path.join(appDataDir, 'auction.db'),
    UPLOAD_DIR: uploadDir,
    CORS_ORIGIN: '*',
  };
}

function startBackend() {
  if (USE_EXTERNAL_BACKEND) return;

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
    process.stdout.write(`[backend] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    process.stderr.write(`[backend] ${data}`);
  });

  backendProcess.on('exit', (code, signal) => {
    const reason = code !== null ? `code ${code}` : `signal ${signal}`;
    console.log(`[backend] exited with ${reason}`);
  });
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGTERM');
  }
}

function waitForBackend(timeoutMs = 15000) {
  const start = Date.now();
  const url = `http://127.0.0.1:${BACKEND_PORT}/api/v1/health`;

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
        reject(new Error(`Backend did not start within ${timeoutMs}ms`));
        return;
      }
      setTimeout(check, 300);
    };

    check();
  });
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (IS_DEV) {
    await mainWindow.loadURL('http://127.0.0.1:5173');
    return;
  }

  await mainWindow.loadFile(path.join(app.getAppPath(), 'frontend', 'dist', 'index.html'));
}

app.whenReady().then(async () => {
  startBackend();

  try {
    await waitForBackend();
    await createMainWindow();
  } catch (error) {
    dialog.showErrorBox(
      'AuctionTracker Startup Error',
      `Failed to start backend service.\n\n${error.message}`
    );
    app.quit();
  }

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
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
