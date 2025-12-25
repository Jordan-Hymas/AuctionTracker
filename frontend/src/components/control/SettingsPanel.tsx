import { useState, useEffect } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { THEMES } from '../../types/theme';

export default function SettingsPanel() {
  const { settings, updateSettings } = useAuction();
  const [startingTotal, setStartingTotal] = useState('0');
  const [goalAmount, setGoalAmount] = useState('');
  const [themeName, setThemeName] = useState('classic');
  const [showLastBid, setShowLastBid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setStartingTotal(settings.startingTotal.toString());
      setGoalAmount(settings.goalAmount?.toString() || '');
      setThemeName(settings.themeName);
      setShowLastBid(settings.showLastBid);
    }
  }, [settings]);

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setIsSaving(true);

    try {
      const starting = parseFloat(startingTotal) || 0;
      const goal = goalAmount ? parseFloat(goalAmount) : null;

      if (goal !== null && goal <= starting) {
        setError('Goal amount must be greater than starting total');
        setIsSaving(false);
        return;
      }

      const theme = THEMES[themeName];

      await updateSettings({
        startingTotal: starting,
        goalAmount: goal,
        themeName,
        themePrimaryColor: theme.primaryColor,
        themeSecondaryColor: theme.secondaryColor,
        themeBackgroundType: theme.backgroundType,
        themeBackgroundValue: theme.backgroundValue,
        themeProgressBarGradient: theme.progressBarGradient,
        showLastBid,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Settings</h2>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          Settings saved successfully!
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
          Starting Total ($)
        </label>
        <input
          type="number"
          step="0.01"
          value={startingTotal}
          onChange={(e) => setStartingTotal(e.target.value)}
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
          Initial amount before bids (e.g., $1,000)
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
          Goal Amount ($)
        </label>
        <input
          type="number"
          step="0.01"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
          placeholder="Optional"
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
          Fundraising goal (e.g., $10,000)
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
          Theme
        </label>
        <select
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '1rem',
            backgroundColor: 'white',
          }}
        >
          {Object.entries(THEMES).map(([key, theme]) => (
            <option key={key} value={key}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showLastBid}
            onChange={(e) => setShowLastBid(e.target.checked)}
            disabled={isSaving}
            style={{ marginRight: '0.5rem', width: '1rem', height: '1rem', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Show Last Bid Animation</span>
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: isSaving ? '#9ca3af' : '#10b981',
          color: 'white',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
        }}
      >
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
