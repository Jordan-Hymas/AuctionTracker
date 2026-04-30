import { Router, Request, Response } from 'express';
import { BidService } from '../services/BidService';
import { getBidCount } from '../database/queries';
import { broadcastBidAdded, broadcastBidUndone, broadcastBidsCleared } from '../websocket';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/v1/bids - Add new bid
router.post('/', async (req: Request, res: Response) => {
  try {
    const { paddleNumber, amount } = req.body;

    const bid = await BidService.createBid({ paddleNumber, amount });
    const stats = await BidService.getBidStats();

    // Broadcast to all connected clients
    broadcastBidAdded(bid, stats.currentTotal, stats.totalBids);

    res.status(201).json({
      bid,
      currentTotal: stats.currentTotal,
      totalBids: stats.totalBids,
    });
  } catch (error) {
    logger.error('Error adding bid', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to add bid'
    });
  }
});

// DELETE /api/v1/bids/last - Undo last bid
router.delete('/last', async (req: Request, res: Response) => {
  try {
    const { removedBid, newTotal } = await BidService.undoLastBid();

    if (!removedBid) {
      return res.status(404).json({ error: 'No bids to undo' });
    }

    const totalBids = getBidCount();

    // Broadcast to all connected clients
    broadcastBidUndone(removedBid, newTotal, totalBids);

    res.json({
      removedBid,
      newTotal,
      totalBids,
    });
  } catch (error) {
    logger.error('Error undoing bid', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to undo bid'
    });
  }
});

// DELETE /api/v1/bids/all - Clear all bids
router.delete('/all', async (req: Request, res: Response) => {
  if (req.body?.confirm !== true) {
    return res.status(400).json({ error: 'Send { confirm: true } to confirm' });
  }
  try {
    const { newTotal } = await BidService.clearAllBids();
    broadcastBidsCleared(newTotal);
    res.json({ success: true, newTotal });
  } catch (error) {
    logger.error('Error clearing all bids', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to clear bids'
    });
  }
});

// DELETE /api/v1/bids/:id - Delete specific bid by ID
router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid bid ID' });
  }
  try {
    const { removedBid, newTotal } = await BidService.deleteBidById(id);
    const totalBids = getBidCount();
    broadcastBidUndone(removedBid, newTotal, totalBids);
    res.json({ removedBid, newTotal, totalBids });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to delete bid';
    const status = msg.includes('not found') ? 404 : 500;
    res.status(status).json({ error: msg });
  }
});

// GET /api/v1/bids - Get all bids
router.get('/', async (req: Request, res: Response) => {
  try {
    const bids = await BidService.getAllBids();
    res.json({ bids });
  } catch (error) {
    logger.error('Error fetching bids', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch bids'
    });
  }
});

// GET /api/v1/bids/recent - Get recent bids
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const bids = await BidService.getRecentBids();
    res.json({ bids });
  } catch (error) {
    logger.error('Error fetching recent bids', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch recent bids',
    });
  }
});

// GET /api/v1/bids/total - Get current total
router.get('/total', async (req: Request, res: Response) => {
  try {
    const stats = await BidService.getBidStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching bid stats', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch bid stats',
    });
  }
});

export default router;
