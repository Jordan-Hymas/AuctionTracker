import { useEffect, useState } from 'react';
import { Bid } from '../../types/bid';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface PaddleNumberDisplayProps {
  lastBid: Bid | null;
  currentDonationLevel: number | null;
  themeName?: string;
}

export default function PaddleNumberDisplay({ lastBid, currentDonationLevel, themeName = 'classic' }: PaddleNumberDisplayProps) {
  const [displayBid, setDisplayBid] = useState<Bid | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (lastBid && lastBid !== displayBid) {
      setIsNew(true);
      setDisplayBid(lastBid);
      const timer = setTimeout(() => setIsNew(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastBid, displayBid]);

  const { value: animatedLevelAmount } = useAnimatedValue(currentDonationLevel || 0, 1000);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!displayBid) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.3)',
            textAlign: 'center',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        >
          Waiting for first bid...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Glow Effect Background */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120%',
          height: '120%',
          background: themeName === 'boysGirlsClub'
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.4), transparent)',
          filter: 'blur(100px)',
          animation: isNew ? 'glowPulse 1s ease-out' : 'glow 4s ease-in-out infinite',
          zIndex: -1,
        }}
      />

      {/* "PADDLE" Label */}
      <div
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          fontWeight: '800',
          color: 'rgba(255, 255, 255, 0.9)',
          letterSpacing: '0.3em',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          textShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
          animation: isNew ? 'slideInLeft 0.5s ease-out' : 'none',
        }}
      >
        PADDLE
      </div>

      {/* Paddle Number */}
      <div
        style={{
          fontSize: 'clamp(8rem, 20vw, 18rem)',
          fontWeight: '900',
          color: '#ffffff',
          lineHeight: '1',
          textShadow: `
            0 0 40px rgba(59, 130, 246, 1),
            0 0 80px rgba(59, 130, 246, 0.8),
            0 4px 20px rgba(0, 0, 0, 0.5)
          `,
          animation: isNew ? 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'floatSlow 6s ease-in-out infinite',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {displayBid.paddleNumber}
      </div>

      {/* Current Donation Level Amount */}
      {currentDonationLevel !== null && (
        <div
          style={{
            marginTop: '2rem',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '800',
            color: '#fbbf24',
            textShadow: `
              0 0 30px rgba(251, 191, 36, 1),
              0 0 60px rgba(251, 191, 36, 0.6),
              0 4px 15px rgba(0, 0, 0, 0.5)
            `,
            animation: 'pulse 3s ease-in-out infinite',
          }}
        >
          {formatCurrency(animatedLevelAmount)}
        </div>
      )}

      {/* Decorative Lines */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '150%',
          height: '150%',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            animation: 'slideRight 3s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            animation: 'slideLeft 3s linear infinite',
          }}
        />
      </div>

      {/* Corner Accents */}
      {isNew && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '60px',
              height: '60px',
              border: '3px solid rgba(59, 130, 246, 0.8)',
              borderRight: 'none',
              borderBottom: 'none',
              animation: 'fadeIn 0.5s ease-out',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '10%',
              width: '60px',
              height: '60px',
              border: '3px solid rgba(59, 130, 246, 0.8)',
              borderLeft: 'none',
              borderTop: 'none',
              animation: 'fadeIn 0.5s ease-out',
            }}
          />
        </>
      )}
    </div>
  );
}
