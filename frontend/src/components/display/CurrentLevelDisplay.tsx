import { useEffect, useState } from 'react';

interface CurrentLevelDisplayProps {
  currentLevel: number | null;
  primaryColor?: string;
}

export default function CurrentLevelDisplay({
  currentLevel,
  primaryColor = '#0085CA',
}: CurrentLevelDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prevLevel, setPrevLevel] = useState(currentLevel);

  useEffect(() => {
    if (currentLevel !== null) {
      // Trigger animation when level changes
      if (currentLevel !== prevLevel) {
        setIsVisible(false);
        setTimeout(() => {
          setIsVisible(true);
          setPrevLevel(currentLevel);
        }, 100);
      } else {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [currentLevel, prevLevel]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (currentLevel === null) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        animation: isVisible ? 'fadeIn 0.5s ease-out' : 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: '1.5rem 3rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Glow Effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%',
            height: '120%',
            background: `radial-gradient(circle, ${primaryColor}40, transparent)`,
            filter: 'blur(30px)',
            animation: 'pulse 3s ease-in-out infinite',
            zIndex: -1,
          }}
        />

        {/* Amount Display */}
        <div
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '900',
            color: primaryColor,
            lineHeight: '1',
            textShadow: `
              0 0 40px ${primaryColor}38,
              0 0 80px ${primaryColor}26,
              0 4px 20px rgba(0, 0, 0, 0.5)
            `,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}
        >
          {formatCurrency(currentLevel)}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
