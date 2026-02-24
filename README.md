# AuctionTracker

AuctionTracker is a real-time fundraising application with a public display view and an operator control panel. It is designed for live events where bids need to update instantly across screens and devices.

The project includes:
- A React frontend for display and control interfaces
- A Node.js/Express backend with SQLite storage
- Socket.IO for low-latency real-time updates
- Electron packaging for desktop distribution on macOS and Windows

## What the App Does

- Displays a live fundraising total and progress visuals
- Provides a control panel for entering bids and managing settings
- Synchronizes changes in real time across display, control, and mobile views
- Supports LAN access so other devices can open the control/mobile routes
- Packages as desktop installers for event deployment

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Database: SQLite (`better-sqlite3`)
- Real-time: Socket.IO
- Desktop packaging: Electron + electron-builder

## Repository Structure

```text
AuctionTracker/
  backend/                 API, database, websocket server
  frontend/                React app (display/control/mobile)
  electron/                Electron main and preload scripts
  release/                 Packaging output (generated)
  package.json             Root scripts for Electron workflows
```

## Clone and Setup

### 1. Clone

```bash
git clone <your-repo-url>
cd AuctionTracker
```

### 2. Install dependencies

Install root dependencies (Electron/build tooling and runtime deps):

```bash
npm install
```

Install backend and frontend dependencies:

```bash
npm --prefix backend install
npm --prefix frontend install
```

## Development

Run full desktop development mode (backend + frontend + Electron):

```bash
npm run dev
```

Default development endpoints:
- Frontend (Vite): `http://localhost:5173`
- Backend API: `http://localhost:3001`

## Production Runtime Behavior (Packaged App)

When packaged and launched:
- Electron starts the embedded backend server
- The server binds to `0.0.0.0` for LAN access
- It selects the first available port in this order:
  - `5000`
  - `5001`
  - `5002`
- Electron opens two windows automatically:
  - Display: `/`
  - Control: `/control`

If no port is available, startup fails with an error dialog.

## Build and Package with Electron

### Build app artifacts (no installer)

```bash
npm run build:electron
```

### macOS package

ZIP-only build (recommended for local testing):

```bash
npm run dist:mac:zip
```

Standard mac target (zip + dmg):

```bash
npm run dist:mac
```

Output is written to `release/`.

### Windows package (.exe)

Run this on a Windows machine:

```bash
npm run dist:win
```

This produces an NSIS installer `.exe` in `release\`.

## Testing the macOS Build

After `npm run dist:mac:zip`:

```bash
cp -R "release/mac-arm64/AuctionTracker.app" /Applications/
open /Applications/AuctionTracker.app
```

If macOS blocks launch because the app is unsigned:

```bash
xattr -dr com.apple.quarantine /Applications/AuctionTracker.app
open /Applications/AuctionTracker.app
```

## Testing LAN Access

In the running app, use the server IP/port shown in the control header. Other devices on the same network can use:

- Control: `http://<LAN_IP>:<PORT>/control`
- Mobile: `http://<LAN_IP>:<PORT>/mobile`

## Common Commands

```bash
npm run dev             # Backend + frontend + Electron
npm run build:electron  # Build backend and frontend for Electron
npm run dist:mac:zip    # Build macOS ZIP artifact
npm run dist:mac        # Build macOS targets
npm run dist:win        # Build Windows NSIS installer (.exe)
npm run dist:dir        # Build unpacked app directory
```

## Notes for Windows Deployment

- Build the Windows installer on Windows for best compatibility
- If LAN clients cannot connect, allow the app through Windows Defender Firewall (Private network)
- Ensure one of ports `5000`, `5001`, or `5002` is available

## License

MIT
