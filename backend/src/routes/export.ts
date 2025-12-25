import { Router, Request, Response } from 'express';
import { ExportService } from '../services/ExportService';

const router = Router();

// GET /api/v1/export/csv - Export all bids to CSV
router.get('/csv', async (req: Request, res: Response) => {
  try {
    const csv = await ExportService.generateCSV();
    const filename = ExportService.getFilename();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate CSV'
    });
  }
});

export default router;
