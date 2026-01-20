import { useAuction } from '../context/AuctionContext';
import { useState, useEffect } from 'react';
import TotalDisplay from '../components/display/TotalDisplay';
import GoalDisplay from '../components/display/GoalDisplay';
import LogoDisplay from '../components/display/LogoDisplay';
import PaddleNumberDisplay from '../components/display/PaddleNumberDisplay';
import AnimatedBackground from '../components/display/AnimatedBackground';
import UpdateFlash from '../components/display/UpdateFlash';
import GoalReachedDisplay from '../components/display/GoalReachedDisplay';

export default function Display() {
  const { currentTotal, goalAmount, startingTotal, lastBid, settings, isLoading, lastUpdateTime, isConnected } = useAuction();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate progress
  const progress = goalAmount && goalAmount > 0
    ? Math.min(((currentTotal - startingTotal) / (goalAmount - startingTotal)) * 100, 100)
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

  const themeName = settings?.themeName || 'boysGirlsClub';
  const primaryColor = settings?.themePrimaryColor || '#2563eb';
  const secondaryColor = settings?.themeSecondaryColor || '#3b82f6';

  // Helper function for thermometer progress bar gradient
  const getThermometerGradient = () => {
    switch (themeName) {
      case 'boysGirlsClub':
        return 'linear-gradient(to top, #1a7ca8, #2596be, #3ab0d8)';
      case 'modern':
      case 'NPCE':
        return 'linear-gradient(to top, #c23a1d, #e24725, #f5633d)';
      case 'modernDots':
        return 'linear-gradient(to top, #0891b2, #06b6d4, #22d3ee)';
      default:
        return 'linear-gradient(to top, #1a7ca8, #2596be, #3ab0d8)';
    }
  };

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
      <AnimatedBackground themeName={themeName} />

      {/* Conditional Rendering: Goal Reached Display or Normal Display */}
      {settings?.goalReachedEnabled ? (
        <GoalReachedDisplay
          displayTotal={settings.goalReachedManualTotal || currentTotal}
          message={settings.goalReachedMessage}
          themeName={themeName}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          logoPath={settings.logoPath}
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
            transform: 'translateX(-62px)',
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
              gap: 'clamp(2rem, 4vw, 6rem)',
            }}
          >
            {/* LEFT: Paddle Number Display */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'clamp(8rem, 15vw, 25rem)',
              }}
            >
              <PaddleNumberDisplay
                lastBid={lastBid}
                currentDonationLevel={settings?.currentDonationLevel || null}
                themeName={themeName}
              />
            </div>

            {/* CENTER: Thermometer with Total & Goal overlaid on left */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'clamp(-2rem, -2vw, -4rem)',
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
                      themeName === 'boysGirlsClub'
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
                  total={currentTotal}
                  color={secondaryColor}
                  labelColor={themeName === 'boysGirlsClub' ? '#000000' : themeName === 'modern' ? '#1b3664' : undefined}
                  themeName={themeName}
                />
              </div>

              {/* Goal Display */}
              {goalAmount && (
                <div style={{ animation: 'fadeIn 1s ease-out 0.4s backwards' }}>
                  <GoalDisplay
                    goalAmount={goalAmount}
                    color={themeName === 'boysGirlsClub' ? '#2596be' : themeName === 'modern' ? '#e24725' : '#fbbf24'}
                    labelColor={themeName === 'boysGirlsClub' ? '#000000' : themeName === 'modern' ? '#1b3664' : undefined}
                    themeName={themeName}
                  />
                </div>
              )}
            </div>

            {/* Thermometer Container with Progress Bar - DO NOT MODIFY PROGRESS BAR POSITIONING */}
            {/* Progress bar and thermometer are locked together - moving the container moves both */}
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                marginLeft: 'clamp(6rem, 12vw, 18rem)',
                transform: 'translateZ(0)',
              }}
            >
              {/* FINALIZED: Progress Bar - width: 10%, bottom: 9%, height: 80%, borderRadius: 50px 50px 150px 150px */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '10%',
                  bottom: '9%',
                  height: '80%',
                  zIndex: 0,
                  overflow: 'hidden',
                  borderRadius: '50px 50px 150px 150px',
                  isolation: 'isolate',
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
                    borderRadius: '50px 50px 150px 150px',
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
                    borderRadius: '50px 50px 150px 150px',
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
                    borderRadius: '50px 50px 150px 150px',
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

              {/* Thermometer Image */}
              <img
                src="/Background/thermometerFinal.png"
                alt="Fundraising Thermometer"
                className="thermometer-image"
                style={{
                  position: 'relative',
                  height: 'clamp(400px, 70vh, 900px)',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
                  zIndex: 1,
                  transform: 'translateZ(0)',
                }}
              />

              {/* Percentage display - overlayed on top of thermometer */}
              <div
                style={{
                  position: 'absolute',
                  top: '7.5%',
                  left: '50%',
                  transform: 'translateX(calc(-50% + 2px))',
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: '900',
                  color: themeName === 'boysGirlsClub' ? '#1a7ca8' : themeName === 'modern' ? '#c23a1d' : '#0891b2',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 -1px 2px rgba(255,255,255,0.8)',
                  zIndex: 10,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  letterSpacing: '0.05em',
                }}
              >
                {Math.round(progress)}%
              </div>
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

      {/* Update Flash Notification */}
      <UpdateFlash trigger={lastUpdateTime} message="Live Update!" />

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
              themeName === 'boysGirlsClub'
                ? 'rgba(0, 133, 202, 0.2)'
                : 'rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${themeName === 'boysGirlsClub' ? '#0085CA' : '#3b82f6'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            color: '#ffffff',
            boxShadow:
              themeName === 'boysGirlsClub'
                ? '0 4px 12px rgba(0, 133, 202, 0.5)'
                : '0 4px 12px rgba(59, 130, 246, 0.5)',
            zIndex: 100,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              themeName === 'boysGirlsClub'
                ? 'rgba(0, 133, 202, 0.4)'
                : 'rgba(59, 130, 246, 0.4)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              themeName === 'boysGirlsClub'
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

      {/* Connection Status Indicator */}
      <div
        className="connection-status"
        style={{
          position: 'fixed',
          bottom: 'clamp(1rem, 2vh, 2rem)',
          right: 'clamp(120px, calc(2vw + 100px), 200px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(0.25rem, 1vw, 0.75rem)',
          padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1.5rem)',
          backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${isConnected ? '#10b981' : '#ef4444'}`,
          borderRadius: '9999px',
          fontSize: 'clamp(0.625rem, 1.5vw, 0.875rem)',
          fontWeight: '700',
          color: '#ffffff',
          boxShadow: isConnected
            ? '0 4px 12px rgba(16, 185, 129, 0.5)'
            : '0 4px 12px rgba(239, 68, 68, 0.5)',
          zIndex: 100,
          animation: isConnected ? 'none' : 'pulse 1s ease-in-out infinite',
        }}
      >
        <div
          style={{
            width: 'clamp(6px, 1.5vw, 10px)',
            height: 'clamp(6px, 1.5vw, 10px)',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none',
            boxShadow: isConnected
              ? '0 0 15px rgba(16, 185, 129, 1)'
              : '0 0 15px rgba(239, 68, 68, 1)',
          }}
        />
        {isConnected ? 'LIVE' : 'DISCONNECTED'}
      </div>
        </>
      )}

      {/* Responsive Media Queries */}
      <style>
        {`
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

          /* Small Laptop - Prevent collisions */
          @media (max-width: 1366px) {
            .connection-status {
              bottom: clamp(5rem, 10vh, 7rem) !important;
              right: clamp(1rem, 2vw, 2rem) !important;
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

            .connection-status {
              right: clamp(200px, calc(2vw + 150px), 300px) !important;
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
