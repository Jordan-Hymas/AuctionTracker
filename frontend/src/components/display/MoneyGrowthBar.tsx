import { useState, useEffect } from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface MoneyGrowthBarProps {
  currentTotal: number;
  goalAmount: number;
  startingTotal: number;
  primaryColor?: string;
  progressBarGradient?: string;
  themeName?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  size: number;
  color: string;
  trail: boolean;
  type: 'spark' | 'glow' | 'dot';
  rotationSpeed: number;
}

export default function MoneyGrowthBar({
  currentTotal,
  goalAmount,
  startingTotal,
  primaryColor = '#10b981',
  progressBarGradient = 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
  themeName = 'modern'
}: MoneyGrowthBarProps) {
  const { value: animatedTotal } = useAnimatedValue(currentTotal, 1500);
  const [previousTotal, setPreviousTotal] = useState(currentTotal);
  const [showPulse, setShowPulse] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [amountAdded, setAmountAdded] = useState<number>(0);
  const [showAmountAdded, setShowAmountAdded] = useState(false);

  useEffect(() => {
    if (currentTotal !== previousTotal) {
      setShowPulse(true);

      // Calculate amount added and show it
      const difference = currentTotal - previousTotal;
      if (difference > 0) {
        setAmountAdded(difference);
        setShowAmountAdded(true);

        // Create enhanced particle burst (60-80 particles)
        const newParticles: Particle[] = [];
        const particleCount = Math.floor(Math.random() * 21) + 60; // 60-80 particles
        const accentColors = themeName === 'boysGirlsClub'
          ? ['#2596be', '#30a5d0', '#40b5e0']
          : ['#e24725', '#ff5a3d', '#ff7355'];
        const baseColor = themeName === 'boysGirlsClub' ? '#1b5a7d' : '#1b3664';
        const particleTypes: ('spark' | 'glow' | 'dot')[] = ['spark', 'glow', 'dot'];

        for (let i = 0; i < particleCount; i++) {
          // 70% accent color, 30% base color
          const isAccent = Math.random() < 0.7;
          const color = isAccent
            ? accentColors[Math.floor(Math.random() * accentColors.length)]
            : baseColor;

          // Size variety: Small (2-4px), Medium (4-8px), Large (8-12px)
          const sizeCategory = Math.random();
          let size;
          if (sizeCategory < 0.4) size = Math.random() * 2 + 2; // Small
          else if (sizeCategory < 0.8) size = Math.random() * 4 + 4; // Medium
          else size = Math.random() * 4 + 8; // Large

          // Type distribution: 50% spark, 30% glow, 20% dot
          const typeRand = Math.random();
          let type: 'spark' | 'glow' | 'dot';
          if (typeRand < 0.5) type = 'spark';
          else if (typeRand < 0.8) type = 'glow';
          else type = 'dot';

          newParticles.push({
            id: Date.now() + i,
            x: 100, // Right edge (leading edge of progress bar)
            y: 50,
            angle: (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3,
            velocity: Math.random() * 4 + 2, // 2-6 units
            size,
            color,
            trail: Math.random() < 0.4, // 40% have trails
            type,
            rotationSpeed: Math.random() * 4 - 2,
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
            textShadow: '0 0 15px rgba(255, 255, 255, 0.3), 0 0 30px rgba(43, 117, 181, 0.2), 0 4px 12px rgba(0, 0, 0, 0.5), 2px 2px 0px rgba(0, 0, 0, 0.3)',
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
            textShadow: '0 0 15px rgba(255, 255, 255, 0.3), 0 0 30px rgba(43, 117, 181, 0.2), 0 4px 12px rgba(0, 0, 0, 0.5), 2px 2px 0px rgba(0, 0, 0, 0.3)',
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
          height: 'clamp(30px, 3vmin, 60px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 'clamp(12px, 3vw, 25px)',
          overflow: 'visible',
          border: `2px solid rgba(27, 54, 100, 0.4)`,
          boxShadow: themeName === 'boysGirlsClub'
            ? `
              inset 0 2px 8px rgba(0, 0, 0, 0.5),
              inset 0 -3px 8px rgba(27, 54, 100, 0.3),
              0 0 10px rgba(37, 150, 190, 0.8),
              0 0 20px rgba(37, 150, 190, 0.6),
              0 0 40px rgba(37, 150, 190, 0.4),
              0 0 60px rgba(27, 54, 100, 0.2)
            `
            : `
              inset 0 2px 8px rgba(0, 0, 0, 0.5),
              inset 0 -3px 8px rgba(27, 54, 100, 0.3),
              0 0 10px rgba(226, 71, 37, 0.8),
              0 0 20px rgba(226, 71, 37, 0.6),
              0 0 40px rgba(226, 71, 37, 0.4),
              0 0 60px rgba(27, 54, 100, 0.2)
            `,
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
            backgroundSize: '200% 100%',
            borderRadius: 'clamp(12px, 3vw, 25px)',
            transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: themeName === 'boysGirlsClub'
              ? showPulse
                ? `
                  0 0 8px rgba(37, 150, 190, 0.3),
                  inset 0 0 var(--glow-size, 25px) rgba(48, 165, 208, var(--glow-opacity, 0.5)),
                  inset 0 0 calc(var(--glow-size, 25px) * 0.5) rgba(255, 255, 255, 0.3)
                `
                : `
                  0 0 8px rgba(37, 150, 190, 0.18),
                  inset 0 0 var(--glow-size, 15px) rgba(48, 165, 208, var(--glow-opacity, 0.3)),
                  inset 0 0 calc(var(--glow-size, 15px) * 0.5) rgba(255, 255, 255, 0.3)
                `
              : showPulse
                ? `
                  0 0 8px rgba(226, 71, 37, 0.3),
                  inset 0 0 var(--glow-size, 25px) rgba(255, 90, 61, var(--glow-opacity, 0.5)),
                  inset 0 0 calc(var(--glow-size, 25px) * 0.5) rgba(255, 255, 255, 0.3)
                `
                : `
                  0 0 8px rgba(226, 71, 37, 0.18),
                  inset 0 0 var(--glow-size, 15px) rgba(255, 90, 61, var(--glow-opacity, 0.3)),
                  inset 0 0 calc(var(--glow-size, 15px) * 0.5) rgba(255, 255, 255, 0.3)
                `,
            overflow: 'hidden',
            animation: showPulse
              ? 'gradientSlideHorizontal 4s ease-in-out infinite, innerGlowPulseActive 0.8s ease-out'
              : 'gradientSlideHorizontal 4s ease-in-out infinite, innerGlowPulse 4s ease-in-out infinite',
            transform: 'translateZ(0)',
            willChange: 'width, transform',
          }}
        >
          {progress > 0 && (
            <>
              {/* Layer 1: Diagonal Stripe Pattern (Barber Pole) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: themeName === 'boysGirlsClub'
                    ? `repeating-linear-gradient(
                      45deg,
                      rgba(48, 165, 208, 0.3) 0px,
                      rgba(48, 165, 208, 0.3) 20px,
                      rgba(37, 150, 190, 0.5) 20px,
                      rgba(37, 150, 190, 0.5) 40px
                    )`
                    : `repeating-linear-gradient(
                      45deg,
                      rgba(255, 90, 61, 0.3) 0px,
                      rgba(255, 90, 61, 0.3) 20px,
                      rgba(226, 71, 37, 0.5) 20px,
                      rgba(226, 71, 37, 0.5) 40px
                    )`,
                  backgroundSize: '56.57px 56.57px',
                  animation: 'diagonalStripeFlow 2s linear infinite',
                  opacity: 0.8,
                }}
              />

              {/* Layer 2: Wave Ripple Effect */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `
                    radial-gradient(ellipse 50px 30px at 0% 50%, rgba(255,255,255,0.15), transparent),
                    radial-gradient(ellipse 50px 30px at 100px 50%, rgba(255,255,255,0.15), transparent),
                    radial-gradient(ellipse 50px 30px at 200px 50%, rgba(255,255,255,0.15), transparent),
                    radial-gradient(ellipse 50px 30px at 300px 50%, rgba(255,255,255,0.15), transparent),
                    radial-gradient(ellipse 50px 30px at 400px 50%, rgba(255,255,255,0.15), transparent)
                  `,
                  animation: 'waveFlow 3s linear infinite',
                  opacity: 0.6,
                }}
              />

              {/* Animated Shine Effect */}
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

        {/* Racing Border Light Effect */}
        {progress > 0 && (
          <div
            style={{
              position: 'absolute',
              top: -2,
              left: -2,
              width: `calc(${progress}% + 4px)`,
              height: 'calc(100% + 4px)',
              borderRadius: 'clamp(12px, 3vw, 25px)',
              padding: '2px',
              background: themeName === 'boysGirlsClub'
                ? 'linear-gradient(90deg, transparent, #40b5e0, transparent)'
                : 'linear-gradient(90deg, transparent, #ff8c3c, transparent)',
              backgroundSize: '200% 100%',
              animation: 'borderRace 3s linear infinite',
              WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        )}

        {/* Corner Accent Lights */}
        {progress > 5 && (
          <>
            {/* Top Left */}
            <div
              style={{
                position: 'absolute',
                top: '10%',
                left: '2%',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: themeName === 'boysGirlsClub'
                  ? 'radial-gradient(circle, rgba(255, 255, 255, 1), rgba(64, 181, 224, 0.6))'
                  : 'radial-gradient(circle, rgba(255, 255, 255, 1), rgba(255, 140, 60, 0.6))',
                boxShadow: themeName === 'boysGirlsClub'
                  ? '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(37, 150, 190, 0.6)'
                  : '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(226, 71, 37, 0.6)',
                animation: 'cornerPulse 2s ease-in-out infinite',
                zIndex: 10,
              }}
            />
            {/* Top Right */}
            <div
              style={{
                position: 'absolute',
                top: '10%',
                right: '2%',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: themeName === 'boysGirlsClub'
                  ? 'radial-gradient(circle, rgba(255, 255, 255, 1), rgba(64, 181, 224, 0.6))'
                  : 'radial-gradient(circle, rgba(255, 255, 255, 1), rgba(255, 140, 60, 0.6))',
                boxShadow: themeName === 'boysGirlsClub'
                  ? '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(37, 150, 190, 0.6)'
                  : '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(226, 71, 37, 0.6)',
                animation: 'cornerPulse 2s ease-in-out infinite 0.5s',
                zIndex: 10,
              }}
            />
            {/* Bottom Left */}
            <div
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '2%',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: themeName === 'boysGirlsClub'
                  ? 'radial-gradient(circle, rgba(255, 255, 255, 1), rgba(64, 181, 224, 0.6))'
                  : 'radial-gradient(circle, rgba(255, 255, 255, 1), rgba(255, 140, 60, 0.6))',
                boxShadow: themeName === 'boysGirlsClub'
                  ? '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(37, 150, 190, 0.6)'
                  : '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(226, 71, 37, 0.6)',
                animation: 'cornerPulse 2s ease-in-out infinite 1s',
                zIndex: 10,
              }}
            />
            {/* Bottom Right */}
            <div
              style={{
                position: 'absolute',
                bottom: '10%',
                right: '2%',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: themeName === 'boysGirlsClub'
                  ? 'radial-gradient(circle, rgba(255, 255, 255, 1), rgba(64, 181, 224, 0.6))'
                  : 'radial-gradient(circle, rgba(255, 255, 255, 1), rgba(255, 140, 60, 0.6))',
                boxShadow: themeName === 'boysGirlsClub'
                  ? '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(37, 150, 190, 0.6)'
                  : '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(226, 71, 37, 0.6)',
                animation: 'cornerPulse 2s ease-in-out infinite 1.5s',
                zIndex: 10,
              }}
            />
          </>
        )}

        {/* Pulsing Border on Updates */}
        {showPulse && (
          <div
            style={{
              position: 'absolute',
              top: -2,
              left: -2,
              width: `calc(${progress}% + 4px)`,
              height: 'calc(100% + 4px)',
              borderRadius: 'clamp(12px, 3vw, 25px)',
              animation: 'borderPulseExpand 1s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          />
        )}

        {/* Enhanced Particle Burst */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderRadius: particle.type === 'spark' ? '2px' : '50%',
              background: particle.color,
              boxShadow: particle.trail
                ? `0 0 8px ${particle.color}, -5px 0 15px ${particle.color}, -10px 0 20px ${particle.color}`
                : particle.type === 'glow'
                ? `0 0 15px ${particle.color}, 0 0 25px ${particle.color}`
                : `0 0 10px ${particle.color}`,
              filter: particle.trail ? 'blur(1.5px)' : particle.type === 'glow' ? 'blur(2px)' : 'none',
              animation: 'particleBurst 1.5s ease-out forwards',
              transform: `translate(-50%, -50%) rotate(${particle.angle}rad) translateX(${particle.velocity * 20}px)`,
              opacity: 0,
              willChange: 'transform, opacity',
              contain: 'layout style paint',
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
              ? '0 0 25px rgba(255, 255, 255, 0.4), 0 0 40px rgba(43, 117, 181, 0.3), 0 4px 15px rgba(0, 0, 0, 0.5), 3px 3px 0px rgba(0, 0, 0, 0.5), -1px -1px 0px rgba(43, 117, 181, 0.3)'
              : '0 0 15px rgba(255, 255, 255, 0.3), 0 0 25px rgba(43, 117, 181, 0.2), 0 4px 12px rgba(0, 0, 0, 0.5), 2px 2px 0px rgba(0, 0, 0, 0.5)',
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
              color: themeName === 'modern' ? '#e24725' : themeName === 'boysGirlsClub' ? '#2596be' : '#fbbf24',
              textShadow: themeName === 'modern'
                ? '0 0 30px rgba(226, 71, 37, 0.4), 0 4px 12px rgba(0, 0, 0, 0.4)'
                : themeName === 'boysGirlsClub'
                ? '0 0 30px rgba(37, 150, 190, 0.4), 0 4px 12px rgba(0, 0, 0, 0.4)'
                : '0 0 30px rgba(251, 191, 36, 0.4), 0 4px 12px rgba(0, 0, 0, 0.4)',
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
            textShadow: '0 0 15px rgba(255, 255, 255, 0.3), 0 0 25px rgba(43, 117, 181, 0.2), 0 4px 10px rgba(0, 0, 0, 0.5), 2px 2px 0px rgba(0, 0, 0, 0.3)',
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

          /* Reduced Motion Support */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </div>
  );
}
