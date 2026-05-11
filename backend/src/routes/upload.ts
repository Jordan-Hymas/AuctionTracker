import { Router, Request, Response } from 'express';
import { uploadMiddleware, backgroundUploadMiddleware } from '../middleware/upload';
import { SettingsService } from '../services/SettingsService';
import { broadcastLogoUpdated, broadcastSettingsUpdated } from '../websocket';
import { logger } from '../utils/logger';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const router = Router();

// POST /api/v1/upload/logo - Upload and optimize logo
router.post('/logo', uploadMiddleware.single('logo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete previous logo file before saving the new one
    const existingSettings = await SettingsService.getSettings();
    if (existingSettings.logoPath) {
      const oldFilename = path.basename(existingSettings.logoPath);
      const oldFilePath = path.join(process.env.UPLOAD_DIR || path.join(__dirname, '../../data/uploads'), oldFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const uploadPath = req.file.path;
    const filename = req.file.filename;
    const ext = path.extname(filename);

    // Skip optimization for SVG files
    if (ext.toLowerCase() === '.svg') {
      const logoUrl = `/uploads/${filename}`;
      await SettingsService.updateLogo(logoUrl);
      broadcastLogoUpdated(logoUrl);
      return res.json({ logoUrl });
    }

    // Optimize image with Sharp.
    // Read to buffer first so sharp never holds the original file open —
    // on Windows, toFile() keeps a file handle open past the resolved promise,
    // causing EBUSY when we try to delete the original immediately after.
    const optimizedFilename = `optimized-${filename.replace(ext, '.webp')}`;
    const optimizedPath = path.join(path.dirname(uploadPath), optimizedFilename);

    const inputBuffer = await fs.promises.readFile(uploadPath);
    const outputBuffer = await sharp(inputBuffer)
      .resize(800, 400, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    await fs.promises.writeFile(optimizedPath, outputBuffer);
    await fs.promises.unlink(uploadPath);

    const logoUrl = `/uploads/${optimizedFilename}`;
    await SettingsService.updateLogo(logoUrl);

    // Broadcast to all connected clients
    broadcastLogoUpdated(logoUrl);

    res.json({ logoUrl });
  } catch (error) {
    logger.error('Logo upload error', error);

    // Clean up uploaded file if it exists — ignore errors (e.g. EBUSY on Windows)
    try {
      if (req.file && fs.existsSync(req.file.path)) {
        await fs.promises.unlink(req.file.path);
      }
    } catch (_) {}

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload logo'
    });
  }
});

