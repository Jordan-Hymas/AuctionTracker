export interface Bid {
  id: number;
  paddleNumber: string;
  amount: number;
  timestamp: string;
  createdAt: string;
}

export interface NewBid {
  paddleNumber: string;
  amount: number;
}
