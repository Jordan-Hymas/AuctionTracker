import { addBid, deleteLastBid, getAllBids, getRecentBids, getBidCount, getTotalBidAmount, getCurrentTotal, getBidById, deleteBid, clearAllBids as clearAllBidsQuery } from '../database/queries';
import { NewBid, Bid } from '../models/Bid';

export class BidService {
  static validateBid(bid: NewBid): { valid: boolean; error?: string } {
    if (!bid.paddleNumber || bid.paddleNumber.trim() === '') {
      return { valid: false, error: 'Paddle number is required' };
    }

    if (typeof bid.amount !== 'number' || !Number.isFinite(bid.amount) || bid.amount <= 0) {
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

  static async deleteBidById(id: number): Promise<{ removedBid: Bid; newTotal: number }> {
    const bid = getBidById(id);
    if (!bid) throw new Error(`Bid #${id} not found`);
    deleteBid(id);
    const newTotal = getCurrentTotal();
    return { removedBid: bid, newTotal };
  }

  static async clearAllBids(): Promise<{ newTotal: number }> {
    clearAllBidsQuery();
    const newTotal = getCurrentTotal();
    return { newTotal };
  }

  static async getAllBids(): Promise<Bid[]> {
    return getAllBids();
  }

  static async getRecentBids(): Promise<Bid[]> {
    return getRecentBids();
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