// DELETE /api/v1/upload/logo - Remove logo
router.delete('/logo', async (req: Request, res: Response) => {
  try {
    const settings = await SettingsService.getSettings();

    if (settings.logoPath) {
      // Delete the file
      const filename = path.basename(settings.logoPath);
      const filePath = path.join(process.env.UPLOAD_DIR || path.join(__dirname, '../../data/uploads'), filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await SettingsService.updateLogo(null);
    broadcastLogoUpdated(null);

    res.json({ success: true });
  } catch (error) {
    logger.error('Logo deletion error', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete logo'
    });
  }
});

// POST /api/v1/upload/background - Upload and optimize background image
router.post('/background', backgroundUploadMiddleware.single('background'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete previous background file before saving the new one
    const existingSettings = await SettingsService.getSettings();
    if (existingSettings.customBackgroundPath) {
      const oldFilename = path.basename(existingSettings.customBackgroundPath);
      const oldFilePath = path.join(process.env.UPLOAD_DIR || path.join(__dirname, '../../data/uploads'), oldFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const uploadPath = req.file.path;
    const filename = req.file.filename;
    const ext = path.extname(filename);

    // Skip optimization for SVG files
    if (ext.toLowerCase() === '.svg') {
      const backgroundUrl = `/uploads/${filename}`;
      const settings = await SettingsService.updateSettings({ customBackgroundPath: backgroundUrl });
      broadcastSettingsUpdated(settings);
      return res.json({ backgroundUrl });
    }

    // Optimize image with Sharp - preserve up to 3840px width for 4K displays
    const optimizedFilename = `optimized-${filename.replace(ext, '.webp')}`;
    const optimizedPath = path.join(path.dirname(uploadPath), optimizedFilename);

    const inputBuffer = await fs.promises.readFile(uploadPath);
    const outputBuffer = await sharp(inputBuffer)
      .resize(3840, 2160, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer();

    await fs.promises.writeFile(optimizedPath, outputBuffer);
    await fs.promises.unlink(uploadPath);

    const backgroundUrl = `/uploads/${optimizedFilename}`;
    const settings = await SettingsService.updateSettings({ customBackgroundPath: backgroundUrl });

    broadcastSettingsUpdated(settings);

    res.json({ backgroundUrl });
  } catch (error) {
    logger.error('Background upload error', error);

    try {
      if (req.file && fs.existsSync(req.file.path)) {
        await fs.promises.unlink(req.file.path);
      }
    } catch (_) {}

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload background'
    });
  }
});

// DELETE /api/v1/upload/background - Remove background image
router.delete('/background', async (req: Request, res: Response) => {
  try {
    const currentSettings = await SettingsService.getSettings();

    if (currentSettings.customBackgroundPath) {
      const filename = path.basename(currentSettings.customBackgroundPath);
      const filePath = path.join(process.env.UPLOAD_DIR || path.join(__dirname, '../../data/uploads'), filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const settings = await SettingsService.updateSettings({ customBackgroundPath: null });
    broadcastSettingsUpdated(settings);

    res.json({ success: true });
  } catch (error) {
    logger.error('Background deletion error', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete background'
    });
  }
});

// POST /api/v1/upload/goal-reached-background - Upload and optimize goal reached background
router.post('/goal-reached-background', backgroundUploadMiddleware.single('background'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const currentSettings = await SettingsService.getSettings();
    if (currentSettings.goalReachedBackgroundPath) {
      const oldFilename = path.basename(currentSettings.goalReachedBackgroundPath);
      const oldFilePath = path.join(process.env.UPLOAD_DIR || path.join(__dirname, '../../data/uploads'), oldFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const uploadPath = req.file.path;
    const filename = req.file.filename;
    const ext = path.extname(filename);

    // Skip optimization for SVG files
    if (ext.toLowerCase() === '.svg') {
      const goalReachedBackgroundUrl = `/uploads/${filename}`;
      const settings = await SettingsService.updateSettings({ goalReachedBackgroundPath: goalReachedBackgroundUrl });
      broadcastSettingsUpdated(settings);
      return res.json({ goalReachedBackgroundUrl });
    }

    // Optimize image with Sharp - preserve up to 3840px width for 4K displays
    const optimizedFilename = `optimized-${filename.replace(ext, '.webp')}`;
    const optimizedPath = path.join(path.dirname(uploadPath), optimizedFilename);

    const inputBuffer = await fs.promises.readFile(uploadPath);
    const outputBuffer = await sharp(inputBuffer)
      .resize(3840, 2160, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer();

    await fs.promises.writeFile(optimizedPath, outputBuffer);
    await fs.promises.unlink(uploadPath);

    const goalReachedBackgroundUrl = `/uploads/${optimizedFilename}`;
    const settings = await SettingsService.updateSettings({ goalReachedBackgroundPath: goalReachedBackgroundUrl });

    broadcastSettingsUpdated(settings);

    res.json({ goalReachedBackgroundUrl });
  } catch (error) {
    logger.error('Goal reached background upload error', error);

    try {
      if (req.file && fs.existsSync(req.file.path)) {
        await fs.promises.unlink(req.file.path);
      }
    } catch (_) {}

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload goal reached background'
    });
  }
});

// DELETE /api/v1/upload/goal-reached-background - Remove goal reached background image
router.delete('/goal-reached-background', async (req: Request, res: Response) => {
  try {
    const currentSettings = await SettingsService.getSettings();

    if (currentSettings.goalReachedBackgroundPath) {
      const filename = path.basename(currentSettings.goalReachedBackgroundPath);
      const filePath = path.join(process.env.UPLOAD_DIR || path.join(__dirname, '../../data/uploads'), filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const settings = await SettingsService.updateSettings({ goalReachedBackgroundPath: null });
    broadcastSettingsUpdated(settings);

    res.json({ success: true });
  } catch (error) {
    logger.error('Goal reached background deletion error', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete goal reached background'
    });
  }
});

export default router;
