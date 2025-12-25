import { Router, Request, Response } from 'express';
import { SettingsService } from '../services/SettingsService';
import { broadcastSettingsUpdated } from '../websocket';

const router = Router();

// GET /api/v1/settings - Get all settings
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching settings...');
    const settings = await SettingsService.getSettings();
    console.log('✅ Settings fetched successfully:', settings);
    res.json({ settings });
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch settings',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// PUT /api/v1/settings - Update settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const settings = await SettingsService.updateSettings(updates);

    // Broadcast to all connected clients
    broadcastSettingsUpdated(settings);

    res.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to update settings'
    });
  }
});

export default router;
