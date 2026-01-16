import { useMemo } from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';
import LogoDisplay from './LogoDisplay';

interface GoalReachedDisplayProps {
  displayTotal: number;
  message: string | null;
  themeName: string;
  primaryColor: string;
  secondaryColor: string;
  logoPath: string | null;
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
  shape: 'square' | 'circle' | 'rectangle';
  wobble: number;
}

// Theme color palette selector
const getColorPalette = (theme: string): string[] => {
  const palettes: Record<string, string[]> = {
    boysGirlsClub: ['#2596be', '#30a5d0', '#40b5e0', '#1b5a7d', '#FFFFFF'],
    modern: ['#e24725', '#ff5a3d', '#ff7355', '#1b3664', '#FFFFFF'],
    modernDots: ['#0f172a', '#06b6d4', '#FFFFFF', '#e2e8f0'],
  };
  return palettes[theme] || palettes.modern;
};

// Generate confetti with varied properties
const generateConfetti = (count: number, colors: string[]): ConfettiPiece[] => {
  const shapes: ('square' | 'circle' | 'rectangle')[] = ['square', 'circle', 'rectangle'];
  const shapeWeights = [0.6, 0.3, 0.1]; // 60% squares, 30% circles, 10% rectangles

  const getRandomShape = (): 'square' | 'circle' | 'rectangle' => {
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
    y: -10 - (i % 10) * 15, // Stagger starting heights
    size: Math.random() * 10 + 12, // 12-22px
    rotation: Math.random() * 360,
    delay: (i / count) * 4, // Spread out over 4 seconds
    duration: 4 + Math.random() * 2, // 4-6 seconds (faster!)
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: getRandomShape(),
    wobble: 0,
  }));
};

export default function GoalReachedDisplay({ displayTotal, message, themeName, primaryColor, secondaryColor, logoPath }: GoalReachedDisplayProps) {
  const { value } = useAnimatedValue(displayTotal, 1500);

  // Get theme color palette and generate confetti
  const colors = useMemo(() => getColorPalette(themeName), [themeName]);
  const confetti = useMemo(() => generateConfetti(120, colors), [colors]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Use theme colors - same as TotalDisplay
  const textShadow = themeName === 'boysGirlsClub'
    ? '0 0 30px rgba(37, 150, 190, 0.25), 0 0 60px rgba(37, 150, 190, 0.15), 0 4px 20px rgba(0, 0, 0, 0.2)'
    : '0 4px 20px rgba(37, 99, 235, 0.12)';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(3rem, 6vw, 10rem)',
        padding: 'clamp(2rem, 4vw, 6rem)',
        paddingTop: logoPath ? 'clamp(10rem, 15vh, 20rem)' : 'clamp(2rem, 4vw, 6rem)',
        zIndex: 10,
        animation: 'fadeIn 0.8s ease-out forwards',
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes confettiFall {
            from {
              transform: translateY(0) rotate(0deg);
            }
            to {
              transform: translateY(120vh) rotate(720deg);
            }
          }
        `}
      </style>

      {/* Confetti Layer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 100,
          overflow: 'hidden',
        }}
      >
        {confetti.map((piece) => (
          <div
            key={piece.id}
            style={{
              position: 'absolute',
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              width: piece.shape === 'rectangle' ? `${piece.size * 1.8}px` : `${piece.size}px`,
              height: piece.shape === 'rectangle' ? `${piece.size * 0.6}px` : `${piece.size}px`,
              backgroundColor: piece.color,
              borderRadius: piece.shape === 'circle' ? '50%' : '2px',
              animation: `confettiFall ${piece.duration}s linear ${piece.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Logo at the top if it exists */}
      {logoPath && (
        <div
          style={{
            position: 'fixed',
            top: 'clamp(1rem, 2vh, 2rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'fadeIn 1s ease-out',
            zIndex: 200,
          }}
        >
          <LogoDisplay logoUrl={logoPath} />
        </div>
      )}

      {message && (
        <div
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 8rem)',
            fontWeight: '700',
            textAlign: 'center',
            maxWidth: '85%',
            color: primaryColor,
            lineHeight: '1.2',
            letterSpacing: '-0.01em',
            textShadow: textShadow,
            zIndex: 200,
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(1.5rem, 3vw, 4rem)',
          zIndex: 200,
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 'clamp(2rem, 4vw, 5rem)',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#6b7280',
            marginBottom: 'clamp(1rem, 2vw, 2rem)',
          }}
        >
          Total Raised
        </div>

        {/* Amount - Uses secondary color (orange for modern theme) */}
        <div
          style={{
            fontSize: 'clamp(8rem, 18vw, 32rem)',
            fontWeight: '900',
            lineHeight: '1',
            color: secondaryColor,
            textShadow: `${textShadow}, 0 0 40px ${secondaryColor}40, 0 0 80px ${secondaryColor}20`,
            letterSpacing: '-0.02em',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {formatCurrency(value)}
        </div>
      </div>
    </div>
  );
}
