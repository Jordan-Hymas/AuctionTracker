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
import { adminApi, NetworkInfo } from '../services/api';
import React, { useState, useEffect, useRef } from 'react';
import { getTheme } from '../config/controlThemes';
import { useResponsive } from '../hooks/useResponsive';
import { ControlTheme } from '../types/controlTheme';

function CopyableUrl({ url, theme }: { url: string; theme: ControlTheme }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0, flex: 1 }}>
      <span
        style={{
          flex: 1,
          display: 'block',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: '0.8rem',
          color: theme.colors.textPrimary,
          backgroundColor: theme.colors.pageBg,
          border: `1px solid ${theme.colors.cardBorder}`,
          borderRadius: '6px',
          padding: '0.35rem 0.5rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
        }}
      >
        {url}
      </span>
      <button
        onClick={handleCopy}
        title="Copy to clipboard"
        style={{
          flexShrink: 0,
          padding: '0.3rem 0.55rem',
          border: `1px solid ${copied ? theme.colors.green : theme.colors.cardBorder}`,
          borderRadius: '6px',
          backgroundColor: copied ? theme.colors.greenLight : theme.colors.cardBg,
          color: copied ? theme.colors.greenDark : theme.colors.textSecondary,
          cursor: 'pointer',
          fontSize: '0.7rem',
          fontWeight: '700',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={(e) => {
          if (!copied) {
            e.currentTarget.style.borderColor = theme.colors.blue;
            e.currentTarget.style.color = theme.colors.blue;
          }
        }}
        onMouseLeave={(e) => {
          if (!copied) {
            e.currentTarget.style.borderColor = theme.colors.cardBorder;
            e.currentTarget.style.color = theme.colors.textSecondary;
          }
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

export default function Control() {
  const { currentTotal, goalAmount, startingTotal, isConnected, isLoading, settings } = useAuction();
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState<'setup' | 'live'>('live');
  const [hoveredTab, setHoveredTab] = useState<'setup' | 'live' | null>(null);
  const [showStaleWarning, setShowStaleWarning] = useState(false);
  const [liveColHeight, setLiveColHeight] = useState<number | null>(null);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRightColRef = useRef<HTMLDivElement>(null);
  const theme = getTheme(themeMode);
  const { isMobile, width } = useResponsive();

  useEffect(() => {
    const fetchServerInfo = async () => {
      try {
        const info = await adminApi.getNetworkInfo();
        setNetworkInfo(info);
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

  useEffect(() => {
    if (activeTab !== 'live' || isMobile) {
      setLiveColHeight(null);
      return;
    }
    const el = liveRightColRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setLiveColHeight(el.getBoundingClientRect().height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeTab, isMobile]);

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
  const accessHost = networkInfo?.lanIp || 'localhost';
  const accessPort = networkInfo
    ? (import.meta.env.DEV
        ? (window.location.port || '5173')
        : (window.location.port || String(networkInfo.port)))
    : '';
  const controlAccessUrl = networkInfo ? `http://${accessHost}:${accessPort}/control` : '';
  const mobileAccessUrl = networkInfo ? `http://${accessHost}:${accessPort}/mobile` : '';
  const displayAccessUrl = networkInfo ? `http://${accessHost}:${accessPort}/` : '';

  // Responsive grid templates
  const getStatsGridCols = () => {
    if (width < 760) return '1fr';
    if (width < 1024) return 'repeat(2, minmax(0, 1fr))';
    return 'repeat(3, minmax(0, 1fr))';
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
        <div style={{ marginBottom: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              gap: '0.75rem',
              flexWrap: 'wrap',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {width >= 900 && networkInfo && (
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
                  Server {networkInfo.lanIp || 'localhost'}:{accessPort}
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

          {networkInfo && (
            <div
              style={{
                marginBottom: '0.75rem',
                backgroundColor: theme.colors.cardBg,
                border: `1px solid ${theme.colors.widgetBorder}`,
                borderRadius: '8px',
                padding: '0.6rem 0.85rem',
                boxShadow: `0 1px 3px ${theme.colors.shadow}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                minWidth: 0,
                width: '100%',
              }}
            >

              {[
                { label: 'Control', url: controlAccessUrl },
                { label: 'Mobile',  url: mobileAccessUrl },
                { label: 'Display', url: displayAccessUrl },
              ].map(({ label, url }, i, arr) => (
                <React.Fragment key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: theme.colors.textSecondary, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {label}
                    </span>
                    <CopyableUrl url={url} theme={theme} />
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ width: '1px', alignSelf: 'stretch', backgroundColor: theme.colors.cardBorder, flexShrink: 0 }} />
                  )}
                </React.Fragment>
              ))}

              {networkInfo.warning && (
                <span style={{ color: theme.colors.red, fontSize: '0.7rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {networkInfo.warning}
                </span>
              )}
            </div>
          )}

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
                padding: '0.65rem',
                borderRadius: '12px',
                boxShadow: `0 1px 3px ${theme.colors.shadow}`,
                border: `1px solid ${theme.colors.widgetBorder}`,
                borderLeft: `3px solid ${theme.colors.blue}`,
                transition: 'background-color 0.2s, box-shadow 0.2s',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: theme.colors.textSecondary,
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  transition: 'color 0.2s',
                }}
              >
                Current Total
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
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
                padding: '0.65rem',
                borderRadius: '12px',
                boxShadow: `0 1px 3px ${theme.colors.shadow}`,
                border: `1px solid ${theme.colors.widgetBorder}`,
                borderLeft: `3px solid ${theme.colors.green}`,
                transition: 'background-color 0.2s, box-shadow 0.2s',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: theme.colors.textSecondary,
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  transition: 'color 0.2s',
                }}
              >
                Goal
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
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
                  padding: '0.65rem',
                  borderRadius: '12px',
                  boxShadow: `0 1px 3px ${theme.colors.shadow}`,
                  border: `1px solid ${theme.colors.widgetBorder}`,
                  borderLeft: `3px solid ${theme.colors.purple}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: theme.colors.textSecondary,
                    marginBottom: '0.3rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    transition: 'color 0.2s',
                  }}
                >
                  Progress
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '1.2rem',
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
            borderRadius: '12px',
            boxShadow: `0 1px 3px ${theme.colors.shadow}`,
            border: `1px solid ${theme.colors.widgetBorder}`,
            transition: 'background-color 0.2s, box-shadow 0.2s',
          }}
        >
          <button
            onClick={() => setActiveTab('setup')}
            onMouseEnter={() => setHoveredTab('setup')}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              flex: 1,
              padding: isMobile ? '0.75rem 0.5rem' : '0.55rem 1rem',
              fontSize: '0.9375rem',
              fontWeight: '700',
              color: activeTab === 'setup' ? '#ffffff' : theme.colors.textSecondary,
              background: activeTab === 'setup'
                ? `linear-gradient(135deg, ${theme.colors.blue}, ${theme.colors.blueDark})`
                : hoveredTab === 'setup'
                  ? theme.colors.hover
                  : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'setup' ? `0 2px 8px ${theme.colors.shadowMd}` : 'none',
              letterSpacing: '0.03em',
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
              padding: isMobile ? '0.75rem 0.5rem' : '0.55rem 1rem',
              fontSize: '0.9375rem',
              fontWeight: '700',
              color: activeTab === 'live' ? '#ffffff' : theme.colors.textSecondary,
              background: activeTab === 'live'
                ? `linear-gradient(135deg, ${theme.colors.blue}, ${theme.colors.blueDark})`
                : hoveredTab === 'live'
                  ? theme.colors.hover
                  : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'live' ? `0 2px 8px ${theme.colors.shadowMd}` : 'none',
              letterSpacing: '0.03em',
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
                <SettingsPanel theme={theme} />
                {settings?.themeName === 'custom' && <CustomThemePanel theme={theme} />}
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <DonationLevelsPanel theme={theme} />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: '1 1 0', minWidth: 0 }}>
                    <LogoUploader theme={theme} />
                  </div>
                  <div style={{ flex: '1 1 0', minWidth: 0 }}>
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
            {/* Left Column — height locked to right column via ResizeObserver */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              height: liveColHeight ? `${liveColHeight}px` : undefined,
              minHeight: 0,
              overflow: 'hidden',
            }}>
              <BidForm theme={theme} />
              <BidHistory theme={theme} />
            </div>

            {/* Right Column */}
            <div ref={liveRightColRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            padding: '0.6rem 1rem',
            borderRadius: '12px',
            boxShadow: `0 1px 3px ${theme.colors.shadow}`,
            border: `1px solid ${theme.colors.widgetBorder}`,
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexWrap: 'wrap',
            transition: 'background-color 0.2s, box-shadow 0.2s',
          }}
        >
          <ResetButton theme={theme} />
          {window.desktop?.isElectron && window.desktop?.reopenDisplayWindow && (
            <button
              onClick={() => window.desktop!.reopenDisplayWindow!()}
              style={{
                padding: '0.625rem 1.25rem',
                border: `1px solid ${theme.colors.cardBorder}`,
                borderRadius: '6px',
                backgroundColor: theme.colors.cardBg,
                color: theme.colors.textSecondary,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: `0 1px 2px ${theme.colors.shadow}`,
                transition: 'all 0.2s ease',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.hover;
                e.currentTarget.style.color = theme.colors.textPrimary;
                e.currentTarget.style.borderColor = theme.colors.blue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.cardBg;
                e.currentTarget.style.color = theme.colors.textSecondary;
                e.currentTarget.style.borderColor = theme.colors.cardBorder;
              }}
            >
              Reopen Display
            </button>
          )}
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
            marginTop: '0.75rem',
            padding: '0.5rem',
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
              height: '36px',
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
