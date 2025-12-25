interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>{title}</h2>
        <p style={{ marginBottom: '2rem', color: '#4b5563', lineHeight: '1.5' }}>{message}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: danger ? '#dc2626' : '#2563eb',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
