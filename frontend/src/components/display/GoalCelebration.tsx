import { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

interface GoalCelebrationProps {
  themeName: 'boysGirlsClub' | 'modern' | 'modernDots';
  currentTotal: number;
  onDismiss?: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
  duration: number;
  color: string;
  shape: 'square' | 'circle' | 'rectangle' | 'star';
  wobble: number;
}

interface FireworkBurst {
  id: number;
  x: number;
  y: number;
  delay: number;
  particles: {
    angle: number;
    velocity: number;
    size: number;
    color: string;
  }[];
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

// Theme color palette selector
const getColorPalette = (theme: string): string[] => {
  const palettes: Record<string, string[]> = {
    boysGirlsClub: ['#2596be', '#30a5d0', '#40b5e0', '#1b5a7d', '#FFFFFF', '#FFD700'],
    modern: ['#e24725', '#ff5a3d', '#ff7355', '#1b3664', '#FFFFFF', '#FFD700'],
    modernDots: ['#0f172a', '#06b6d4', '#FFD700', '#FFFFFF', '#e2e8f0'],
  };
  return palettes[theme] || palettes.modern;
};

// Generate 250 confetti with varied properties
const generateConfetti = (count: number, colors: string[]): ConfettiPiece[] => {
  const shapes: ('square' | 'circle' | 'rectangle' | 'star')[] = ['square', 'circle', 'rectangle', 'star'];
  const shapeWeights = [0.5, 0.25, 0.15, 0.1]; // 50% squares, 25% circles, 15% rectangles, 10% stars

  const getRandomShape = (): 'square' | 'circle' | 'rectangle' | 'star' => {
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < shapes.length; i++) {
      cumulative += shapeWeights[i];
      if (random < cumulative) return shapes[i];
    }
    return 'square';
  };

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10,
    size: Math.random() * 8 + 6, // 6-14px
    rotation: Math.random() * 360,
    delay: i < 100 ? Math.random() * 0.5 : Math.random() * 2 + 0.5,
    duration: Math.random() * 3 + 4, // 4-7s
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: getRandomShape(),
    wobble: (Math.random() - 0.5) * 60, // -30 to +30px
  }));
};

// Generate 5 firework bursts with 35 particles each
const generateFireworks = (burstCount: number, colors: string[]): FireworkBurst[] => {
  const positions = [
    { x: 20, y: 20 },   // top-left
    { x: 80, y: 20 },   // top-right
    { x: 50, y: 50 },   // center
    { x: 20, y: 80 },   // bottom-left
    { x: 80, y: 80 },   // bottom-right
  ];
  const delays = [0.5, 1.2, 1.8, 2.3, 3.0];

  return positions.slice(0, burstCount).map((pos, i) => ({
    id: i,
    x: pos.x,
    y: pos.y,
    delay: delays[i],
    particles: Array.from({ length: 35 }, (_, j) => ({
      angle: (j / 35) * Math.PI * 2,
      velocity: Math.random() * 200 + 100,
      size: Math.random() * 6 + 4,
      color: Math.random() < 0.8
        ? colors[Math.floor(Math.random() * colors.length)]
        : Math.random() < 0.5 ? '#FFFFFF' : '#FFD700',
    })),
  }));
};

// Generate 50 sparkle stars at random positions
const generateSparkles = (count: number): Sparkle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,   // 5-95%
    y: Math.random() * 80 + 10,  // 10-90%
    size: Math.random() * 12 + 6,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
  }));
};

// Get theme-specific text gradient
const getTextGradient = (theme: string): string => {
  const gradients: Record<string, string> = {
    boysGirlsClub: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    modern: 'linear-gradient(135deg, #e24725 0%, #ff8c3c 100%)',
    modernDots: 'linear-gradient(135deg, #06b6d4 0%, #FFD700 100%)',
  };
  return gradients[theme] || gradients.modern;
};

