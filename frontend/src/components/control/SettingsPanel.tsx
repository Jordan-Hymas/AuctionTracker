import { useState, useEffect } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { THEMES } from '../../types/theme';
import { ControlTheme } from '../../types/controlTheme';
import { generateProgressBarGradient } from '../../utils/colorUtils';

interface SettingsPanelProps {
  theme: ControlTheme;
}

export default function SettingsPanel({ theme }: SettingsPanelProps) {
  const { settings, updateSettings } = useAuction();
  const [startingTotal, setStartingTotal] = useState('0');
  const [goalAmount, setGoalAmount] = useState('');
  const [paddleDigits, setPaddleDigits] = useState(3);
  const [themeName, setThemeName] = useState('boysGirlsClub');
  const [showLastBid, setShowLastBid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const normalizeThemeName = (name: string | null | undefined): string => {
    if (!name) return 'boysGirlsClub';
    if (name === 'modern' || name === 'modernDots') return 'NPCE';
    return THEMES[name] ? name : 'boysGirlsClub';
  };

  useEffect(() => {
    if (settings) {
      setStartingTotal(settings.startingTotal.toString());
      setGoalAmount(settings.goalAmount?.toString() || '');
      setPaddleDigits(settings.paddleDigits ?? 3);
      setThemeName(normalizeThemeName(settings.themeName));
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

      const resolvedThemeName = normalizeThemeName(themeName);
      if (resolvedThemeName === 'custom') {
        // For custom theme: save basic settings + restore persisted custom colors/background
        const customPrimary = settings?.customPrimaryColor || '#2596be';
        const customSecondary = settings?.customSecondaryColor || '#2596be';
        const hasBackground = !!settings?.customBackgroundPath;

        await updateSettings({
          startingTotal: starting,
          goalAmount: goal,
          paddleDigits,
          themeName: resolvedThemeName,
          themePrimaryColor: customPrimary,
          themeSecondaryColor: customSecondary,
          themeBackgroundType: hasBackground ? 'image' : 'solid',
          themeBackgroundValue: hasBackground ? settings!.customBackgroundPath! : '#1a1a2e',
          themeProgressBarGradient: generateProgressBarGradient(customSecondary),
          showLastBid,
        });
      } else {
        const theme = THEMES[resolvedThemeName];

        await updateSettings({
          startingTotal: starting,
          goalAmount: goal,
          paddleDigits,
          themeName: resolvedThemeName,
          themePrimaryColor: theme.primaryColor,
          themeSecondaryColor: theme.secondaryColor,
          themeBackgroundType: theme.backgroundType,
          themeBackgroundValue: theme.backgroundValue,
          themeProgressBarGradient: theme.progressBarGradient,
          showLastBid,
        });
      }

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
      <h2 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: '600', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>Settings</h2>

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

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
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
          Initial amount before bids (e.g., $1,000)
        </p>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
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
          Fundraising goal (e.g., $10,000)
        </p>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
          Number of Paddle Digits
        </label>
        <select
          value={paddleDigits}
          onChange={(e) => setPaddleDigits(parseInt(e.target.value))}
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
          <option value={1}>1 digit (0–9)</option>
          <option value={2}>2 digits (0–99)</option>
          <option value={3}>3 digits (0–999)</option>
          <option value={4}>4 digits (0–9999)</option>
        </select>
        <p style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, marginTop: '0.25rem', transition: 'color 0.2s' }}>
          Max digits allowed when entering a paddle number on the live event screen
        </p>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
          Theme (Display Page)
        </label>
        <select
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
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
          {Object.entries(THEMES).map(([key, themeObj]) => (
            <option key={key} value={key}>
              {themeObj.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
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
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
