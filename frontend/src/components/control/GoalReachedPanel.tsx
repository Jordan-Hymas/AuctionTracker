import { useState, useEffect, useRef } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { ControlTheme } from '../../types/controlTheme';

interface GoalReachedPanelProps {
  theme: ControlTheme;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

export default function GoalReachedPanel({ theme }: GoalReachedPanelProps) {
  const { settings, updateSettings, uploadGoalReachedBackground, removeGoalReachedBackground } = useAuction();
  const [enabled, setEnabled] = useState(false);
  const [manualTotal, setManualTotal] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setEnabled(settings.goalReachedEnabled || false);
      setManualTotal(settings.goalReachedManualTotal?.toString() || '');
      setMessage(settings.goalReachedMessage || '');
    }
  }, [settings]);

  const handleBackgroundSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess(false);

    if (file.size > MAX_FILE_SIZE) {
      setError('Background file too large. Maximum size is 15MB.');
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, SVG, or WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackgroundPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingBackground(true);
    try {
      await uploadGoalReachedBackground(file);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload goal reached background');
      setBackgroundPreview(null);
    } finally {
      setIsUploadingBackground(false);
      if (backgroundInputRef.current) {
        backgroundInputRef.current.value = '';
      }
    }
  };

  const handleRemoveBackground = async () => {
    if (!confirm('Remove goal reached background image?')) {
      return;
    }

    setError('');
    setSuccess(false);
    setIsRemovingBackground(true);

    try {
      await removeGoalReachedBackground();
      setBackgroundPreview(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove goal reached background');
    } finally {
      setIsRemovingBackground(false);
    }
  };

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
            Fundraiser
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

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
          Goal Reached Background Image
        </label>

        {(settings?.goalReachedBackgroundPath || backgroundPreview) && (
          <div
            style={{
              marginBottom: '0.75rem',
              padding: '0.5rem',
              border: `1px solid ${theme.colors.cardBorder}`,
              borderRadius: '6px',
              backgroundColor: theme.mode === 'light' ? '#f9fafb' : theme.colors.inputBg,
            }}
          >
            <img
              src={backgroundPreview || settings?.goalReachedBackgroundPath || ''}
              alt="Goal reached background preview"
              style={{
                width: '100%',
                maxHeight: '140px',
                objectFit: 'cover',
                borderRadius: '4px',
              }}
            />
          </div>
        )}

        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/jpeg,image/png,image/svg+xml,image/webp"
          onChange={handleBackgroundSelect}
          disabled={isUploadingBackground || isRemovingBackground || isSaving}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => backgroundInputRef.current?.click()}
            disabled={isUploadingBackground || isRemovingBackground || isSaving}
            style={{
              flex: 1,
              padding: '0.625rem',
              border: `1px solid ${theme.colors.blue}`,
              borderRadius: '6px',
              backgroundColor: (isUploadingBackground || isRemovingBackground || isSaving) ? theme.colors.cardBorder : theme.colors.cardBg,
              color: (isUploadingBackground || isRemovingBackground || isSaving) ? theme.colors.textMuted : theme.colors.blue,
              cursor: (isUploadingBackground || isRemovingBackground || isSaving) ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
          >
            {isUploadingBackground ? 'Uploading...' : (settings?.goalReachedBackgroundPath ? 'Change Image' : 'Upload Image')}
          </button>

          {(settings?.goalReachedBackgroundPath || backgroundPreview) && (
            <button
              onClick={handleRemoveBackground}
              disabled={isUploadingBackground || isRemovingBackground || isSaving}
              style={{
                padding: '0.625rem 0.875rem',
                border: `1px solid ${theme.colors.red}`,
                borderRadius: '6px',
                backgroundColor: (isUploadingBackground || isRemovingBackground || isSaving) ? theme.colors.cardBorder : theme.colors.cardBg,
                color: (isUploadingBackground || isRemovingBackground || isSaving) ? theme.colors.textMuted : theme.colors.red,
                cursor: (isUploadingBackground || isRemovingBackground || isSaving) ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {isRemovingBackground ? '...' : 'Remove'}
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, marginTop: '0.25rem', transition: 'color 0.2s' }}>
          Optional: Display a custom background image only on the goal reached screen.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || isUploadingBackground || isRemovingBackground}
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
