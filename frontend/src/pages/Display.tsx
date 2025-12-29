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

  const themeName = settings?.themeName || 'classic';
  const primaryColor = settings?.themePrimaryColor || '#2563eb';
  const secondaryColor = settings?.themeSecondaryColor || '#3b82f6';

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Animated Background */}
      <AnimatedBackground themeName={themeName} />

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 'clamp(1rem, 3vw, 4rem)',
          zIndex: 1,
        }}
      >
        {/* Top: Logo */}
        {settings?.logoPath && (
          <div
            style={{
              marginBottom: 'clamp(1rem, 3vh, 4rem)',
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
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
            gap: 'clamp(2rem, 5vw, 6rem)',
            alignItems: 'center',
            maxWidth: '2000px',
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
                labelColor={themeName === 'boysGirlsClub' ? '#000000' : undefined}
              />
            </div>

            {/* Goal Display */}
            {goalAmount && (
              <div style={{ animation: 'fadeIn 1s ease-out 0.4s backwards' }}>
                <GoalDisplay
                  goalAmount={goalAmount}
                  color={themeName === 'boysGirlsClub' ? '#FFFFFF' : '#fbbf24'}
                  labelColor={themeName === 'boysGirlsClub' ? '#000000' : undefined}
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
            bottom: 'clamp(0.5rem, 2vw, 1.5rem)',
            left: 'clamp(0.5rem, 2vw, 1.5rem)',
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

      {/* Connection Status Indicator */}
      <div
        style={{
          position: 'fixed',
          bottom: 'clamp(0.5rem, 2vw, 1.5rem)',
          right: 'clamp(0.5rem, 2vw, 1.5rem)',
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
    </div>
  );
}
