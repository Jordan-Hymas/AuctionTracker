interface AnimatedBackgroundProps {
  themeName?: string;
  customBackgroundUrl?: string | null;
}

export default function AnimatedBackground({ themeName: themeNameProp = 'boysGirlsClub', customBackgroundUrl }: AnimatedBackgroundProps) {
  const themeName = (themeNameProp === 'NPCE' || themeNameProp === 'modern' || themeNameProp === 'modernDots')
    ? 'modern'
    : themeNameProp;

  // Floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
  }));

  // Snowflakes for winter theme - increased count for heavier snow
  const snowflakes = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 1,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: Math.random() * 10 + 8,
    opacity: Math.random() * 0.7 + 0.3,
    drift: Math.random() * 60 - 30, // Wind drift amount
  }));

  // Theme-specific background colors
  const getBackgroundGradient = () => {
    switch (themeName) {
      case 'boysGirlsClub':
        return 'linear-gradient(45deg, #D6EAF8, #85C1E9, #5DADE2, #3498DB, #D6EAF8)';
      default:
        return 'linear-gradient(45deg, #D6EAF8, #85C1E9, #5DADE2, #3498DB, #D6EAF8)';
    }
  };

  return (
    <>
      {/* Animated Gradient Background */}
      {themeName === 'custom' ? (
        customBackgroundUrl ? (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -2,
                backgroundImage: `url(${customBackgroundUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Subtle dark overlay for text readability */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                background: 'rgba(0, 0, 0, 0.15)',
                pointerEvents: 'none',
              }}
            />
          </>
        ) : (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -2,
              background: '#1a1a2e',
            }}
          />
        )
      ) : themeName === 'winter' ? (
        <>
          {/* Winter background image */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -2,
              backgroundImage: 'url(/Background/winterBackground.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
                    {/* Ice shimmer overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              background: `
                radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 30%),
                radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 25%),
                radial-gradient(ellipse at 50% 90%, rgba(200,230,255,0.08) 0%, transparent 20%)
              `,
              animation: 'iceShimmer 6s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
          {/* Frost particles */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              background: `
                radial-gradient(circle at 10% 20%, rgba(255,255,255,0.6) 0%, transparent 1px),
                radial-gradient(circle at 30% 10%, rgba(255,255,255,0.5) 0%, transparent 1px),
                radial-gradient(circle at 70% 15%, rgba(255,255,255,0.7) 0%, transparent 1px),
                radial-gradient(circle at 90% 25%, rgba(255,255,255,0.4) 0%, transparent 1px),
                radial-gradient(circle at 15% 50%, rgba(255,255,255,0.5) 0%, transparent 1px),
                radial-gradient(circle at 85% 55%, rgba(255,255,255,0.6) 0%, transparent 1px),
                radial-gradient(circle at 25% 80%, rgba(255,255,255,0.4) 0%, transparent 1px),
                radial-gradient(circle at 75% 85%, rgba(255,255,255,0.5) 0%, transparent 1px)
              `,
              animation: 'frostSparkle 3s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        </>
      ) : themeName === 'modern' || themeName === 'boysGirlsClub' ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -2,
            background: '#ffffff',
          }}
        />
      ) : themeName === 'modernDots' ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -2,
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
          }}
        />
      ) : (
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
      )}

      {/* Overlay Pattern */}
      {themeName === 'custom' ? null : themeName === 'modern' ? (
        <>
          {/* Left side - Orange vertical stripes (6 lines) */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              background: `linear-gradient(
                90deg,
                rgba(226, 71, 37, 0.30) 0px,
                rgba(240, 85, 50, 0.35) 40px,
                rgba(226, 71, 37, 0.30) 80px,
                rgba(255, 255, 255, 0.25) 80px,
                rgba(255, 255, 255, 0.25) 83px,
                rgba(217, 61, 31, 0.26) 83px,
                rgba(235, 75, 45, 0.30) 123px,
                rgba(217, 61, 31, 0.26) 163px,
                rgba(255, 255, 255, 0.22) 163px,
                rgba(255, 255, 255, 0.22) 166px,
                rgba(226, 71, 37, 0.22) 166px,
                rgba(255, 96, 64, 0.26) 206px,
                rgba(226, 71, 37, 0.22) 246px,
                rgba(255, 255, 255, 0.18) 246px,
                rgba(255, 255, 255, 0.18) 249px,
                rgba(229, 77, 42, 0.18) 249px,
                rgba(235, 85, 48, 0.22) 289px,
                rgba(229, 77, 42, 0.18) 329px,
                rgba(255, 255, 255, 0.14) 329px,
                rgba(255, 255, 255, 0.14) 332px,
                rgba(220, 64, 32, 0.14) 332px,
                rgba(232, 90, 53, 0.18) 372px,
                rgba(220, 64, 32, 0.14) 412px,
                rgba(255, 255, 255, 0.10) 412px,
                rgba(255, 255, 255, 0.10) 415px,
                rgba(226, 71, 37, 0.10) 415px,
                rgba(240, 82, 48, 0.14) 455px,
                rgba(226, 71, 37, 0.10) 495px,
                transparent 495px
              )`,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0) 100%)',
            }}
          />
          {/* Right side - Navy blue vertical stripes (6 lines) */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              background: `linear-gradient(
                270deg,
                rgba(27, 54, 100, 0.24) 0px,
                rgba(35, 64, 118, 0.27) 40px,
                rgba(27, 54, 100, 0.24) 80px,
                rgba(255, 255, 255, 0.25) 80px,
                rgba(255, 255, 255, 0.25) 83px,
                rgba(21, 44, 82, 0.19) 83px,
                rgba(29, 58, 106, 0.22) 123px,
                rgba(21, 44, 82, 0.19) 163px,
                rgba(255, 255, 255, 0.22) 163px,
                rgba(255, 255, 255, 0.22) 166px,
                rgba(27, 54, 100, 0.15) 166px,
                rgba(31, 61, 112, 0.18) 206px,
                rgba(27, 54, 100, 0.15) 246px,
                rgba(255, 255, 255, 0.18) 246px,
                rgba(255, 255, 255, 0.18) 249px,
                rgba(29, 58, 106, 0.11) 249px,
                rgba(26, 52, 96, 0.14) 289px,
                rgba(29, 58, 106, 0.11) 329px,
                rgba(255, 255, 255, 0.14) 329px,
                rgba(255, 255, 255, 0.14) 332px,
                rgba(23, 48, 90, 0.07) 332px,
                rgba(32, 57, 106, 0.10) 372px,
                rgba(23, 48, 90, 0.07) 412px,
                rgba(255, 255, 255, 0.10) 412px,
                rgba(255, 255, 255, 0.10) 415px,
                rgba(27, 54, 100, 0.04) 415px,
                rgba(29, 57, 104, 0.06) 455px,
                rgba(27, 54, 100, 0.04) 495px,
                transparent 495px
              )`,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0) 100%)',
            }}
          />
        </>
      ) : themeName === 'boysGirlsClub' ? (
        <>
          {/* Left side - Boys & Girls Club blue vertical stripes (6 lines) */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              background: `linear-gradient(
                90deg,
                rgba(37, 150, 190, 0.30) 0px,
                rgba(45, 160, 200, 0.35) 40px,
                rgba(37, 150, 190, 0.30) 80px,
                rgba(255, 255, 255, 0.25) 80px,
                rgba(255, 255, 255, 0.25) 83px,
                rgba(30, 140, 180, 0.26) 83px,
                rgba(40, 155, 195, 0.30) 123px,
                rgba(30, 140, 180, 0.26) 163px,
                rgba(255, 255, 255, 0.22) 163px,
                rgba(255, 255, 255, 0.22) 166px,
                rgba(37, 150, 190, 0.22) 166px,
                rgba(42, 158, 198, 0.26) 206px,
                rgba(37, 150, 190, 0.22) 246px,
                rgba(255, 255, 255, 0.18) 246px,
                rgba(255, 255, 255, 0.18) 249px,
                rgba(35, 148, 188, 0.18) 249px,
                rgba(40, 155, 195, 0.22) 289px,
                rgba(35, 148, 188, 0.18) 329px,
                rgba(255, 255, 255, 0.14) 329px,
                rgba(255, 255, 255, 0.14) 332px,
                rgba(32, 145, 185, 0.14) 332px,
                rgba(38, 152, 192, 0.18) 372px,
                rgba(32, 145, 185, 0.14) 412px,
                rgba(255, 255, 255, 0.10) 412px,
                rgba(255, 255, 255, 0.10) 415px,
                rgba(37, 150, 190, 0.10) 415px,
                rgba(40, 155, 195, 0.14) 455px,
                rgba(37, 150, 190, 0.10) 495px,
                transparent 495px
              )`,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 80%, rgba(0,0,0,0.5) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 80%, rgba(0,0,0,0.5) 100%)',
            }}
          />
          {/* Right side - Boys & Girls Club blue vertical stripes (6 lines) */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              background: `linear-gradient(
                270deg,
                rgba(37, 150, 190, 0.30) 0px,
                rgba(45, 160, 200, 0.35) 40px,
                rgba(37, 150, 190, 0.30) 80px,
                rgba(255, 255, 255, 0.25) 80px,
                rgba(255, 255, 255, 0.25) 83px,
                rgba(30, 140, 180, 0.26) 83px,
                rgba(40, 155, 195, 0.30) 123px,
                rgba(30, 140, 180, 0.26) 163px,
                rgba(255, 255, 255, 0.22) 163px,
                rgba(255, 255, 255, 0.22) 166px,
                rgba(37, 150, 190, 0.22) 166px,
                rgba(42, 158, 198, 0.26) 206px,
                rgba(37, 150, 190, 0.22) 246px,
                rgba(255, 255, 255, 0.18) 246px,
                rgba(255, 255, 255, 0.18) 249px,
                rgba(35, 148, 188, 0.18) 249px,
                rgba(38, 152, 192, 0.22) 289px,
                rgba(35, 148, 188, 0.18) 329px,
                rgba(255, 255, 255, 0.14) 329px,
                rgba(255, 255, 255, 0.14) 332px,
                rgba(32, 145, 185, 0.14) 332px,
                rgba(40, 155, 195, 0.18) 372px,
                rgba(32, 145, 185, 0.14) 412px,
                rgba(255, 255, 255, 0.10) 412px,
                rgba(255, 255, 255, 0.10) 415px,
                rgba(37, 150, 190, 0.10) 415px,
                rgba(40, 155, 195, 0.14) 455px,
                rgba(37, 150, 190, 0.10) 495px,
                transparent 495px
              )`,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 80%, rgba(0,0,0,0.5) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 80%, rgba(0,0,0,0.5) 100%)',
            }}
          />
        </>
      ) : themeName === 'modernDots' ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            background: 'radial-gradient(circle, rgba(15, 23, 42, 0.08) 2.5px, transparent 2.5px)',
            backgroundSize: '24px 24px',
            opacity: 1,
            animation: 'patternSlide 20s linear infinite',
          }}
        />
      ) : (
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
      )}

      {/* Floating Particles */}
      {themeName === 'custom' ? null : themeName === 'winter' ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              style={{
                position: 'absolute',
                left: `${flake.left}%`,
                top: '-5%',
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.95)',
                opacity: flake.opacity,
                animation: `snowfallWithWind ${flake.duration}s linear infinite`,
                animationDelay: `${flake.delay}s`,
                boxShadow: '0 0 6px rgba(255, 255, 255, 0.9), 0 0 12px rgba(200, 230, 255, 0.5)',
                // @ts-ignore
                '--drift': `${flake.drift}px`,
              }}
            />
          ))}
        </div>
      ) : themeName === 'modernDots' ? (
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
            opacity: 0.02,
          }}
        >
          {particles.slice(0, 3).map((particle) => (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${particle.left}%`,
                bottom: '-10%',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.6)',
                animation: `floatUp ${particle.duration}s linear infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>
      ) : themeName !== 'modern' && themeName !== 'winter' && themeName !== 'custom' && (
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
      )}

      {/* Glowing Orbs */}
      {themeName !== 'modern' && themeName !== 'winter' && themeName !== 'custom' && (
        <>
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
                  ? 'radial-gradient(circle, rgba(0, 133, 202, 0.35), transparent)'
                  : 'radial-gradient(circle, rgba(236, 72, 153, 0.3), transparent)',
              filter: 'blur(80px)',
              animation: 'pulse 10s ease-in-out infinite reverse',
              zIndex: -1,
            }}
          />
        </>
      )}
    </>
  );
}
