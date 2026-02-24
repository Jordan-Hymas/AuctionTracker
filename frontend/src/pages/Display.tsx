import { useAuction } from '../context/AuctionContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Bid } from '../types/bid';
import TotalDisplay from '../components/display/TotalDisplay';
import GoalDisplay from '../components/display/GoalDisplay';
import LogoDisplay from '../components/display/LogoDisplay';
import PaddleNumberDisplay from '../components/display/PaddleNumberDisplay';
import AnimatedBackground from '../components/display/AnimatedBackground';
import GoalReachedDisplay from '../components/display/GoalReachedDisplay';
import { generateThermometerGradient, hexToRgba, darkenColor, lightenColor } from '../utils/colorUtils';

export default function Display() {
  const { currentTotal, goalAmount, startingTotal, lastBid, settings, isLoading } = useAuction();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Displayed total: advances only when a paddle is shown from the queue ──
  // This keeps the total and progress bar in sync with the paddle animation
  // instead of jumping ahead the moment a bid arrives from the server.
  const [displayedTotal, setDisplayedTotal] = useState(0);
  const hasInitialized = useRef(false);
  const prevTotalRef   = useRef(0);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiActiveRef = useRef(false);
  const wasAt100Ref       = useRef(false);
  const confettiPiecesRef = useRef<{
    id: number; x: number; y: number; size: number;
    delay: number; duration: number; color: string;
    shape: 'square' | 'circle' | 'rectangle';
  }[] | null>(null);

  // One-time initialization once the context finishes loading
  useEffect(() => {
    if (isLoading || hasInitialized.current) return;
    setDisplayedTotal(currentTotal);
    prevTotalRef.current = currentTotal;
    hasInitialized.current = true;
  }, [isLoading, currentTotal]);

  // Undo / reset: if the true total ever drops, sync down immediately
  useEffect(() => {
    if (!hasInitialized.current) return;
    if (currentTotal < prevTotalRef.current) {
      setDisplayedTotal(prev => Math.min(prev, currentTotal));
    }
    prevTotalRef.current = currentTotal;
  }, [currentTotal]);

  // Called by PaddleNumberDisplay the instant a queued paddle starts entering
  const handleBidDisplayed = useCallback((bid: Bid) => {
    setDisplayedTotal(prev => {
      // Guard against hydration/refresh callbacks causing double-counts.
      // During normal live flow this still advances exactly by bid.amount.
      return Math.min(prev + bid.amount, currentTotal);
    });
  }, [currentTotal]);

  // Calculate progress from the displayed total (not the live server total)
  const progress = goalAmount && goalAmount > 0
    ? Math.min(((displayedTotal - startingTotal) / (goalAmount - startingTotal)) * 100, 100)
    : 0;

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Trigger confetti when progress hits 100% — runs until a new bid arrives
  useEffect(() => {
    if (progress >= 100 && !wasAt100Ref.current) {
      wasAt100Ref.current = true;
      confettiActiveRef.current = true;
      setShowConfetti(true);
    } else if (progress < 100) {
      wasAt100Ref.current = false;
    }
  }, [progress]);

  // Cancel confetti when a new bid arrives
  useEffect(() => {
    if (!lastBid || !confettiActiveRef.current) return;
    confettiActiveRef.current = false;
    setShowConfetti(false);
  }, [lastBid]);

  // Derive theme values here (before early return) so the effect below is
  // always called in the same hook order regardless of isLoading.
  const rawThemeName   = settings?.themeName || 'boysGirlsClub';
  const _themeName     = (rawThemeName === 'modern' || rawThemeName === 'modernDots') ? 'NPCE' : rawThemeName;
  const _primaryColor  = settings?.themePrimaryColor  || '#2563eb';
  const _secondaryColor = settings?.themeSecondaryColor || '#3b82f6';

  // Rebuild confetti pieces whenever the theme/colors change.
  useEffect(() => {
    confettiPiecesRef.current = null;
  }, [_themeName, _primaryColor, _secondaryColor]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '2rem',
          color: '#ffffff',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        }}
      >
        <div style={{ animation: 'pulse 2s ease-in-out infinite' }}>Loading...</div>
      </div>
    );
  }

  const themeName = _themeName;
  const isNPCE = themeName === 'NPCE';
  const primaryColor = _primaryColor;
  const secondaryColor = _secondaryColor;
  const progressBarTheme = settings?.progressBarTheme || 'capsule-v2';
  const useCapsuleV2ProgressBar = progressBarTheme === 'capsule-v2';
  const useAnyCapsule = useCapsuleV2ProgressBar;
  const progressContainerHeight = 'clamp(400px, 70vh, 900px)';
  const progressCanvasWidth = 'clamp(600px, 105vh, 1350px)';
  const progressAccentColor = themeName === 'custom'
    ? darkenColor(secondaryColor, 0.25)
    : (themeName === 'boysGirlsClub' || themeName === 'winter')
    ? '#1a7ca8'
    : isNPCE
    ? '#c23a1d'
    : '#0891b2';
  const progressBarRadius = useAnyCapsule
    ? '36px'
    : '50px 50px 150px 150px';
  const activePaddleDigits = Math.max(
    settings?.paddleDigits ?? 0,
    String(lastBid?.paddleNumber ?? '').length
  );
  const useLargeNumberSpacingFix = activePaddleDigits >= 4 && displayedTotal >= 1_000_000;

  // Helper function for thermometer progress bar gradient
  const getThermometerGradient = () => {
    switch (themeName) {
      case 'boysGirlsClub':
      case 'winter':
        return 'linear-gradient(to top, #1a7ca8, #2596be, #3ab0d8)';
      case 'NPCE':
        return 'linear-gradient(to top, #c23a1d, #e24725, #f5633d)';
      case 'custom':
        return generateThermometerGradient(secondaryColor);
      default:
        return 'linear-gradient(to top, #1a7ca8, #2596be, #3ab0d8)';
    }
  };

  // Generate confetti pieces once (lazily) — regenerate if theme changes
  if (!confettiPiecesRef.current) {
    const palettes: Record<string, string[]> = {
      boysGirlsClub: ['#2596be', '#30a5d0', '#40b5e0', '#1b5a7d', '#FFFFFF'],
      winter:        ['#dff4ff', '#a4d7ee', '#5fb8de', '#1f79a4', '#ffffff'],
      NPCE:          ['#e24725', '#ff5a3d', '#ff7355', '#1b3664', '#FFFFFF'],
    };
    const colors = themeName === 'custom'
      ? [primaryColor, secondaryColor, lightenColor(primaryColor, 0.3), lightenColor(secondaryColor, 0.3), '#FFFFFF']
      : palettes[themeName] || palettes.boysGirlsClub;
    const shapeWeights = [0.6, 0.3, 0.1];
    confettiPiecesRef.current = Array.from({ length: 120 }, (_, i) => {
      const r = Math.random();
      let c = 0;
      let shape: 'square' | 'circle' | 'rectangle' = 'square';
      const shapeOptions: ('square' | 'circle' | 'rectangle')[] = ['square', 'circle', 'rectangle'];
      for (let s = 0; s < shapeOptions.length; s++) { c += shapeWeights[s]; if (r < c) { shape = shapeOptions[s]; break; } }
      return {
        id: i,
        x: Math.random() * 100,
        y: -10 - (i % 10) * 15,
        size: Math.random() * 10 + 12,
        delay: (i / 120) * 4,
        duration: 4 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape,
      };
    });
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateColumns: '1fr',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        cursor: 'default',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
    >
      {/* Animated Background */}
      <AnimatedBackground themeName={themeName} customBackgroundUrl={settings?.customBackgroundPath} />

      {/* Confetti — fires when progress hits 100%, auto-clears after 12 s or on new bid */}
      {showConfetti && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          pointerEvents: 'none', zIndex: 200, overflow: 'hidden',
        }}>
          {confettiPiecesRef.current?.map((piece) => (
            <div
              key={piece.id}
              style={{
                position: 'absolute',
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                width:  piece.shape === 'rectangle' ? `${piece.size * 1.8}px` : `${piece.size}px`,
                height: piece.shape === 'rectangle' ? `${piece.size * 0.6}px` : `${piece.size}px`,
                backgroundColor: piece.color,
                borderRadius: piece.shape === 'circle' ? '50%' : '2px',
                animation: `confettiFall ${piece.duration}s linear ${piece.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Conditional Rendering: Goal Reached Display or Normal Display */}
      {settings?.goalReachedEnabled ? (
        <GoalReachedDisplay
          displayTotal={settings.goalReachedManualTotal || currentTotal}
          message={settings.goalReachedMessage}
          themeName={themeName}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          logoPath={settings.logoPath}
          backgroundImagePath={settings.goalReachedBackgroundPath}
        />
      ) : (
        <>
          {/* Main Container */}
          <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          alignItems: 'center',
          justifyItems: 'center',
          padding: 'clamp(0.5rem, 2vh, 2rem) clamp(1rem, 2vw, 4rem)',
          zIndex: 1,
        }}
      >
        {/* Top: Logo - Fixed at top center */}
        {settings?.logoPath && (
          <div
            style={{
              position: 'fixed',
              top: 'clamp(1rem, 2vh, 2rem)',
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'fadeIn 1s ease-out',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 50,
            }}
          >
            <LogoDisplay logoUrl={settings.logoPath} />
          </div>
        )}

        {/* Main Elements Container - Centered */}
        <div
          className="main-elements"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginTop: 'clamp(8rem, 18vh, 16rem)',
            transform: useLargeNumberSpacingFix
              ? 'translateX(clamp(-210px, -10.5vw, -150px))'
              : 'translateX(-62px)',
          }}
        >
          {/* Main Content Grid */}
          <div
            className="content-grid"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: useLargeNumberSpacingFix
                ? 'clamp(3rem, 5vw, 7.5rem)'
                : 'clamp(2rem, 4vw, 6rem)',
            }}
          >
            {/* LEFT: Paddle Number Display — fixed layout width prevents the
                thermometer and totals from moving when digit count changes.
                The translateX shifts the paddle panel left so the large number
                never bleeds into the totals column; clamp() keeps it
                proportional across all display sizes without touching the
                flex layout (other elements don't move). */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: useLargeNumberSpacingFix
                  ? 'clamp(10rem, 17vw, 27rem)'
                  : 'clamp(8rem, 15vw, 25rem)',
                width: useLargeNumberSpacingFix
                  ? 'clamp(24rem, 34vw, 56rem)'
                  : 'clamp(22rem, 32vw, 52rem)',
                flexShrink: 0,
                transform: useLargeNumberSpacingFix
                  ? 'translateX(clamp(-62px, -3.8vw, -10px))'
                  : 'translateX(clamp(-90px, -5.5vw, -28px))',
              }}
            >
              <PaddleNumberDisplay
                lastBid={lastBid}
                currentDonationLevel={settings?.currentDonationLevel || null}
                themeName={themeName}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                onBidDisplayed={handleBidDisplayed}
              />
            </div>

            {/* CENTER: Thermometer with Total & Goal overlaid on left */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: useLargeNumberSpacingFix
                  ? 'clamp(0rem, 0.8vw, 2rem)'
                  : 'clamp(-2rem, -2vw, -4rem)',
                animation: 'fadeIn 1s ease-out 0.6s backwards',
              }}
            >
            {/* Total & Goal positioned on left side of thermometer */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translateX(-100%) translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(1.5rem, 2vw, 3rem)',
                zIndex: 2,
                minWidth: 'clamp(400px, 40vw, 800px)',
              }}
            >
              {/* Total Display with Glow */}
              <div
                style={{
                  position: 'relative',
                  animation: 'fadeIn 1s ease-out 0.2s backwards',
                  transform: 'translateZ(0)',
                  willChange: 'contents',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) translateZ(0)',
                    width: '150%',
                    height: '150%',
                    background: `radial-gradient(circle, ${
                      themeName === 'custom'
                        ? hexToRgba(secondaryColor, 0.3)
                        : themeName === 'boysGirlsClub'
                        ? 'rgba(0, 133, 202, 0.4)'
                        : 'rgba(59, 130, 246, 0.3)'
                    }, transparent)`,
                    filter: 'blur(60px)',
                    animation: 'pulse 4s ease-in-out infinite',
                    zIndex: -1,
                    willChange: 'opacity',
                    pointerEvents: 'none',
                  }}
                />
                <TotalDisplay
                  total={displayedTotal}
                  color={secondaryColor}
                  labelColor={themeName === 'custom' ? (settings?.customBackgroundPath ? '#ffffff' : primaryColor) : (themeName === 'boysGirlsClub' || themeName === 'winter') ? '#000000' : isNPCE ? '#1b3664' : undefined}
                  themeName={themeName}
                />
              </div>

              {/* Goal Display */}
              {goalAmount && (
                <div style={{ animation: 'fadeIn 1s ease-out 0.4s backwards' }}>
                  <GoalDisplay
                    goalAmount={goalAmount}
                    color={themeName === 'custom' ? secondaryColor : (themeName === 'boysGirlsClub' || themeName === 'winter') ? '#2596be' : isNPCE ? '#e24725' : '#fbbf24'}
                    labelColor={themeName === 'custom' ? (settings?.customBackgroundPath ? '#ffffff' : primaryColor) : (themeName === 'boysGirlsClub' || themeName === 'winter') ? '#000000' : isNPCE ? '#1b3664' : undefined}
                    themeName={themeName}
                  />
                </div>
              )}
            </div>

            {/* Thermometer/Progress container */}
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                width: useAnyCapsule ? progressCanvasWidth : undefined,
                height: progressContainerHeight,
                marginLeft: useLargeNumberSpacingFix
                  ? 'clamp(8.5rem, 15vw, 23rem)'
                  : 'clamp(6rem, 12vw, 18rem)',
                transform: 'translateZ(0)',
              }}
            >
              {useCapsuleV2ProgressBar && (
                <>
                  {/* Glass outer frame */}
                  <div style={{
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                    width: 'clamp(76px, 4.8vw, 116px)', bottom: '4.5%', height: '91%',
                    borderRadius: '42px',
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(255,255,255,0.35)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.1), inset 1px 0 3px rgba(255,255,255,0.45), inset -1px 0 3px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.3)',
                    zIndex: 0, pointerEvents: 'none',
                  }} />

                  {/* Scale marks: 100 / 75 / 50 / 25 / 0 */}
                  {[100, 75, 50, 25, 0].map((pct) => (
                    <div key={pct} style={{
                      position: 'absolute',
                      bottom: `calc(8% + ${pct * 0.83}%)`,
                      left: '50%',
                      transform: 'translateX(clamp(44px, 2.9vw, 64px))',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      zIndex: 5, pointerEvents: 'none',
                    }}>
                      <div style={{ width: '8px', height: '1.5px', background: hexToRgba(progressAccentColor, 0.7), flexShrink: 0 }} />
                      <span style={{
                        fontSize: 'clamp(0.72rem, 0.95vw, 1rem)', fontWeight: 900,
                        color: hexToRgba(progressAccentColor, 1),
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        whiteSpace: 'nowrap', lineHeight: 1,
                        textShadow: '0 1px 3px rgba(255,255,255,0.6)',
                      }}>{pct}%</span>
                    </div>
                  ))}

                  {/* Glass specular overlay */}
                  <div style={{
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                    width: 'clamp(76px, 4.8vw, 116px)', bottom: '4.5%', height: '91%',
                    borderRadius: '42px',
                    background: 'linear-gradient(to right, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 25%, transparent 50%, transparent 70%, rgba(255,255,255,0.04) 100%)',
                    zIndex: 3, pointerEvents: 'none',
                  }} />
                </>
              )}

              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: useAnyCapsule ? 'clamp(64px, 4.1vw, 94px)' : '10%',
                  bottom: useCapsuleV2ProgressBar ? '6%' : '9%',
                  height: useCapsuleV2ProgressBar ? '85%' : '80%',
                  zIndex: useAnyCapsule ? 1 : 0,
                  overflow: 'hidden',
                  borderRadius: progressBarRadius,
                  isolation: 'isolate',
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                }}
              >
                {/* Liquid fill */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: `${progress}%`,
                    background: getThermometerGradient(),
                    transition: 'height 1.5s ease-out',
                    boxShadow: `
                      inset 2px 0 4px rgba(255, 255, 255, 0.3),
                      inset -2px 0 4px rgba(0, 0, 0, 0.2),
                      inset 0 3px 6px rgba(255, 255, 255, 0.2),
                      inset 0 -3px 8px rgba(0, 0, 0, 0.15)
                    `,
                    willChange: 'height',
                    borderRadius: progressBarRadius,
                  }}
                />
                {/* Liquid depth overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: `${progress}%`,
                    background: `linear-gradient(90deg,
                      rgba(0, 0, 0, 0.15) 0%,
                      rgba(255, 255, 255, 0.1) 20%,
                      rgba(255, 255, 255, 0.2) 35%,
                      rgba(255, 255, 255, 0.05) 50%,
                      rgba(0, 0, 0, 0.12) 100%
                    )`,
                    borderRadius: progressBarRadius,
                    pointerEvents: 'none',
                    transition: 'height 1.5s ease-out',
                  }}
                />
                {/* Shine highlight */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '15%',
                    width: '25%',
                    height: `${progress}%`,
                    background: 'linear-gradient(to right, rgba(255,255,255,0.3), rgba(255,255,255,0.1), transparent)',
                    borderRadius: progressBarRadius,
                    pointerEvents: 'none',
                    transition: 'height 1.5s ease-out',
                  }}
                />
                {/* Subtle wave animation at top */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: `calc(${progress}% - 8px)`,
                    left: 0,
                    width: '100%',
                    height: '16px',
                    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'liquidWave 2s ease-in-out infinite',
                    transition: 'bottom 1.5s ease-out',
                    pointerEvents: 'none',
                  }}
                />
                {/* Animated bubbles */}
                {[
                  { left: '25%', size: 4, duration: 8, delay: 0 },
                  { left: '45%', size: 3, duration: 10, delay: 2 },
                  { left: '65%', size: 5, duration: 9, delay: 4 },
                  { left: '35%', size: 3, duration: 11, delay: 1 },
                  { left: '55%', size: 4, duration: 7, delay: 3 },
                  { left: '30%', size: 2, duration: 12, delay: 5 },
                  { left: '70%', size: 3, duration: 9, delay: 6 },
                  { left: '40%', size: 2, duration: 10, delay: 7 },
                  { left: '60%', size: 4, duration: 8, delay: 2.5 },
                  { left: '50%', size: 3, duration: 11, delay: 4.5 },
                ].map((bubble, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      bottom: '0%',
                      left: bubble.left,
                      width: `${bubble.size}px`,
                      height: `${bubble.size}px`,
                      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.3))',
                      borderRadius: '50%',
                      animation: `bubbleFloat ${bubble.duration}s linear infinite`,
                      animationDelay: `${bubble.delay}s`,
                      pointerEvents: 'none',
                    }}
                  />
                ))}
                
              </div>

              {/* Thermometer image (legacy style) */}
              {!useAnyCapsule && (
                <img
                  src="/Background/thermometerFinal.png"
                  alt="Fundraising Thermometer"
                  className="thermometer-image"
                  style={{
                    position: 'relative',
                    height: progressContainerHeight,
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
                    zIndex: 1,
                    transform: 'translateZ(0)',
                  }}
                />
              )}

              {/* Percentage display */}
              {useCapsuleV2ProgressBar ? (
                <div style={{
                  position: 'absolute',
                  bottom: `calc(8% + ${Math.max(progress * 0.83, 0)}% + 8px)`,
                  left: '50%', transform: 'translateX(-50%)',
                  transition: 'bottom 1.5s ease-out',
                  fontSize: 'clamp(0.9rem, 1.2vw, 1.25rem)', fontWeight: 900,
                  letterSpacing: '0.03em',
                  color: progressAccentColor,
                  textShadow: '0 1px 3px rgba(255,255,255,0.6)',
                  zIndex: 4, whiteSpace: 'nowrap', pointerEvents: 'none',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                  {Math.round(progress)}%
                </div>
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    top: '7.5%',
                    left: '50%',
                    transform: 'translateX(calc(-50% + 2px))',
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                    fontWeight: '900',
                    color: progressAccentColor,
                    textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 -1px 2px rgba(255,255,255,0.8)',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    letterSpacing: '0.05em',
                  }}
                >
                  {Math.round(progress)}%
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Decorative Elements */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Fullscreen Button - Only show when NOT in fullscreen */}
      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'fixed',
            bottom: 'clamp(1rem, 2vh, 2rem)',
            left: 'clamp(1rem, 2vw, 2rem)',
            padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
            backgroundColor:
              themeName === 'custom'
                ? hexToRgba(primaryColor, 0.2)
                : (themeName === 'boysGirlsClub' || themeName === 'winter')
                ? 'rgba(0, 133, 202, 0.2)'
                : 'rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${themeName === 'custom' ? primaryColor : (themeName === 'boysGirlsClub' || themeName === 'winter') ? '#0085CA' : '#3b82f6'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            color: '#ffffff',
            boxShadow:
              themeName === 'custom'
                ? `0 4px 12px ${hexToRgba(primaryColor, 0.5)}`
                : (themeName === 'boysGirlsClub' || themeName === 'winter')
                ? '0 4px 12px rgba(0, 133, 202, 0.5)'
                : '0 4px 12px rgba(59, 130, 246, 0.5)',
            zIndex: 100,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              themeName === 'custom'
                ? hexToRgba(primaryColor, 0.4)
                : (themeName === 'boysGirlsClub' || themeName === 'winter')
                ? 'rgba(0, 133, 202, 0.4)'
                : 'rgba(59, 130, 246, 0.4)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              themeName === 'custom'
                ? hexToRgba(primaryColor, 0.2)
                : (themeName === 'boysGirlsClub' || themeName === 'winter')
                ? 'rgba(0, 133, 202, 0.2)'
                : 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Enter Fullscreen"
        >
          ⛶
        </button>
      )}

      {/* Company Logo - Bottom Right */}
      <div
        style={{
          position: 'fixed',
          bottom: 'clamp(1rem, 2vh, 2rem)',
          right: 'clamp(1rem, 2vw, 2rem)',
          zIndex: 99,
          opacity: 0.2,
          transition: 'opacity 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.4';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.2';
        }}
      >
        <img
          src="/branding/company-logo.png"
          alt="Created by"
          style={{
            height: 'clamp(50px, 5vmin, 100px)',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
          }}
        />
      </div>

        </>
      )}

      {/* Responsive Media Queries */}
      <style>
        {`
          /* Confetti fall */
          @keyframes confettiFall {
            from { transform: translateY(0) rotate(0deg); }
            to   { transform: translateY(120vh) rotate(720deg); }
          }

          /* Liquid wave animation */
          @keyframes liquidWave {
            0%, 100% {
              transform: scaleX(0.9) scaleY(1);
              opacity: 0.6;
            }
            50% {
              transform: scaleX(1.1) scaleY(0.8);
              opacity: 0.9;
            }
          }

          /* Winter theme animations */
          @keyframes snowfallWithWind {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            25% {
              transform: translateY(27vh) translateX(15px);
            }
            50% {
              transform: translateY(55vh) translateX(-10px);
            }
            75% {
              transform: translateY(82vh) translateX(20px);
            }
            95% {
              opacity: 0.7;
            }
            100% {
              transform: translateY(110vh) translateX(5px);
              opacity: 0;
            }
          }

          @keyframes windStreaks {
            0% {
              transform: translateX(-100%);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateX(100%);
              opacity: 0;
            }
          }

          @keyframes iceShimmer {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.05);
            }
          }

          @keyframes frostSparkle {
            0%, 100% {
              opacity: 0.3;
            }
            25% {
              opacity: 0.8;
            }
            50% {
              opacity: 0.4;
            }
            75% {
              opacity: 0.9;
            }
          }

          @keyframes winterSwirl1 {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0.8;
            }
            50% {
              transform: translate(30px, 20px) rotate(5deg);
              opacity: 1;
            }
          }

          @keyframes winterSwirl2 {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0.7;
            }
            50% {
              transform: translate(-20px, 30px) rotate(-5deg);
              opacity: 0.9;
            }
          }

          @keyframes shimmer {
            0%, 100% {
              opacity: 0.6;
            }
            50% {
              opacity: 1;
            }
          }

          @keyframes sparkle {
            0%, 100% {
              opacity: 0.4;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.1);
            }
          }

          /* Bubble float animation - slow and gentle */
          @keyframes bubbleFloat {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            5% {
              opacity: 0.5;
            }
            25% {
              transform: translateY(-150px) translateX(2px);
              opacity: 0.6;
            }
            50% {
              transform: translateY(-300px) translateX(-2px);
              opacity: 0.5;
            }
            75% {
              transform: translateY(-450px) translateX(1px);
              opacity: 0.4;
            }
            95% {
              opacity: 0.2;
            }
            100% {
              transform: translateY(-600px) translateX(0);
              opacity: 0;
            }
          }

          /* Standard Desktop */
          @media (min-width: 1920px) and (max-width: 2560px) {
            /* Grid gaps are handled by inline styles with clamp */
          }

          /* Large Display (4K) */
          @media (min-width: 2560px) and (max-width: 4096px) {
            /* Increase gap between grid items */
            .content-grid {
              column-gap: clamp(3rem, 5vw, 8rem);
              row-gap: clamp(2.5rem, 4vh, 5rem);
            }
          }

          /* Stadium Display (8K+) */
          @media (min-width: 4096px) {
            .content-grid {
              column-gap: clamp(4rem, 6vw, 10rem);
              row-gap: clamp(3rem, 5vh, 6rem);
            }
          }

          /* Ultra-wide displays (21:9, 32:9) */
          @media (min-aspect-ratio: 21/9) {
            .content-grid {
              grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
              column-gap: clamp(3rem, 5vw, 8rem);
            }
          }

          /* Portrait or tall displays */
          @media (max-aspect-ratio: 4/3) {
            .content-grid {
              grid-template-columns: 1fr;
              row-gap: clamp(2rem, 4vh, 4rem);
            }
          }
        `}
      </style>
    </div>
  );
}
