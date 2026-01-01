import { useState, useEffect } from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface MoneyGrowthBarProps {
  currentTotal: number;
  goalAmount: number;
  startingTotal: number;
  primaryColor?: string;
  progressBarGradient?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  size: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  rotation: number;
  size: number;
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
  const [particles, setParticles] = useState<Particle[]>([]);
  const [amountAdded, setAmountAdded] = useState<number>(0);
  const [showAmountAdded, setShowAmountAdded] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (currentTotal !== previousTotal) {
      setShowPulse(true);

      // Calculate amount added and show it
      const difference = currentTotal - previousTotal;
      if (difference > 0) {
        setAmountAdded(difference);
        setShowAmountAdded(true);

        // Create particle burst
        const newParticles: Particle[] = [];
        for (let i = 0; i < 20; i++) {
          newParticles.push({
            id: Date.now() + i,
            x: 50, // Center of progress bar
            y: 50,
            angle: (Math.PI * 2 * i) / 20,
            velocity: Math.random() * 3 + 2,
            size: Math.random() * 4 + 2,
          });
        }
        setParticles(newParticles);

        setTimeout(() => {
          setShowAmountAdded(false);
        }, 2000);
      }

      setPreviousTotal(currentTotal);
      const timer = setTimeout(() => {
        setShowPulse(false);
        setParticles([]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTotal, previousTotal]);

  const progress = Math.min(
    Math.max(((animatedTotal - startingTotal) / (goalAmount - startingTotal)) * 100, 0),
    100
  );

  // Create confetti when goal is reached
  useEffect(() => {
    if (progress >= 100 && confetti.length === 0) {
      const confettiColors = ['#fbbf24', '#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'];
      const newConfetti: ConfettiPiece[] = [];
      for (let i = 0; i < 100; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: Math.random() * 2 + 3,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          rotation: Math.random() * 360,
          size: Math.random() * 8 + 4,
        });
      }
      setConfetti(newConfetti);
    }
  }, [progress, confetti.length]);

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
          fontSize: 'clamp(1rem, 2.5vw, 1.75rem)',
          fontWeight: '900',
          color: '#ffffff',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(43, 117, 181, 0.6), 0 4px 12px rgba(0, 0, 0, 0.9), 2px 2px 0px rgba(0, 0, 0, 0.5)',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2))',
            padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
            borderRadius: '8px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(5px)',
          }}
        >
          {formatCurrency(startingTotal)}
        </span>
        <span
          style={{
            textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(43, 117, 181, 0.6), 0 4px 12px rgba(0, 0, 0, 0.9), 2px 2px 0px rgba(0, 0, 0, 0.5)',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2))',
            padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
            borderRadius: '8px',
            border: '2px solid rgba(43, 117, 181, 0.4)',
            backdropFilter: 'blur(5px)',
          }}
        >
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
          overflow: 'visible',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: showPulse
            ? `inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 40px ${primaryColor}, 0 0 80px ${primaryColor}`
            : 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Flash Overlay */}
        {showPulse && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent)',
              animation: 'flashFade 0.8s ease-out',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          />
        )}

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
              ? `0 0 40px ${primaryColor}, 0 0 80px ${primaryColor}, inset 0 0 30px rgba(255, 255, 255, 0.5)`
              : `0 0 20px ${primaryColor}`,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Animated Shine Effect */}
          {progress > 0 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                  animation: showPulse ? 'shineProgress 0.8s ease-out' : 'shineProgress 3s ease-in-out infinite',
                }}
              />

              {/* Sparkles */}
              <div
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '10%',
                  width: '4px',
                  height: '4px',
                  background: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px white',
                  animation: 'twinkle 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '60%',
                  left: '30%',
                  width: '3px',
                  height: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 0 6px white',
                  animation: 'twinkle 2s ease-in-out infinite 0.5s',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '60%',
                  width: '5px',
                  height: '5px',
                  background: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px white',
                  animation: 'twinkle 1.8s ease-in-out infinite 1s',
                }}
              />
            </>
          )}
        </div>

        {/* Particle Burst */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderRadius: '50%',
              background: primaryColor,
              boxShadow: `0 0 10px ${primaryColor}`,
              animation: 'particleBurst 1.5s ease-out forwards',
              transform: `translate(-50%, -50%) rotate(${particle.angle}rad) translateX(${particle.velocity * 20}px)`,
              opacity: 0,
            }}
          />
        ))}

        {/* Progress Percentage */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(1.25rem, 4vw, 2rem)',
            fontWeight: '900',
            color: '#ffffff',
            textShadow: showPulse
              ? '0 0 25px rgba(255, 255, 255, 1), 0 0 40px rgba(43, 117, 181, 1), 0 4px 15px rgba(0, 0, 0, 1), 3px 3px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(43, 117, 181, 0.5)'
              : '0 0 15px rgba(255, 255, 255, 0.8), 0 0 25px rgba(43, 117, 181, 0.6), 0 4px 12px rgba(0, 0, 0, 1), 2px 2px 0px rgba(0, 0, 0, 0.8)',
            zIndex: 10,
            animation: showPulse ? 'popIn 0.5s ease-out' : 'none',
            WebkitTextStroke: '1px rgba(0, 0, 0, 0.5)',
            letterSpacing: '0.05em',
          }}
        >
          {progress.toFixed(1)}%
        </div>

        {/* Amount Added Indicator */}
        {showAmountAdded && amountAdded > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              fontWeight: '900',
              color: '#fbbf24',
              textShadow: '0 0 30px rgba(251, 191, 36, 1), 0 4px 12px rgba(0, 0, 0, 0.8)',
              animation: 'floatUpFade 2s ease-out forwards',
              zIndex: 30,
              whiteSpace: 'nowrap',
            }}
          >
            +{formatCurrency(amountAdded)}
          </div>
        )}

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
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            color: '#ffffff',
            fontWeight: '900',
            textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 25px rgba(43, 117, 181, 0.6), 0 4px 10px rgba(0, 0, 0, 0.9), 2px 2px 0px rgba(0, 0, 0, 0.5)',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1))',
            padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
            borderRadius: '8px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(5px)',
            display: 'inline-block',
          }}
        >
          {formatCurrency(goalAmount - currentTotal)} to go!
        </div>
      )}

      {/* Celebration Message */}
      {progress >= 100 && (
        <div
          style={{
            position: 'relative',
            marginTop: 'clamp(0.5rem, 1.5vw, 1rem)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Confetti Animation */}
          {confetti.map((piece) => (
            <div
              key={piece.id}
              style={{
                position: 'absolute',
                left: `${piece.x}%`,
                top: '-100px',
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                backgroundColor: piece.color,
                borderRadius: piece.size > 6 ? '2px' : '50%',
                animation: `confettiFall ${piece.duration}s linear ${piece.delay}s infinite`,
                transform: `rotate(${piece.rotation}deg)`,
                opacity: 0.9,
                zIndex: 100,
                boxShadow: `0 0 10px ${piece.color}`,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Goal Reached Text */}
          <div
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: '#fbbf24',
              fontWeight: '900',
              textShadow: '0 0 30px rgba(251, 191, 36, 1), 0 0 50px rgba(251, 191, 36, 0.8), 0 4px 15px rgba(0, 0, 0, 1), 3px 3px 0px rgba(0, 0, 0, 0.8)',
              animation: 'pulse 2s ease-in-out infinite',
              WebkitTextStroke: '1px rgba(0, 0, 0, 0.5)',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1))',
              padding: 'clamp(0.5rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
              borderRadius: '12px',
              border: '3px solid rgba(251, 191, 36, 0.6)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            GOAL REACHED!
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes shineProgress {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(200%);
            }
          }

          @keyframes flashFade {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }

          @keyframes particleBurst {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0);
            }
          }

          @keyframes twinkle {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.5);
            }
          }

          @keyframes floatUpFade {
            0% {
              opacity: 0;
              transform: translateX(-50%) translateY(20px) scale(0.8);
            }
            20% {
              opacity: 1;
              transform: translateX(-50%) translateY(0) scale(1.2);
            }
            80% {
              opacity: 1;
              transform: translateX(-50%) translateY(-30px) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateX(-50%) translateY(-60px) scale(0.8);
            }
          }

          @keyframes confettiFall {
            0% {
              transform: translateY(0) rotateZ(0deg) rotateY(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(calc(100vh + 200px)) rotateZ(720deg) rotateY(360deg);
              opacity: 0.3;
            }
          }
        `}
      </style>
    </div>
  );
}
