import { useAuction } from '../../context/AuctionContext';
import { ControlTheme } from '../../types/controlTheme';

interface CurrentLevelSelectorProps {
  theme: ControlTheme;
}

export default function CurrentLevelSelector({ theme }: CurrentLevelSelectorProps) {
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
          backgroundColor: theme.colors.cardBg,
          borderRadius: '8px',
          boxShadow: `0 1px 3px ${theme.colors.shadow}`,
          padding: '1rem',
          transition: 'background-color 0.2s, box-shadow 0.2s',
        }}
      >
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: theme.colors.textPrimary,
            transition: 'color 0.2s',
          }}
        >
          Select Active Level
        </h3>
        <p
          style={{
            color: theme.colors.textSecondary,
            fontSize: '0.875rem',
            transition: 'color 0.2s',
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
        backgroundColor: theme.colors.cardBg,
        borderRadius: '8px',
        boxShadow: `0 1px 3px ${theme.colors.shadow}`,
        padding: '1rem',
        transition: 'background-color 0.2s, box-shadow 0.2s',
      }}
    >
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: theme.colors.textPrimary,
          transition: 'color 0.2s',
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
          marginBottom: '0.75rem',
        }}
      >
        {donationLevels.map((level) => {
          const isActive = currentLevel === level;
          return (
            <button
              key={level}
              onClick={() => handleLevelSelect(level)}
              style={{
                padding: '0.875rem 0.5rem',
                backgroundColor: isActive ? theme.colors.green : theme.colors.inputBg,
                color: isActive ? 'white' : theme.colors.textPrimary,
                border: isActive ? `2px solid ${theme.colors.greenDark}` : `2px solid ${theme.colors.inputBorder}`,
                borderRadius: '6px',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 4px 6px ${theme.colors.shadowMd}` : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = theme.colors.hover;
                  e.currentTarget.style.borderColor = theme.colors.cardBorder;
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = theme.colors.inputBg;
                  e.currentTarget.style.borderColor = theme.colors.inputBorder;
                  e.currentTarget.style.transform = 'scale(1)';
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
            padding: '0.625rem',
            backgroundColor: theme.colors.cardBg,
            color: theme.colors.red,
            border: `1px solid ${theme.colors.red}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.025em',
            boxShadow: `0 1px 2px ${theme.colors.shadow}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.redLight;
            e.currentTarget.style.color = theme.colors.redDark;
            e.currentTarget.style.borderColor = theme.colors.redDark;
            e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadowMd}`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.cardBg;
            e.currentTarget.style.color = theme.colors.red;
            e.currentTarget.style.borderColor = theme.colors.red;
            e.currentTarget.style.boxShadow = `0 1px 2px ${theme.colors.shadow}`;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Clear Selection
        </button>
      )}
    </div>
  );
}
