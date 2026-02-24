import { Router, Request, Response } from 'express';
import { resetAllData, getCurrentTotal, getRecentBids, getLastBid } from '../database/queries';
import { broadcastSettingsUpdated, getIO } from '../websocket';
import { SettingsService } from '../services/SettingsService';
import { buildNetworkInfo } from '../utils/network';

const router = Router();

// GET /api/v1/health - Health check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

const getNetworkInfo = (req: Request, res: Response) => {
  const port = Number(req.app.get('serverPort') || process.env.PORT || 3001);
  res.status(200).json(buildNetworkInfo(port));
};

// GET /api/v1/server-info - Backward-compatible server network information
router.get('/server-info', getNetworkInfo);

// GET /api/v1/network-info - Preferred network info endpoint
router.get('/network-info', getNetworkInfo);

// POST /api/v1/admin/reset - Reset all auction data
router.post('/reset', async (req: Request, res: Response) => {
  try {
    const { confirm } = req.body;

    if (confirm !== true) {
      return res.status(400).json({
        error: 'Confirmation required. Send { "confirm": true } to reset all data.'
      });
    }

    resetAllData();

    const settings = await SettingsService.getSettings();
    broadcastSettingsUpdated(settings);
    const io = getIO();
    io.emit('state:initial', {
      currentTotal: getCurrentTotal(),
      settings,
      lastBid: getLastBid() ?? null,
      recentBids: getRecentBids(10),
    });
    io.emit('admin:reset', { timestamp: Date.now() });

    res.json({
      success: true,
      message: 'All auction data has been reset',
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to reset data'
    });
  }
});

export default router;
