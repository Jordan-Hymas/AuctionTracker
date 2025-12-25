import { useAuction } from '../../context/AuctionContext';

export default function CurrentLevelSelector() {
  const { settings, updateSettings } = useAuction();

  const donationLevels = settings?.donationLevels || [];
  const currentLevel = settings?.currentDonationLevel;

  const handleLevelSelect = async (level: number | null) => {
    try {
      await updateSettings({ currentDonationLevel: level });
    } catch (err) {
      console.error('Failed to update current donation level:', err);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (donationLevels.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
        }}
      >
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#111827',
          }}
        >
          Select Active Level
        </h3>
        <p
          style={{
            color: '#6b7280',
            fontSize: '0.875rem',
          }}
        >
          No donation levels configured. Add levels below to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
      }}
    >
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#111827',
        }}
      >
        Select Active Level
      </h3>

      {/* Button Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        {donationLevels.map((level) => {
          const isActive = currentLevel === level;
          return (
            <button
              key={level}
              onClick={() => handleLevelSelect(level)}
              style={{
                padding: '1rem 0.5rem',
                backgroundColor: isActive ? '#10b981' : '#f3f4f6',
                color: isActive ? 'white' : '#374151',
                border: isActive ? '2px solid #059669' : '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 6px rgba(16, 185, 129, 0.3)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }
              }}
            >
              {formatCurrency(level)}
            </button>
          );
        })}
      </div>

      {/* Clear Selection Button */}
      {currentLevel !== null && (
        <button
          onClick={() => handleLevelSelect(null)}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ef4444';
          }}
        >
          Clear Selection
        </button>
      )}
    </div>
  );
}
