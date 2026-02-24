import { useAuction } from '../context/AuctionContext';
import BidForm from '../components/control/BidForm';
import BidHistory from '../components/control/BidHistory';
import SettingsPanel from '../components/control/SettingsPanel';
import LogoUploader from '../components/control/LogoUploader';
import ExportButton from '../components/control/ExportButton';
import ResetButton from '../components/control/ResetButton';
import CurrentLevelSelector from '../components/control/CurrentLevelSelector';
import DonationLevelsPanel from '../components/control/DonationLevelsPanel';
import CustomThemePanel from '../components/control/CustomThemePanel';
import GoalReachedPanel from '../components/control/GoalReachedPanel';
import ThemeToggle from '../components/control/ThemeToggle';
import ProgressBarThemePanel from '../components/control/ProgressBarThemePanel';
import { adminApi } from '../services/api';
import { useState, useEffect, useRef } from 'react';
import { getTheme } from '../config/controlThemes';
import { useResponsive } from '../hooks/useResponsive';

export default function Control() {
  const { currentTotal, goalAmount, startingTotal, isConnected, isLoading, settings } = useAuction();
  const [serverInfo, setServerInfo] = useState<{ ipAddresses: string[]; port: number } | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState<'setup' | 'live'>('live');
  const [hoveredTab, setHoveredTab] = useState<'setup' | 'live' | null>(null);
  const [lowerRightRowHeight, setLowerRightRowHeight] = useState<number | null>(null);
  const [showStaleWarning, setShowStaleWarning] = useState(false);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const donationPanelRef = useRef<HTMLDivElement>(null);
  const theme = getTheme(themeMode);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    const fetchServerInfo = async () => {
      try {
        const info = await adminApi.getServerInfo();
        setServerInfo(info);
      } catch (error) {
        console.error('Failed to fetch server info:', error);
      }
    };

    fetchServerInfo();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (activeTab !== 'setup' || isMobile) {
      setLowerRightRowHeight(null);
      return;
    }

    const measure = () => {
      const settingsHeight = settingsPanelRef.current?.getBoundingClientRect().height ?? 0;
      const donationHeight = donationPanelRef.current?.getBoundingClientRect().height ?? 0;
      const gap = 16; // 1rem
      const targetRowHeight = Math.max(0, settingsHeight - donationHeight - gap);
      setLowerRightRowHeight(targetRowHeight > 0 ? targetRowHeight : null);
    };

    measure();

    const observer = new ResizeObserver(() => measure());
    if (settingsPanelRef.current) observer.observe(settingsPanelRef.current);
    if (donationPanelRef.current) observer.observe(donationPanelRef.current);

    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [activeTab, isMobile, settings?.themeName]);

  // Show stale-data warning if disconnected for more than 30 seconds
  useEffect(() => {
    if (!isConnected) {
      staleTimerRef.current = setTimeout(() => setShowStaleWarning(true), 30000);
    } else {
      if (staleTimerRef.current !== null) {
        clearTimeout(staleTimerRef.current);
        staleTimerRef.current = null;
      }
      setShowStaleWarning(false);
    }
    return () => {
      if (staleTimerRef.current !== null) clearTimeout(staleTimerRef.current);
    };
  }, [isConnected]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.5rem',
          color: theme.colors.textSecondary,
          backgroundColor: theme.colors.pageBg,
        }}
      >
        Loading...
      </div>
    );
  }

  const progress = goalAmount ? ((currentTotal - startingTotal) / (goalAmount - startingTotal)) * 100 : 0;

  // Responsive grid templates
  const getStatsGridCols = () => {
    if (isMobile) return '1fr';
    if (isTablet) return 'repeat(2, 1fr)';
    return 'repeat(3, 1fr)';
  };

  return (
    <>
    {showStaleWarning && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#b91c1c',
        color: '#fff',
        textAlign: 'center',
        padding: '0.6rem 1rem',
        fontSize: '0.9rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
      }}>
        ⚠️ Connection lost — display may be showing stale data. Attempting to reconnect…
      </div>
    )}
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.pageBg,
        padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
        transition: 'background-color 0.2s, color 0.2s',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '700',
                  color: theme.colors.textPrimary,
                  marginBottom: '0.25rem',
                  transition: 'color 0.2s',
                }}
              >
                Control Panel
              </h1>
              <p style={{ fontSize: '0.875rem', color: theme.colors.textSecondary, transition: 'color 0.2s' }}>
                Live bidding and display controls
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {!isMobile && serverInfo && serverInfo.ipAddresses.length > 0 && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: theme.colors.textSecondary,
                    padding: '0.35rem 0.6rem',
                    borderRadius: '999px',
                    backgroundColor: theme.colors.cardBorder,
                    transition: 'background-color 0.2s, color 0.2s',
                  }}
                >
                  Server {serverInfo.ipAddresses[0]}:{serverInfo.port}
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: theme.colors.cardBg,
                  boxShadow: `0 1px 2px ${theme.colors.shadow}`,
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? theme.colors.green : theme.colors.red,
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, fontWeight: 500, transition: 'color 0.2s' }}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <ThemeToggle currentMode={themeMode} onToggle={toggleTheme} theme={theme} />
            </div>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: getStatsGridCols(),
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                backgroundColor: theme.colors.cardBg,
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: `0 1px 3px ${theme.colors.shadow}`,
                transition: 'background-color 0.2s, box-shadow 0.2s',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: theme.colors.textPrimary,
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'color 0.2s',
                }}
              >
                Current Total
              </div>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontWeight: '700',
                  color: theme.colors.blue,
                  transition: 'color 0.2s',
                }}
              >
                {formatCurrency(currentTotal)}
              </div>
            </div>

            <div
              style={{
                backgroundColor: theme.colors.cardBg,
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: `0 1px 3px ${theme.colors.shadow}`,
                transition: 'background-color 0.2s, box-shadow 0.2s',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: theme.colors.textSecondary,
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'color 0.2s',
                }}
              >
                Goal
              </div>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontWeight: '700',
                  color: theme.colors.green,
                  transition: 'color 0.2s',
                }}
              >
                {goalAmount ? formatCurrency(goalAmount) : 'Not set'}
              </div>
            </div>

            {goalAmount && !isMobile && (
              <div
                style={{
                  backgroundColor: theme.colors.cardBg,
                  padding: '1rem',
                  borderRadius: '8px',
                  boxShadow: `0 1px 3px ${theme.colors.shadow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: theme.colors.textSecondary,
                    marginBottom: '0.3rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'color 0.2s',
                  }}
                >
                  Progress
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: theme.colors.purple,
                      transition: 'color 0.2s',
                    }}
                  >
                    {Math.min(Math.max(progress, 0), 100).toFixed(1)}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '999px',
                    background: theme.colors.cardBorder,
                    overflow: 'hidden',
                    transition: 'background 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(Math.max(progress, 0), 100)}%`,
                      height: '100%',
                      background: `linear-gradient(to right, ${theme.colors.purpleDark}, ${theme.colors.purple})`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            backgroundColor: theme.colors.cardBg,
            padding: '0.375rem',
            borderRadius: '10px',
            boxShadow: `0 1px 3px ${theme.colors.shadow}`,
            transition: 'background-color 0.2s, box-shadow 0.2s',
          }}
        >
          <button
            onClick={() => setActiveTab('setup')}
            onMouseEnter={() => setHoveredTab('setup')}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              flex: 1,
              padding: isMobile ? '0.75rem 0.5rem' : '0.875rem 1rem',
              fontSize: isMobile ? '0.9375rem' : '1.0625rem',
              fontWeight: '700',
              color: activeTab === 'setup' ? '#ffffff' : theme.colors.textSecondary,
              backgroundColor: activeTab === 'setup'
                ? theme.colors.blue
                : hoveredTab === 'setup'
                  ? theme.colors.hover
                  : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'setup' ? `0 2px 6px ${theme.colors.shadowMd}` : 'none',
              letterSpacing: '0.02em',
            }}
          >
            Setup
          </button>
          <button
            onClick={() => setActiveTab('live')}
            onMouseEnter={() => setHoveredTab('live')}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              flex: 1,
              padding: isMobile ? '0.75rem 0.5rem' : '0.875rem 1rem',
              fontSize: isMobile ? '0.9375rem' : '1.0625rem',
              fontWeight: '700',
              color: activeTab === 'live' ? '#ffffff' : theme.colors.textSecondary,
              backgroundColor: activeTab === 'live'
                ? theme.colors.blue
                : hoveredTab === 'live'
                  ? theme.colors.hover
                  : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'live' ? `0 2px 6px ${theme.colors.shadowMd}` : 'none',
              letterSpacing: '0.02em',
            }}
          >
            Live Event
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'setup' ? (
          isMobile ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1rem',
                marginBottom: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <SettingsPanel theme={theme} />
              <DonationLevelsPanel theme={theme} />
              <LogoUploader theme={theme} />
              <ProgressBarThemePanel theme={theme} />
              {settings?.themeName === 'custom' && <CustomThemePanel theme={theme} />}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem',
                alignItems: 'flex-start',
              }}
            >
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div ref={settingsPanelRef}>
                  <SettingsPanel theme={theme} />
                </div>
                {settings?.themeName === 'custom' && <CustomThemePanel theme={theme} />}
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div ref={donationPanelRef}>
                  <DonationLevelsPanel theme={theme} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: '0.75rem',
                    height: lowerRightRowHeight ? `${lowerRightRowHeight}px` : undefined,
                  }}
                >
                  <div style={{ flex: '1 1 0', display: 'flex', minWidth: 0 }}>
                    <LogoUploader theme={theme} />
                  </div>
                  <div style={{ flex: '1 1 0', display: 'flex', minWidth: 0 }}>
                    <ProgressBarThemePanel theme={theme} />
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.5fr) minmax(0, 1fr)',
              gap: '1rem',
              marginBottom: '1rem',
              alignItems: 'flex-start',
            }}
          >
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <BidForm theme={theme} />
              <BidHistory theme={theme} />
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CurrentLevelSelector theme={theme} />
              <GoalReachedPanel theme={theme} />
              <ExportButton theme={theme} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            backgroundColor: theme.colors.cardBg,
            padding: '0.875rem 1rem',
            borderRadius: '8px',
            boxShadow: `0 1px 3px ${theme.colors.shadow}`,
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexWrap: 'wrap',
            transition: 'background-color 0.2s, box-shadow 0.2s',
          }}
        >
          <ResetButton theme={theme} />
          <a
            href="/mobile"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.625rem 1.25rem',
              border: `1px solid ${theme.colors.blueLighter}`,
              borderRadius: '6px',
              backgroundColor: theme.colors.cardBg,
              color: theme.colors.blue,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-block',
              boxShadow: `0 1px 2px ${theme.colors.shadow}`,
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.blueLighter;
              e.currentTarget.style.borderColor = theme.colors.blue;
              e.currentTarget.style.boxShadow = `0 4px 6px -1px ${theme.colors.shadowMd}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.cardBg;
              e.currentTarget.style.borderColor = theme.colors.blueLighter;
              e.currentTarget.style.boxShadow = `0 1px 2px ${theme.colors.shadow}`;
            }}
          >
            Mobile Control
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.625rem 1.5rem',
              border: `1px solid ${theme.colors.green}`,
              borderRadius: '6px',
              backgroundColor: theme.colors.green,
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-block',
              boxShadow: `0 1px 3px ${theme.colors.shadowMd}`,
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.greenDark;
              e.currentTarget.style.borderColor = theme.colors.greenDark;
              e.currentTarget.style.boxShadow = `0 4px 6px -1px ${theme.colors.shadowLg}`;
              e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.green;
              e.currentTarget.style.borderColor = theme.colors.green;
              e.currentTarget.style.boxShadow = `0 1px 3px ${theme.colors.shadowMd}`;
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            Display View
          </a>
        </div>

        {/* Footer - Company Logo */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderTop: `1px solid ${theme.colors.cardBorder}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'border-color 0.2s',
          }}
        >
          <img
            src="/branding/company-logo.png"
            alt="Created by"
            style={{
              height: '50px',
              width: 'auto',
              objectFit: 'contain',
              opacity: 0.7,
              transition: 'opacity 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
          />
        </div>
      </div>
    </div>
    </>
  );
}
