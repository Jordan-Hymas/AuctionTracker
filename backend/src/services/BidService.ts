import { addBid, deleteLastBid, getAllBids, getRecentBids, getBidCount, getTotalBidAmount, getCurrentTotal } from '../database/queries';
import { NewBid, Bid } from '../models/Bid';

export class BidService {
  static validateBid(bid: NewBid): { valid: boolean; error?: string } {
    if (!bid.paddleNumber || bid.paddleNumber.trim() === '') {
      return { valid: false, error: 'Paddle number is required' };
    }

    if (typeof bid.amount !== 'number' || bid.amount <= 0) {
      return { valid: false, error: 'Bid amount must be a positive number' };
    }

    return { valid: true };
  }

  static async createBid(newBid: NewBid): Promise<Bid> {
    const validation = this.validateBid(newBid);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return addBid(newBid);
  }

  static async undoLastBid(): Promise<{ removedBid: Bid | null; newTotal: number }> {
    const removedBid = deleteLastBid();
    const newTotal = getCurrentTotal();
    return { removedBid, newTotal };
  }

  static async getAllBids(): Promise<Bid[]> {
    return getAllBids();
  }

  static async getRecentBids(limit: number = 10): Promise<Bid[]> {
    return getRecentBids(limit);
  }

  static async getBidStats(): Promise<{
    totalBids: number;
    totalAmount: number;
    currentTotal: number;
  }> {
    return {
      totalBids: getBidCount(),
      totalAmount: getTotalBidAmount(),
      currentTotal: getCurrentTotal(),
    };
  }
}
