import { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ResetButton() {
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
          padding: '0.75rem 1.5rem',
          border: '1px solid #dc2626',
          borderRadius: '4px',
          backgroundColor: 'white',
          color: '#dc2626',
          cursor: isResetting ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
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
      />
    </>
  );
}
