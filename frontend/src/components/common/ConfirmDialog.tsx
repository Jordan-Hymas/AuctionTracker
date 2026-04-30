import { ControlTheme } from '../../types/controlTheme';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  theme: ControlTheme;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  theme,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: theme.colors.cardBg,
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '420px',
          width: '90%',
          boxShadow: `0 8px 32px ${theme.colors.shadowLg}`,
          borderTop: danger ? '3px solid #dc2626' : `3px solid ${theme.colors.blue}`,
          border: `1px solid ${theme.colors.cardBorder}`,
          borderTopColor: danger ? '#dc2626' : theme.colors.blue,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '0.875rem', fontSize: '1.25rem', fontWeight: '700', color: theme.colors.textPrimary }}>{title}</h2>
        <p style={{ marginBottom: '2rem', color: theme.colors.textSecondary, lineHeight: '1.6', fontSize: '0.9375rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1.25rem',
              border: `1px solid ${theme.colors.cardBorder}`,
              borderRadius: '8px',
              backgroundColor: theme.colors.cardBg,
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: '500',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.hover;
              e.currentTarget.style.color = theme.colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.cardBg;
              e.currentTarget.style.color = theme.colors.textSecondary;
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              borderRadius: '8px',
              background: danger
                ? 'linear-gradient(135deg, #dc2626, #991b1b)'
                : `linear-gradient(135deg, ${theme.colors.blue}, ${theme.colors.blueDark})`,
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: '600',
              transition: 'all 0.15s',
              boxShadow: `0 2px 6px ${theme.colors.shadowMd}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.shadowLg}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 2px 6px ${theme.colors.shadowMd}`;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
