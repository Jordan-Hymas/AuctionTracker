import { useState, useEffect } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { ControlTheme } from '../../types/controlTheme';

interface GoalReachedPanelProps {
  theme: ControlTheme;
}

export default function GoalReachedPanel({ theme }: GoalReachedPanelProps) {
  const { settings, updateSettings } = useAuction();
  const [enabled, setEnabled] = useState(false);
  const [manualTotal, setManualTotal] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setEnabled(settings.goalReachedEnabled || false);
      setManualTotal(settings.goalReachedManualTotal?.toString() || '');
      setMessage(settings.goalReachedMessage || '');
    }
  }, [settings]);

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setIsSaving(true);

    try {
      const manual = manualTotal ? parseFloat(manualTotal) : null;

      if (manual !== null && manual <= 0) {
        setError('Manual total must be greater than 0');
        setIsSaving(false);
        return;
      }

      await updateSettings({
        goalReachedEnabled: enabled,
        goalReachedManualTotal: manual,
        goalReachedMessage: message || null,
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
        backgroundColor: theme.colors.cardBg,
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: `0 1px 3px ${theme.colors.shadow}`,
        transition: 'background-color 0.2s, box-shadow 0.2s',
      }}
    >
      <h2 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: '600', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
        Goal Reached Display
      </h2>
      <p style={{ fontSize: '0.875rem', color: theme.colors.textSecondary, marginBottom: '1rem', transition: 'color 0.2s' }}>
        Switch to goal reached mode to show final total
      </p>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: theme.colors.redLight,
            color: theme.colors.redDark,
            borderRadius: '4px',
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: theme.colors.greenLight,
            color: theme.colors.greenDark,
            borderRadius: '4px',
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
          }}
        >
          Settings saved successfully!
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
          Display Mode
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            onClick={() => setEnabled(false)}
            disabled={isSaving}
            style={{
              padding: '0.75rem',
              backgroundColor: !enabled ? theme.colors.blue : theme.colors.inputBg,
              color: !enabled ? '#ffffff' : theme.colors.textSecondary,
              border: `2px solid ${!enabled ? theme.colors.blue : theme.colors.inputBorder}`,
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Normal
          </button>
          <button
            onClick={() => setEnabled(true)}
            disabled={isSaving}
            style={{
              padding: '0.75rem',
              backgroundColor: enabled ? '#10b981' : theme.colors.inputBg,
              color: enabled ? '#ffffff' : theme.colors.textSecondary,
              border: `2px solid ${enabled ? '#10b981' : theme.colors.inputBorder}`,
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Goal Reached
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, transition: 'color 0.2s' }}>
          {enabled
            ? 'Shows final total with custom message'
            : 'Shows live auction with paddle numbers'
          }
        </p>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
          Manual Total Amount ($)
        </label>
        <input
          type="number"
          step="0.01"
          value={manualTotal}
          onChange={(e) => setManualTotal(e.target.value)}
          placeholder="Leave empty to use actual total"
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '0.625rem',
            border: `1px solid ${theme.colors.inputBorder}`,
            borderRadius: '4px',
            fontSize: '0.875rem',
            backgroundColor: theme.colors.inputBg,
            color: theme.colors.textPrimary,
            transition: 'all 0.2s',
          }}
        />
        <p style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, marginTop: '0.25rem', transition: 'color 0.2s' }}>
          Optional: Override the displayed total (e.g., $50,000)
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
          Celebratory Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter celebratory message (optional)"
          disabled={isSaving}
          rows={3}
          style={{
            width: '100%',
            padding: '0.625rem',
            border: `1px solid ${theme.colors.inputBorder}`,
            borderRadius: '4px',
            fontSize: '0.875rem',
            backgroundColor: theme.colors.inputBg,
            color: theme.colors.textPrimary,
            resize: 'vertical',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        />
        <p style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, marginTop: '0.25rem', transition: 'color 0.2s' }}>
          Optional: Custom message to display (e.g., "Thank you for your generous support!")
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        style={{
          width: '100%',
          padding: '0.875rem',
          backgroundColor: isSaving ? theme.colors.textMuted : (enabled ? '#10b981' : theme.colors.blue),
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          opacity: isSaving ? 0.7 : 1,
          transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {isSaving ? 'Updating Display...' : 'Update Display'}
      </button>
    </div>
  );
}
