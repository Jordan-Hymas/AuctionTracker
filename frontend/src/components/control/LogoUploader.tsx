import { useState, useRef } from 'react';
import { useAuction } from '../../context/AuctionContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

export default function LogoUploader() {
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
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Logo</h2>

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

      {currentLogoUrl && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f9fafb',
          }}
        >
          <img
            src={currentLogoUrl}
            alt="Logo preview"
            style={{
              maxWidth: '100%',
              maxHeight: '150px',
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
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: isUploading || isRemoving ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          {isUploading ? 'Uploading...' : currentLogoUrl ? 'Change Logo' : 'Upload Logo'}
        </button>

        {currentLogoUrl && (
          <button
            onClick={handleRemoveLogo}
            disabled={isUploading || isRemoving}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#ef4444',
              cursor: isUploading || isRemoving ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
            }}
            title="Remove Logo"
          >
            {isRemoving ? '...' : 'Remove'}
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
        Max 5MB • JPEG, PNG, SVG, WebP
      </p>
    </div>
  );
}
