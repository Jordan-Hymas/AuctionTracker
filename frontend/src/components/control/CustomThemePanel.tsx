import { useState, useEffect, useRef } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { THEMES } from '../../types/theme';
import { generateProgressBarGradient } from '../../utils/colorUtils';
import { ControlTheme } from '../../types/controlTheme';

interface CustomThemePanelProps {
  theme: ControlTheme;
}

export default function CustomThemePanel({ theme }: CustomThemePanelProps) {
  const { settings, updateSettings, uploadBackground, removeBackground } = useAuction();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [colorMode, setColorMode] = useState<'preset' | 'custom'>('custom');
  const [colorPreset, setColorPreset] = useState('boysGirlsClub');
  const [primaryColor, setPrimaryColor] = useState('#2596be');
  const [secondaryColor, setSecondaryColor] = useState('#2596be');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const normalizePresetName = (name: string | null | undefined): string => {
    if (!name) return 'boysGirlsClub';
    if (name === 'modern' || name === 'modernDots') return 'NPCE';
    return THEMES[name] ? name : 'boysGirlsClub';
  };

  // Sync from persisted settings
  useEffect(() => {
    if (settings) {
      setPrimaryColor(settings.customPrimaryColor || '#2596be');
      setSecondaryColor(settings.customSecondaryColor || '#2596be');
      if (settings.customColorPreset) {
        setColorMode('preset');
        setColorPreset(normalizePresetName(settings.customColorPreset));
      } else {
        setColorMode('custom');
      }
    }
  }, [settings]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB');
      return;
    }

    setIsUploading(true);
    setError('');
    try {
      await uploadBackground(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload background');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveBackground = async () => {
    setError('');
    try {
      await removeBackground();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove background');
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setIsSaving(true);

    try {
      // Resolve effective colors
      let effectivePrimary = primaryColor;
      let effectiveSecondary = secondaryColor;

      if (colorMode === 'preset') {
        const presetTheme = THEMES[colorPreset];
        if (presetTheme) {
          effectivePrimary = presetTheme.primaryColor;
          effectiveSecondary = presetTheme.secondaryColor;
        }
      }

      const hasBackground = !!settings?.customBackgroundPath;

      await updateSettings({
        // Persist custom config
        customPrimaryColor: effectivePrimary,
        customSecondaryColor: effectiveSecondary,
        customColorPreset: colorMode === 'preset' ? colorPreset : null,
        // Apply active theme fields
        themePrimaryColor: effectivePrimary,
        themeSecondaryColor: effectiveSecondary,
        themeBackgroundType: hasBackground ? 'image' : 'solid',
        themeBackgroundValue: hasBackground ? settings!.customBackgroundPath! : '#1a1a2e',
        themeProgressBarGradient: generateProgressBarGradient(effectiveSecondary),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save custom theme');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter out 'custom' from preset list
  const presetThemes = Object.entries(THEMES).filter(([key]) => key !== 'custom');

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
      <h2 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: '600', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
        Custom Theme
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
          Custom theme saved!
        </div>
      )}

      {/* Background Image Upload */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary }}>
          Background Image
        </label>

        {settings?.customBackgroundPath ? (
          <div style={{ marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '100%',
                height: '120px',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '0.5rem',
                border: `1px solid ${theme.colors.inputBorder}`,
              }}
            >
              <img
                src={settings.customBackgroundPath}
                alt="Custom background"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <button
              onClick={handleRemoveBackground}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                border: `1px solid ${theme.colors.red}`,
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: theme.colors.red,
                cursor: 'pointer',
              }}
            >
              Remove Background
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/svg+xml,image/webp"
              onChange={handleFileUpload}
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '0.875rem',
                border: `1px solid ${theme.colors.inputBorder}`,
                borderRadius: '4px',
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.textPrimary,
              }}
            />
          </div>
        )}
        <p style={{ fontSize: '0.7rem', color: theme.colors.textSecondary, marginTop: '0.25rem' }}>
          Recommended: 3840x2160 (4K). Min: 1920x1080. Max 15MB.
        </p>
      </div>

      {/* Color Mode Toggle */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary }}>
          Colors
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button
            onClick={() => setColorMode('preset')}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              border: `1px solid ${colorMode === 'preset' ? theme.colors.blue : theme.colors.inputBorder}`,
              borderRadius: '4px',
              backgroundColor: colorMode === 'preset' ? theme.colors.blue : 'transparent',
              color: colorMode === 'preset' ? '#ffffff' : theme.colors.textPrimary,
              cursor: 'pointer',
            }}
          >
            Inherit from Preset
          </button>
          <button
            onClick={() => setColorMode('custom')}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              border: `1px solid ${colorMode === 'custom' ? theme.colors.blue : theme.colors.inputBorder}`,
              borderRadius: '4px',
              backgroundColor: colorMode === 'custom' ? theme.colors.blue : 'transparent',
              color: colorMode === 'custom' ? '#ffffff' : theme.colors.textPrimary,
              cursor: 'pointer',
            }}
          >
            Custom RGB
          </button>
        </div>

        {colorMode === 'preset' ? (
          <select
            value={colorPreset}
            onChange={(e) => setColorPreset(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem',
              border: `1px solid ${theme.colors.inputBorder}`,
              borderRadius: '4px',
              fontSize: '0.875rem',
              backgroundColor: theme.colors.inputBg,
              color: theme.colors.textPrimary,
              cursor: 'pointer',
            }}
          >
            {presetThemes.map(([key, themeObj]) => (
              <option key={key} value={key}>
                {themeObj.name}
              </option>
            ))}
          </select>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: theme.colors.textSecondary, marginBottom: '0.25rem' }}>
                Primary
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ width: '40px', height: '32px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    fontSize: '0.8rem',
                    border: `1px solid ${theme.colors.inputBorder}`,
                    borderRadius: '4px',
                    backgroundColor: theme.colors.inputBg,
                    color: theme.colors.textPrimary,
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: theme.colors.textSecondary, marginBottom: '0.25rem' }}>
                Secondary
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{ width: '40px', height: '32px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    fontSize: '0.8rem',
                    border: `1px solid ${theme.colors.inputBorder}`,
                    borderRadius: '4px',
                    backgroundColor: theme.colors.inputBg,
                    color: theme.colors.textPrimary,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
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
        {isSaving ? 'Saving...' : 'Save Custom Theme'}
      </button>
    </div>
  );
}
