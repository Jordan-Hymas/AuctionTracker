import { useState, useRef } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { ControlTheme } from '../../types/controlTheme';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

interface LogoUploaderProps {
  theme: ControlTheme;
}

export default function LogoUploader({ theme }: LogoUploaderProps) {
  const { settings, uploadLogo, removeLogo } = useAuction();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, SVG, or WebP.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      await uploadLogo(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
      setPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove the logo?')) {
      return;
    }

    setIsRemoving(true);
    setError('');
    try {
      await removeLogo();
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove logo');
    } finally {
      setIsRemoving(false);
    }
  };

  const currentLogoUrl = settings?.logoPath || preview;

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
        Logo
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
            transition: 'all 0.2s',
          }}
        >
          {error}
        </div>
      )}

      {currentLogoUrl && (
        <div
          style={{
            marginBottom: '0.75rem',
            padding: '0.75rem',
            border: `1px solid ${theme.colors.cardBorder}`,
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.mode === 'light' ? '#f9fafb' : theme.colors.inputBg,
            transition: 'all 0.2s',
          }}
        >
          <img
            src={currentLogoUrl}
            alt="Logo preview"
            style={{
              maxWidth: '100%',
              maxHeight: '120px',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/svg+xml,image/webp"
        onChange={handleFileSelect}
        disabled={isUploading}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isRemoving}
          style={{
            flex: 1,
            padding: '0.625rem',
            border: `1px solid ${theme.colors.blue}`,
            borderRadius: '6px',
            backgroundColor: isUploading || isRemoving ? theme.colors.cardBorder : theme.colors.cardBg,
            color: isUploading || isRemoving ? theme.colors.textMuted : theme.colors.blue,
            cursor: isUploading || isRemoving ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            letterSpacing: '0.025em',
            boxShadow: isUploading || isRemoving ? 'none' : `0 1px 2px ${theme.colors.shadow}`,
          }}
          onMouseEnter={(e) => {
            if (!isUploading && !isRemoving) {
              e.currentTarget.style.backgroundColor = theme.colors.blueLighter;
              e.currentTarget.style.color = theme.colors.blueDark;
              e.currentTarget.style.borderColor = theme.colors.blueDark;
              e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadowMd}`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isUploading && !isRemoving) {
              e.currentTarget.style.backgroundColor = theme.colors.cardBg;
              e.currentTarget.style.color = theme.colors.blue;
              e.currentTarget.style.borderColor = theme.colors.blue;
              e.currentTarget.style.boxShadow = `0 1px 2px ${theme.colors.shadow}`;
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isUploading ? 'Uploading...' : currentLogoUrl ? 'Change Logo' : 'Upload Logo'}
        </button>

        {currentLogoUrl && (
          <button
            onClick={handleRemoveLogo}
            disabled={isUploading || isRemoving}
            style={{
              padding: '0.625rem 0.875rem',
              border: `1px solid ${theme.colors.red}`,
              borderRadius: '6px',
              backgroundColor: isUploading || isRemoving ? theme.colors.cardBorder : theme.colors.cardBg,
              color: isUploading || isRemoving ? theme.colors.textMuted : theme.colors.red,
              cursor: isUploading || isRemoving ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              letterSpacing: '0.025em',
              boxShadow: isUploading || isRemoving ? 'none' : `0 1px 2px ${theme.colors.shadow}`,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isUploading && !isRemoving) {
                e.currentTarget.style.backgroundColor = theme.colors.redLight;
                e.currentTarget.style.color = theme.colors.redDark;
                e.currentTarget.style.borderColor = theme.colors.redDark;
                e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadowMd}`;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading && !isRemoving) {
                e.currentTarget.style.backgroundColor = theme.colors.cardBg;
                e.currentTarget.style.color = theme.colors.red;
                e.currentTarget.style.borderColor = theme.colors.red;
                e.currentTarget.style.boxShadow = `0 1px 2px ${theme.colors.shadow}`;
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            title="Remove Logo"
          >
            {isRemoving ? '...' : 'Remove'}
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, marginTop: '0.5rem', textAlign: 'center', transition: 'color 0.2s' }}>
        Max 5MB • JPEG, PNG, SVG, WebP
      </p>
    </div>
  );
}
