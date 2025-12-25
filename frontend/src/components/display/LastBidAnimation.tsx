import { useEffect, useState } from 'react';
import { Bid } from '../../types/bid';

interface LastBidAnimationProps {
  bid: Bid | null;
  show: boolean;
}

export default function LastBidAnimation({ bid, show }: LastBidAnimationProps) {
  const [visible, setVisible] = useState(false);
  const [currentBid, setCurrentBid] = useState<Bid | null>(null);

  useEffect(() => {
    if (bid && show && bid !== currentBid) {
      setCurrentBid(bid);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [bid, show, currentBid]);

  if (!currentBid || !visible) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 'clamp(1.5rem, 4vw, 3rem)',
        borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        zIndex: 1000,
        animation: visible ? 'flashIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'flashOut 0.5s ease-in-out forwards',
        minWidth: 'clamp(250px, 40vw, 400px)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        Paddle {currentBid.paddleNumber}
      </div>
      <div
        style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: '900',
          color: '#fbbf24',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        +{formatCurrency(currentBid.amount)}
      </div>
    </div>
  );
}
