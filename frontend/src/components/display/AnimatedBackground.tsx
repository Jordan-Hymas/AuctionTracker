interface AnimatedBackgroundProps {
  themeName?: string;
}

export default function AnimatedBackground({ themeName = 'classic' }: AnimatedBackgroundProps) {
  // Floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
  }));

  // Theme-specific background colors
  const getBackgroundGradient = () => {
    switch (themeName) {
      case 'boysGirlsClub':
        return 'linear-gradient(45deg, #D6EAF8, #85C1E9, #5DADE2, #3498DB, #D6EAF8)';
      case 'classic':
        return 'linear-gradient(45deg, #1e3a8a, #3b82f6, #7c3aed, #ec4899)';
      case 'elegant':
        return 'linear-gradient(45deg, #5b21b6, #7c3aed, #a78bfa, #c4b5fd)';
      case 'vibrant':
        return 'linear-gradient(45deg, #ec4899, #f59e0b, #10b981, #3b82f6)';
      case 'dark':
        return 'linear-gradient(45deg, #111827, #1f2937, #374151, #111827)';
      default:
        return 'linear-gradient(45deg, #1e3a8a, #3b82f6, #7c3aed, #ec4899)';
    }
  };

  return (
    <>
      {/* Animated Gradient Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -2,
          background: getBackgroundGradient(),
          backgroundSize: '400% 400%',
          animation: 'gradientShift 25s ease-in-out infinite',
        }}
      />

      {/* Overlay Pattern */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          opacity: 0.1,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,.05) 10px,
            rgba(255,255,255,.05) 20px
          )`,
          animation: 'patternSlide 20s linear infinite',
        }}
      />

      {/* Floating Particles */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.left}%`,
              bottom: '-10%',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.6)',
              animation: `floatUp ${particle.duration}s linear infinite`,
              animationDelay: `${particle.delay}s`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background:
            themeName === 'boysGirlsClub'
              ? 'radial-gradient(circle, rgba(0, 133, 202, 0.4), transparent)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent)',
          filter: 'blur(60px)',
          animation: 'pulse 8s ease-in-out infinite',
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '20%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background:
            themeName === 'boysGirlsClub'
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent)'
              : 'radial-gradient(circle, rgba(236, 72, 153, 0.3), transparent)',
          filter: 'blur(80px)',
          animation: 'pulse 10s ease-in-out infinite reverse',
          zIndex: -1,
        }}
      />
    </>
  );
}
