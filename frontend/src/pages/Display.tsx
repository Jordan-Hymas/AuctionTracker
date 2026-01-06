import { useAuction } from '../context/AuctionContext';
import { useState, useEffect } from 'react';
import TotalDisplay from '../components/display/TotalDisplay';
import GoalDisplay from '../components/display/GoalDisplay';
import LogoDisplay from '../components/display/LogoDisplay';
import PaddleNumberDisplay from '../components/display/PaddleNumberDisplay';
import AnimatedBackground from '../components/display/AnimatedBackground';
import UpdateFlash from '../components/display/UpdateFlash';
import MoneyGrowthBar from '../components/display/MoneyGrowthBar';
import CurrentLevelDisplay from '../components/display/CurrentLevelDisplay';

export default function Display() {
  const { currentTotal, goalAmount, startingTotal, lastBid, settings, isLoading, lastUpdateTime, isConnected } = useAuction();
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        {/* Top: Logo */}
        {settings?.logoPath && (
          <div
            style={{
              marginBottom: 'clamp(0.5rem, 2vh, 2rem)',
              animation: 'fadeIn 1s ease-out',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <LogoDisplay logoUrl={settings.logoPath} />
          </div>
        )}

        {/* Main Content Grid */}
        <div
          className="content-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            columnGap: 'clamp(2rem, 4vw, 6rem)',
            rowGap: 'clamp(2rem, 3vh, 4rem)',
            alignItems: 'center',
            justifyItems: 'center',
            maxWidth: 'min(95vw, 3200px)',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {/* LEFT: Paddle Number Display */}
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PaddleNumberDisplay
              lastBid={lastBid}
              currentDonationLevel={settings?.currentDonationLevel || null}
              themeName={themeName}
            />
          </div>

          {/* CENTER: Total & Goal */}
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(2rem, 3vw, 4rem)',
            }}
          >
            {/* Total Display with Glow */}
            <div
              style={{
                position: 'relative',
                animation: 'fadeIn 1s ease-out 0.2s backwards',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
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

            {/* Animated Progress Bar (if goal set) */}
            {goalAmount && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 'min(800px, 90vw)',
                  animation: 'fadeIn 1s ease-out 0.6s backwards',
                }}
              >
                <MoneyGrowthBar
                  currentTotal={currentTotal}
                  goalAmount={goalAmount}
                  startingTotal={startingTotal}
                  primaryColor={primaryColor}
                  progressBarGradient={settings?.themeProgressBarGradient}
                  themeName={themeName}
                />
              </div>
            )}
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
          opacity: 0.8,
          transition: 'opacity 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.8';
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

      {/* Responsive Media Queries */}
      <style>
        {`
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
