import { getAllBids } from '../database/queries';

export class ExportService {
  static async generateCSV(): Promise<string> {
    const bids = getAllBids();

    // CSV header
    const header = 'Timestamp,Paddle Number,Bid Amount,Running Total\n';

    // CSV rows with running total
    let runningTotal = 0;
    const rows = bids
      .reverse() // Start from oldest to newest for running total
      .map(bid => {
        runningTotal += bid.amount;
        const date = new Date(bid.timestamp);
        const timestamp = this.formatLocalDateTime(date);
        return `${timestamp},${bid.paddleNumber},${bid.amount.toFixed(2)},${runningTotal.toFixed(2)}`;
      })
      .join('\n');

    return header + rows;
  }

  static getFilename(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `auction-bids-${year}-${month}-${day}.csv`;
  }

  private static formatLocalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
