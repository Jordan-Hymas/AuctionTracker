import { Router, Request, Response } from 'express';
import { uploadMiddleware } from '../middleware/upload';
import { SettingsService } from '../services/SettingsService';
import { broadcastLogoUpdated } from '../websocket';
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

    // Optimize image with Sharp
    const optimizedFilename = `optimized-${filename.replace(ext, '.webp')}`;
    const optimizedPath = path.join(path.dirname(uploadPath), optimizedFilename);

    await sharp(uploadPath)
      .resize(800, 400, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(optimizedPath);

    // Delete original, rename optimized
    fs.unlinkSync(uploadPath);

    const logoUrl = `/uploads/${optimizedFilename}`;
    await SettingsService.updateLogo(logoUrl);

    // Broadcast to all connected clients
    broadcastLogoUpdated(logoUrl);

    res.json({ logoUrl });
  } catch (error) {
    console.error('Logo upload error:', error);

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

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
    console.error('Logo deletion error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete logo'
    });
  }
});

export default router;
