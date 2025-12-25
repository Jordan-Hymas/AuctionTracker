import { useState, useEffect } from 'react';
import { useAuction } from '../../context/AuctionContext';

export default function DonationLevelsPanel() {
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
        Donation Levels
      </h3>

      {/* Current Levels */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem',
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
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}
        >
          {levels.length === 0 ? (
            <span style={{ color: '#9ca3af', fontSize: '0.875rem', padding: '0.5rem' }}>
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
                  backgroundColor: '#dbeafe',
                  border: '1px solid #3b82f6',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1e40af',
                }}
              >
                <span>{formatCurrency(level)}</span>
                <button
                  onClick={() => handleRemoveLevel(level)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '700',
                    padding: '0',
                    lineHeight: '1',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#ef4444';
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
      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem',
          }}
        >
          Add New Level:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          />
          <button
            onClick={handleAddLevel}
            disabled={!newLevel}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: !newLevel ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: !newLevel ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (newLevel) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (newLevel) {
                e.currentTarget.style.backgroundColor = '#2563eb';
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
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '6px',
            fontSize: '0.875rem',
            marginBottom: '1rem',
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
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '6px',
            fontSize: '0.875rem',
            marginBottom: '1rem',
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
          padding: '0.75rem',
          backgroundColor: isSaving ? '#9ca3af' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isSaving) {
            e.currentTarget.style.backgroundColor = '#059669';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSaving) {
            e.currentTarget.style.backgroundColor = '#10b981';
          }
        }}
      >
        {isSaving ? 'Saving...' : 'Save Donation Levels'}
      </button>
    </div>
  );
}
