import { useState, useEffect } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { ControlTheme } from '../../types/controlTheme';

interface ProgressBarThemePanelProps {
  theme: ControlTheme;
}

const PROGRESS_BAR_THEMES = [
  { value: 'thermostat', label: 'Thermostat' },
  { value: 'capsule-v2', label: 'Default' },
];

export default function ProgressBarThemePanel({ theme }: ProgressBarThemePanelProps) {
  const { settings, updateSettings } = useAuction();
  const [progressBarTheme, setProgressBarTheme] = useState('capsule-v2');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setProgressBarTheme(settings.progressBarTheme ?? 'capsule-v2');
    }
  }, [settings]);

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setIsSaving(true);

    try {
      await updateSettings({ progressBarTheme });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress bar theme');
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
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s, box-shadow 0.2s',
      }}
    >
      <h2 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: '600', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
        Progress Bar Theme
      </h2>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: theme.colors.redLight,
            color: theme.colors.redDark,
            borderRadius: '4px',
            marginBottom: '0.75rem',
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
            backgroundColor: theme.colors.greenLight,
            color: theme.colors.greenDark,
            borderRadius: '4px',
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
          }}
        >
          Progress bar theme saved!
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
          Theme Style
        </label>
        <select
          value={progressBarTheme}
          onChange={(e) => setProgressBarTheme(e.target.value)}
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '0.625rem',
            border: `1px solid ${theme.colors.inputBorder}`,
            borderRadius: '4px',
            fontSize: '0.875rem',
            backgroundColor: theme.colors.inputBg,
            color: theme.colors.textPrimary,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {PROGRESS_BAR_THEMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <p style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, marginTop: '0.25rem', transition: 'color 0.2s' }}>
          Choose how the fundraising progress bar is displayed on the event screen
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        style={{
          width: '100%',
          padding: '0.625rem',
          border: 'none',
          borderRadius: '6px',
          backgroundColor: isSaving ? theme.colors.cardBorder : theme.colors.green,
          color: 'white',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
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
        {isSaving ? 'Saving...' : 'Save Theme'}
      </button>
    </div>
  );
}