export default function GoalCelebration({ themeName, currentTotal, onDismiss }: GoalCelebrationProps) {
  // Get theme color palette
  const colors = useMemo(() => getColorPalette(themeName), [themeName]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate particles (memoized for performance)
  const confetti = useMemo(() => generateConfetti(250, colors), [colors]);
  const fireworks = useMemo(() => generateFireworks(5, colors), [colors]);
  const sparkles = useMemo(() => generateSparkles(50), []);

  // Phase management
  const [phase, setPhase] = useState<'burst' | 'confetti' | 'sustained' | 'loop'>('burst');

  // Phase transitions
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('confetti'), 500),
      setTimeout(() => setPhase('sustained'), 3000),
      setTimeout(() => setPhase('loop'), 10000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Cleanup will-change after 15s
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.confetti-piece, .firework-particle, .sparkle').forEach(el => {
        (el as HTMLElement).style.willChange = 'auto';
      });
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const textGradient = getTextGradient(themeName);

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 9999,
        pointerEvents: 'none',
        cursor: 'default',
      }}
    >
      {/* Screen Flash */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4), rgba(255, 255, 255, 0.2))',
          animation: 'flashFade 0.4s ease-out forwards',
          zIndex: 10000,
          pointerEvents: 'none',
        }}
      />

      {/* Radial Glow Pulses */}
      {[0.1, 1.5, 3.0].map((delay, i) => (
        <div
          key={`pulse-${i}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200px',
            height: '200px',
            marginLeft: '-100px',
            marginTop: '-100px',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4), transparent)',
            filter: 'blur(40px)',
            animation: `radialPulse 2s ease-out ${delay}s forwards`,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Confetti Layer */}
      {confetti.map((piece) => (
        <div
          key={`confetti-${piece.id}`}
          className="confetti-piece"
          style={{
            position: 'absolute',
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: piece.shape === 'rectangle' ? `${piece.size * 1.5}px` : `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: piece.shape === 'circle' ? '50%' : '0',
            clipPath: piece.shape === 'star'
              ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
              : 'none',
            transform: `translateZ(0) rotate(${piece.rotation}deg)`,
            animation: `confettiFallFullScreen ${piece.duration}s linear ${piece.delay}s infinite`,
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            zIndex: 10000,
            pointerEvents: 'none',
            ['--wobble' as string]: `${piece.wobble}px`,
          }}
        />
      ))}

      {/* Firework Bursts */}
      {fireworks.map((burst) => (
        <div
          key={`burst-${burst.id}`}
          style={{
            position: 'absolute',
            left: `${burst.x}%`,
            top: `${burst.y}%`,
            width: '1px',
            height: '1px',
            zIndex: 10001,
            pointerEvents: 'none',
          }}
        >
          {burst.particles.map((particle, j) => {
            const dx = Math.cos(particle.angle) * particle.velocity;
            const dy = Math.sin(particle.angle) * particle.velocity;
            return (
              <div
                key={`particle-${j}`}
                className="firework-particle"
                style={{
                  position: 'absolute',
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  borderRadius: '50%',
                  transform: 'translateZ(0)',
                  animation: `fireworkBurst 1.2s ease-out ${burst.delay}s forwards`,
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  pointerEvents: 'none',
                  ['--dx' as string]: `${dx}px`,
                  ['--dy' as string]: `${dy}px`,
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Star Sparkles */}
      {sparkles.map((sparkle) => (
        <div
          key={`sparkle-${sparkle.id}`}
          className="sparkle"
          style={{
            position: 'absolute',
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            backgroundColor: '#FFD700',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            transform: 'translateZ(0)',
            animation: `starSparkle ${sparkle.duration}s ease-in-out ${sparkle.delay}s infinite`,
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            zIndex: 10001,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Border Light Chasing (sustained and loop phases) */}
      {(phase === 'sustained' || phase === 'loop') && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '8px solid transparent',
            borderImage: 'linear-gradient(90deg, transparent, #FFD700, transparent) 1',
            animation: 'borderChase 3s linear infinite',
            zIndex: 10001,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* "GOAL REACHED!" Text Container */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(1rem, 3vmin, 3rem)',
          zIndex: 10002,
          pointerEvents: 'none',
          animation: 'goalTextEntrance 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* "GOAL REACHED!" Text */}
        <div
          style={{
            fontSize: 'clamp(4rem, 18vmin, 22rem)',
            fontWeight: '800',
            fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            textAlign: 'center',
            background: textGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 215, 0, 0.6), 0 0 120px rgba(255, 215, 0, 0.4), 0 8px 30px rgba(0, 0, 0, 0.5)',
            WebkitTextStroke: '2px rgba(0, 0, 0, 0.3)',
            animation: 'textPulse 2s ease-in-out 1.2s infinite',
            whiteSpace: 'nowrap',
          }}
        >
          GOAL REACHED!
        </div>

        {/* Total Amount Raised */}
        <div
          style={{
            fontSize: 'clamp(3rem, 12vmin, 16rem)',
            fontWeight: '700',
            fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '0.01em',
            textAlign: 'center',
            color: '#ffffff',
            textShadow: '0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 215, 0, 0.6), 0 0 100px rgba(255, 215, 0, 0.4), 0 6px 20px rgba(0, 0, 0, 0.6)',
            WebkitTextStroke: '1.5px rgba(0, 0, 0, 0.2)',
            animation: 'amountPulse 2.5s ease-in-out 1.4s infinite',
            whiteSpace: 'nowrap',
          }}
        >
          {formatCurrency(currentTotal)}
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          /* Screen Flash */
          @keyframes flashFade {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }

          /* Radial Pulse */
          @keyframes radialPulse {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(15);
              opacity: 0;
            }
          }

          /* Confetti Fall */
          @keyframes confettiFallFullScreen {
            0% {
              transform: translateY(-10vh) translateX(0) rotateZ(0deg) rotateY(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(110vh) translateX(var(--wobble)) rotateZ(1080deg) rotateY(720deg);
              opacity: 0;
            }
          }

          /* Firework Burst */
          @keyframes fireworkBurst {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            70% {
              opacity: 1;
            }
            100% {
              transform: translate(var(--dx), var(--dy)) scale(0);
              opacity: 0;
            }
          }

          /* Star Sparkle */
          @keyframes starSparkle {
            0% {
              opacity: 0;
              transform: scale(0) rotate(0deg);
            }
            25% {
              opacity: 1;
              transform: scale(1) rotate(180deg);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.2) rotate(360deg);
            }
            75% {
              opacity: 1;
              transform: scale(1) rotate(540deg);
            }
            100% {
              opacity: 0;
              transform: scale(0) rotate(720deg);
            }
          }

          /* Border Chase */
          @keyframes borderChase {
            0% {
              border-image: linear-gradient(90deg, #FFD700 0%, transparent 50%, transparent 100%) 1;
            }
            25% {
              border-image: linear-gradient(180deg, #FFD700 0%, transparent 50%, transparent 100%) 1;
            }
            50% {
              border-image: linear-gradient(270deg, #FFD700 0%, transparent 50%, transparent 100%) 1;
            }
            75% {
              border-image: linear-gradient(0deg, #FFD700 0%, transparent 50%, transparent 100%) 1;
            }
            100% {
              border-image: linear-gradient(90deg, #FFD700 0%, transparent 50%, transparent 100%) 1;
            }
          }

          /* Goal Text Entrance */
          @keyframes goalTextEntrance {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.3) rotateX(90deg);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.15) rotateX(0deg);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1) rotateX(0deg);
            }
          }

          /* Text Pulse */
          @keyframes textPulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          /* Amount Pulse */
          @keyframes amountPulse {
            0%, 100% {
              transform: scale(1);
              text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 215, 0, 0.6), 0 0 100px rgba(255, 215, 0, 0.4), 0 6px 20px rgba(0, 0, 0, 0.6);
            }
            50% {
              transform: scale(1.08);
              text-shadow: 0 0 40px rgba(255, 255, 255, 1), 0 0 80px rgba(255, 215, 0, 0.8), 0 0 120px rgba(255, 215, 0, 0.6), 0 8px 25px rgba(0, 0, 0, 0.7);
            }
          }

          /* Reduced Motion Support */
          @media (prefers-reduced-motion: reduce) {
            .confetti-piece,
            .firework-particle,
            .sparkle,
            div[style*="goalTextEntrance"] {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
      </style>
    </div>,
    document.body
  );
}
