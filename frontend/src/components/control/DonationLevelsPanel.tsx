import { useState, useEffect } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { ControlTheme } from '../../types/controlTheme';

interface DonationLevelsPanelProps {
  theme: ControlTheme;
}

export default function DonationLevelsPanel({ theme }: DonationLevelsPanelProps) {
  const { settings, updateSettings } = useAuction();
  const [levels, setLevels] = useState<number[]>([]);
  const [newLevel, setNewLevel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (settings?.donationLevels) {
      setLevels([...settings.donationLevels]);
    }
  }, [settings]);

  const handleAddLevel = () => {
    const amount = parseFloat(newLevel);

    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (levels.includes(amount)) {
      setErrorMessage('This level already exists');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const updatedLevels = [...levels, amount].sort((a, b) => a - b);
    setLevels(updatedLevels);
    setNewLevel('');
    setErrorMessage('');
  };

  const handleRemoveLevel = (levelToRemove: number) => {
    setLevels(levels.filter((l) => l !== levelToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updateSettings({ donationLevels: levels });
      setSuccessMessage('Donation levels saved successfully!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setErrorMessage('Failed to save donation levels');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddLevel();
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
        Donation Levels
      </h3>

      {/* Current Levels */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: theme.colors.textPrimary,
            marginBottom: '0.5rem',
            transition: 'color 0.2s',
          }}
        >
          Current Levels:
        </label>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            minHeight: '3rem',
            padding: '0.5rem',
            backgroundColor: theme.mode === 'light' ? '#f9fafb' : theme.colors.inputBg,
            borderRadius: '6px',
            border: `1px solid ${theme.colors.cardBorder}`,
            transition: 'all 0.2s',
          }}
        >
          {levels.length === 0 ? (
            <span style={{ color: theme.colors.textMuted, fontSize: '0.875rem', padding: '0.5rem', transition: 'color 0.2s' }}>
              No levels set. Add your first level below.
            </span>
          ) : (
            levels.map((level) => (
              <div
                key={level}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: theme.colors.blueLighter,
                  border: `1px solid ${theme.colors.blue}`,
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: theme.colors.blueDark,
                  transition: 'all 0.2s',
                }}
              >
                <span>{formatCurrency(level)}</span>
                <button
                  onClick={() => handleRemoveLevel(level)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: theme.colors.red,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '700',
                    padding: '0',
                    lineHeight: '1',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.colors.redDark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.colors.red;
                  }}
                  title="Remove level"
                >
                  X
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add New Level */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: theme.colors.textPrimary,
            marginBottom: '0.5rem',
            transition: 'color 0.2s',
          }}
        >
          Add New Level:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <input
            type="number"
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter amount (e.g., 500)"
            min="0"
            step="1"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '0.5rem 0.75rem',
              border: `1px solid ${theme.colors.inputBorder}`,
              borderRadius: '4px',
              fontSize: '0.875rem',
              backgroundColor: theme.colors.inputBg,
              color: theme.colors.textPrimary,
              transition: 'all 0.2s',
            }}
          />
          <button
            onClick={handleAddLevel}
            disabled={!newLevel}
            style={{
              padding: '0.5rem 0.875rem',
              backgroundColor: !newLevel ? theme.colors.cardBorder : theme.colors.blue,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: !newLevel ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (newLevel) {
                e.currentTarget.style.backgroundColor = theme.colors.blueDark;
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (newLevel) {
                e.currentTarget.style.backgroundColor = theme.colors.blue;
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: theme.colors.redLight,
            color: theme.colors.redDark,
            borderRadius: '4px',
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
            transition: 'all 0.2s',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: theme.colors.greenLight,
            color: theme.colors.greenDark,
            borderRadius: '4px',
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
            transition: 'all 0.2s',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        style={{
          width: '100%',
          padding: '0.625rem',
          backgroundColor: isSaving ? theme.colors.cardBorder : theme.colors.green,
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          letterSpacing: '0.025em',
          boxShadow: isSaving ? 'none' : `0 2px 4px ${theme.colors.shadowMd}`,
        }}
        onMouseEnter={(e) => {
          if (!isSaving) {
            e.currentTarget.style.backgroundColor = theme.colors.greenDark;
            e.currentTarget.style.boxShadow = `0 4px 8px ${theme.colors.shadowLg}`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSaving) {
            e.currentTarget.style.backgroundColor = theme.colors.green;
            e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadowMd}`;
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isSaving ? 'Saving...' : 'Save Donation Levels'}
      </button>
    </div>
  );
}
