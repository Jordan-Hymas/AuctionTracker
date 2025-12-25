import { Router, Request, Response } from 'express';
import { BidService } from '../services/BidService';
import { getBidCount } from '../database/queries';
import { broadcastBidAdded, broadcastBidUndone } from '../websocket';

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
    console.error('Error adding bid:', error);
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
    console.error('Error undoing bid:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to undo bid'
    });
  }
});

// GET /api/v1/bids - Get all bids
router.get('/', async (req: Request, res: Response) => {
  try {
    const bids = await BidService.getAllBids();
    res.json({ bids });
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch bids'
    });
  }
});

// GET /api/v1/bids/recent - Get recent bids
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    console.log('📋 Fetching recent bids with limit:', limit);
    const bids = await BidService.getRecentBids(limit);
    console.log('✅ Recent bids fetched:', bids.length, 'bids');
    res.json({ bids });
  } catch (error) {
    console.error('❌ Error fetching recent bids:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch recent bids',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// GET /api/v1/bids/total - Get current total
router.get('/total', async (req: Request, res: Response) => {
  try {
    console.log('📊 Fetching bid stats...');
    const stats = await BidService.getBidStats();
    console.log('✅ Bid stats fetched:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching bid stats:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch bid stats',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

export default router;
