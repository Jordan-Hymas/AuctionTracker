# Auction Thermometer

A professional web-based auction thermometer application for live fundraising events. Features a clean main display with animated thermometer and a separate control panel for operators.

## Features

- **Main Display** - Large thermometer visualization with smooth animations for projectors/TVs
- **Control Panel** - Operator interface for bid entry, settings, and data management
- **Real-time Updates** - WebSocket-powered live synchronization across all connected devices
- **Customizable** - Upload logos, customize themes, set goals
- **Portable** - Docker-containerized for easy deployment
- **Data Export** - Export all bids to CSV with running totals

## Quick Start (Docker)

### Prerequisites
- Docker and Docker Compose installed
- Port 3000 available

### Run the Application

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Main Display: http://localhost:3000/
# Control Panel: http://localhost:3000/control

# Stop services
docker-compose down

# Reset all data (database and uploads)
docker-compose down -v
```

## Development Setup

### Prerequisites
- Node.js 20+ and npm
- Ports 3001 (backend) and 5173 (frontend) available

### Backend Setup

```bash
cd backend
npm install
npm run dev    # Runs on http://localhost:3001
```

### Frontend Setup

```bash
# In a separate terminal
cd frontend
npm install
npm run dev    # Runs on http://localhost:5173
```

The frontend Vite dev server will proxy API calls to the backend automatically.

## How to Use

### For Operators (Control Panel)

1. Open `http://localhost:3000/control` on your laptop/tablet
2. **Settings Panel**:
   - Set starting total (e.g., $1,000)
   - Set fundraising goal (e.g., $10,000)
   - Upload your organization's logo
   - Select a theme
3. **Bid Entry**:
   - Enter paddle number
   - Enter bid amount (or use quick-add buttons: +$25, +$50, +$100, +$250)
   - Click "Submit Bid"
   - View recent bids in the history panel
4. **Actions**:
   - **Undo** - Remove the last bid
   - **Export CSV** - Download all bids with timestamps and running totals
   - **Reset** - Clear all data for a new event (with confirmation)

### For Audience (Main Display)

1. Open `http://localhost:3000/` on the projector/TV device
2. The display shows:
   - Animated thermometer filling as bids come in
   - Large total amount with smooth count-up animation
   - Organization logo (if uploaded)
   - Optional "Last Bid" flash animation
3. All updates happen in real-time automatically

## Network Access

To access from other devices on your network:

1. Find your computer's IP address:
   - macOS/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`
2. Access from any device on the same network:
   - Display: `http://YOUR_IP:3000/`
   - Control: `http://YOUR_IP:3000/control`

Example: `http://192.168.1.100:3000/`

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (local file storage)
- **Real-time**: Socket.io (WebSockets)
- **Image Processing**: Sharp (automatic logo optimization)
- **Deployment**: Docker + Docker Compose + Nginx reverse proxy

## Project Structure

```
AuctionTracker/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── database/    # SQLite schema and queries
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── index.ts     # Server entry point
│   ├── data/            # SQLite DB and uploads (gitignored)
│   └── Dockerfile
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Display and Control pages
│   │   ├── hooks/       # Custom hooks (WebSocket, animations)
│   │   └── context/     # Global state management
│   └── Dockerfile
├── nginx/               # Reverse proxy
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml   # Container orchestration
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=3001
DATABASE_PATH=/app/data/auction.db
UPLOAD_DIR=/app/data/uploads
CORS_ORIGIN=*
```

### Frontend (.env)
```
VITE_API_URL=/api/v1
VITE_WS_URL=/ws
```

## Troubleshooting

### Docker issues
```bash
# Rebuild containers
docker-compose build --no-cache

# Check service status
docker-compose ps

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
```

### Development issues
```bash
# Backend not starting
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend not starting
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database reset
```bash
# Docker
docker-compose down -v

# Development
rm backend/data/auction.db
```

## License

MIT
