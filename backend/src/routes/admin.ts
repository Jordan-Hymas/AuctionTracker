import { Router, Request, Response } from 'express';
import { resetAllData } from '../database/queries';
import { broadcastSettingsUpdated } from '../websocket';
import { SettingsService } from '../services/SettingsService';

const router = Router();

// GET /api/v1/health - Health check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

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
