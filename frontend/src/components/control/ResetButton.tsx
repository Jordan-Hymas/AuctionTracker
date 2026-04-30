import { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import ConfirmDialog from '../common/ConfirmDialog';
import { ControlTheme } from '../../types/controlTheme';

interface ResetButtonProps {
  theme: ControlTheme;
}

export default function ResetButton({ theme }: ResetButtonProps) {
  const { resetAuction } = useAuction();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirm = async () => {
    setIsResetting(true);
    try {
      await resetAuction();
      setIsOpen(false);
    } catch (error) {
      alert('Failed to reset auction data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isResetting}
        style={{
          padding: '0.625rem 1.25rem',
          border: `1px solid ${isResetting ? theme.colors.cardBorder : theme.colors.red}`,
          borderRadius: '6px',
          backgroundColor: isResetting ? theme.colors.cardBorder : theme.colors.cardBg,
          color: isResetting ? theme.colors.textMuted : theme.colors.red,
          cursor: isResetting ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
          boxShadow: isResetting ? 'none' : `0 1px 2px ${theme.colors.shadow}`,
          transition: 'all 0.2s ease',
          letterSpacing: '0.025em',
        }}
        onMouseEnter={(e) => {
          if (!isResetting) {
            e.currentTarget.style.backgroundColor = theme.colors.redLight;
            e.currentTarget.style.color = theme.colors.redDark;
            e.currentTarget.style.borderColor = theme.colors.redDark;
            e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadowMd}`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isResetting) {
            e.currentTarget.style.backgroundColor = theme.colors.cardBg;
            e.currentTarget.style.color = theme.colors.red;
            e.currentTarget.style.borderColor = theme.colors.red;
            e.currentTarget.style.boxShadow = `0 1px 2px ${theme.colors.shadow}`;
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isResetting ? 'Resetting...' : 'Reset All Data'}
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        title="Reset All Data?"
        message="This will delete all bids and reset settings to defaults. This action cannot be undone."
        confirmText="Yes, Reset Everything"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
        danger={true}
        theme={theme}
      />
    </>
  );
}
