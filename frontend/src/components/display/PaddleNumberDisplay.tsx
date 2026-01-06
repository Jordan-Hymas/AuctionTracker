import { useEffect, useState } from 'react';
import { Bid } from '../../types/bid';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface PaddleNumberDisplayProps {
  lastBid: Bid | null;
  currentDonationLevel: number | null;
  themeName?: string;
}

export default function PaddleNumberDisplay({ lastBid, currentDonationLevel, themeName = 'boysGirlsClub' }: PaddleNumberDisplayProps) {
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
            fontSize: 'clamp(4rem, 10vmin, 8rem)',
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
            ? 'radial-gradient(circle, rgba(37, 150, 190, 0.08), transparent)'
            : themeName === 'modern'
            ? 'radial-gradient(circle, rgba(27, 54, 100, 0.08), transparent)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent)',
          filter: 'blur(100px)',
          animation: isNew ? 'glowPulse 1s ease-out' : 'glow 4s ease-in-out infinite',
          zIndex: -1,
        }}
      />

      {/* "PADDLE" Label */}
      <div
        style={{
          fontSize: 'clamp(3rem, 6vmin, 6rem)',
          fontWeight: '800',
          color: themeName === 'modern'
            ? '#1b3664'
            : themeName === 'boysGirlsClub'
            ? '#000000'
            : 'rgba(255, 255, 255, 0.95)',
          letterSpacing: '0.3em',
          marginBottom: '3rem',
          textTransform: 'uppercase',
          textShadow: themeName === 'modern'
            ? '0 0 20px rgba(27, 54, 100, 0.15), 0 2px 4px rgba(0, 0, 0, 0.2)'
            : themeName === 'boysGirlsClub'
            ? '0 2px 4px rgba(0, 0, 0, 0.2)'
            : '0 0 20px rgba(59, 130, 246, 0.18)',
          animation: isNew ? 'slideInLeft 0.5s ease-out' : 'none',
        }}
      >
        PADDLE
      </div>

      {/* Paddle Number */}
      <div
        style={{
          fontSize: 'clamp(12rem, 28vmin, 32rem)',
          fontWeight: '900',
          color: themeName === 'boysGirlsClub' ? '#2596be' : '#ffffff',
          lineHeight: '1',
          textShadow: themeName === 'modern'
            ? `
              0 0 40px rgba(27, 54, 100, 0.22),
              0 0 80px rgba(27, 54, 100, 0.12),
              0 4px 20px rgba(0, 0, 0, 0.5)
            `
            : themeName === 'boysGirlsClub'
            ? `
              0 0 30px rgba(37, 150, 190, 0.25),
              0 0 60px rgba(37, 150, 190, 0.15),
              0 4px 20px rgba(0, 0, 0, 0.2)
            `
            : `
              0 0 40px rgba(59, 130, 246, 0.25),
              0 0 80px rgba(59, 130, 246, 0.15),
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
            marginTop: '4rem',
            fontSize: 'clamp(5rem, 12vmin, 12rem)',
            fontWeight: '800',
            color: themeName === 'modern'
              ? '#e24725'
              : themeName === 'boysGirlsClub'
              ? '#2596be'
              : '#fbbf24',
            textShadow: themeName === 'modern'
              ? `
                0 0 40px rgba(226, 71, 37, 0.25),
                0 0 80px rgba(226, 71, 37, 0.15),
                0 4px 15px rgba(0, 0, 0, 0.5)
              `
              : themeName === 'boysGirlsClub'
              ? `
                0 0 30px rgba(37, 150, 190, 0.25),
                0 0 60px rgba(37, 150, 190, 0.15),
                0 4px 15px rgba(0, 0, 0, 0.2)
              `
              : `
                0 0 40px rgba(251, 191, 36, 0.25),
                0 0 80px rgba(251, 191, 36, 0.15),
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
            top: '10%',
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
            bottom: '10%',
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            animation: 'slideLeft 3s linear infinite',
          }}
        />
      </div>

      {/* Corner Accents */}
      <>
        <div
          style={{
            position: 'absolute',
            top: 'clamp(-3rem, -15vh, -9rem)',
            left: 'clamp(-30px, -3vw, -10px)',
            width: 'clamp(50px, 6vmin, 100px)',
            height: 'clamp(50px, 6vmin, 100px)',
            borderTop: themeName === 'modern'
              ? '3px solid rgba(27, 54, 100, 0.8)'
              : themeName === 'boysGirlsClub'
              ? '3px solid rgba(0, 133, 202, 0.8)'
              : '3px solid rgba(59, 130, 246, 0.8)',
            borderLeft: themeName === 'modern'
              ? '3px solid rgba(27, 54, 100, 0.8)'
              : themeName === 'boysGirlsClub'
              ? '3px solid rgba(0, 133, 202, 0.8)'
              : '3px solid rgba(59, 130, 246, 0.8)',
            borderRight: 'none',
            borderBottom: 'none',
            opacity: isNew ? 1 : 0.6,
            transition: 'opacity 0.5s ease-out',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 'clamp(-3rem, -15vh, -9rem)',
            right: 'clamp(-30px, -3vw, -10px)',
            width: 'clamp(50px, 6vmin, 100px)',
            height: 'clamp(50px, 6vmin, 100px)',
            borderBottom: themeName === 'modern'
              ? '3px solid rgba(27, 54, 100, 0.8)'
              : themeName === 'boysGirlsClub'
              ? '3px solid rgba(0, 133, 202, 0.8)'
              : '3px solid rgba(59, 130, 246, 0.8)',
            borderRight: themeName === 'modern'
              ? '3px solid rgba(27, 54, 100, 0.8)'
              : themeName === 'boysGirlsClub'
              ? '3px solid rgba(0, 133, 202, 0.8)'
              : '3px solid rgba(59, 130, 246, 0.8)',
            borderLeft: 'none',
            borderTop: 'none',
            opacity: isNew ? 1 : 0.6,
            transition: 'opacity 0.5s ease-out',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      </>
    </div>
  );
}
