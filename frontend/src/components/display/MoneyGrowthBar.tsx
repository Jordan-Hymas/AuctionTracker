import { useState, useEffect } from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface MoneyGrowthBarProps {
  currentTotal: number;
  goalAmount: number;
  startingTotal: number;
  primaryColor?: string;
  progressBarGradient?: string;
}

export default function MoneyGrowthBar({
  currentTotal,
  goalAmount,
  startingTotal,
  primaryColor = '#10b981',
  progressBarGradient = 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)'
}: MoneyGrowthBarProps) {
  const { value: animatedTotal } = useAnimatedValue(currentTotal, 1500);
  const [previousTotal, setPreviousTotal] = useState(currentTotal);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (currentTotal !== previousTotal) {
      setShowPulse(true);
      setPreviousTotal(currentTotal);
      const timer = setTimeout(() => setShowPulse(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTotal, previousTotal]);

  const progress = Math.min(
    Math.max(((animatedTotal - startingTotal) / (goalAmount - startingTotal)) * 100, 0),
    100
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      style={{
        width: '100%',
        padding: 'clamp(0.75rem, 2vw, 1.5rem)',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 'clamp(8px, 2vw, 16px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'clamp(0.5rem, 1.5vw, 1rem)',
          fontSize: 'clamp(0.75rem, 2vw, 1.25rem)',
          fontWeight: '700',
          color: '#ffffff',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
          {formatCurrency(startingTotal)}
        </span>
        <span style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
          {formatCurrency(goalAmount)}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(25px, 4vh, 50px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 'clamp(12px, 3vw, 25px)',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Progress Fill */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: progressBarGradient,
            borderRadius: 'clamp(12px, 3vw, 25px)',
            transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: showPulse
              ? `0 0 30px ${primaryColor}, 0 0 60px ${primaryColor}`
              : `0 0 15px ${primaryColor}`,
          }}
        >
          {/* Animated Shine Effect */}
          {progress > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                animation: 'shineProgress 2.5s linear infinite',
              }}
            />
          )}
        </div>

        {/* Progress Percentage */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(0.75rem, 2.5vw, 1.25rem)',
            fontWeight: '900',
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            zIndex: 10,
          }}
        >
          {progress.toFixed(1)}%
        </div>

        {/* Marker Lines */}
        {[25, 50, 75].map((marker) => (
          <div
            key={marker}
            style={{
              position: 'absolute',
              left: `${marker}%`,
              top: 0,
              width: '2px',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
          />
        ))}
      </div>

      {/* Amount Needed */}
      {progress < 100 && (
        <div
          style={{
            marginTop: 'clamp(0.5rem, 1.5vw, 1rem)',
            textAlign: 'center',
            fontSize: 'clamp(0.625rem, 1.8vw, 1rem)',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: '600',
          }}
        >
          {formatCurrency(goalAmount - currentTotal)} to go!
        </div>
      )}

      {/* Celebration Message */}
      {progress >= 100 && (
        <div
          style={{
            marginTop: 'clamp(0.5rem, 1.5vw, 1rem)',
            textAlign: 'center',
            fontSize: 'clamp(0.875rem, 2.5vw, 1.5rem)',
            color: '#fbbf24',
            fontWeight: '900',
            textShadow: '0 0 20px rgba(251, 191, 36, 0.8)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          Goal Reached!
        </div>
      )}

      <style>
        {`
          @keyframes shineProgress {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </div>
  );
}
