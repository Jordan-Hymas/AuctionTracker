import { useAuction } from '../context/AuctionContext';
import BidForm from '../components/control/BidForm';
import BidHistory from '../components/control/BidHistory';
import SettingsPanel from '../components/control/SettingsPanel';
import LogoUploader from '../components/control/LogoUploader';
import ExportButton from '../components/control/ExportButton';
import ResetButton from '../components/control/ResetButton';
import CurrentLevelSelector from '../components/control/CurrentLevelSelector';
import DonationLevelsPanel from '../components/control/DonationLevelsPanel';
import { adminApi } from '../services/api';
import { useState, useEffect } from 'react';

export default function Control() {
  const { currentTotal, goalAmount, startingTotal, isConnected, isLoading } = useAuction();
  const [serverInfo, setServerInfo] = useState<{ ipAddresses: string[]; port: number } | null>(null);

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

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.5rem',
          color: '#6b7280',
        }}
      >
        Loading...
      </div>
    );
  }

  const progress = goalAmount ? ((currentTotal - startingTotal) / (goalAmount - startingTotal)) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>Control Panel</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {serverInfo && serverInfo.ipAddresses.length > 0 && (
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Server: {serverInfo.ipAddresses[0]}:{serverInfo.port}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? '#10b981' : '#ef4444',
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Current Total</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb' }}>
                {formatCurrency(currentTotal)}
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Goal</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                {goalAmount ? formatCurrency(goalAmount) : 'Not set'}
              </div>
            </div>

            {goalAmount && (
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Progress</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
                  {Math.min(Math.max(progress, 0), 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <BidForm />
            <BidHistory />
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <CurrentLevelSelector />
            <DonationLevelsPanel />
            <SettingsPanel />
            <LogoUploader />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <ExportButton />
          <ResetButton />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'inline-block',
            }}
          >
            Open Display View
          </a>
        </div>
      </div>
    </div>
  );
}
