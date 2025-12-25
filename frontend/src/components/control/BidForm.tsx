import { useState, useRef, useEffect } from 'react';
import { useAuction } from '../../context/AuctionContext';

export default function BidForm() {
  const { addBid, settings } = useAuction();
  const [paddleNumber, setPaddleNumber] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentLevel = settings?.currentDonationLevel;

  // Auto-focus on mount and after submission
  useEffect(() => {
    inputRef.current?.focus();
  }, [success]);

  // Global keyboard handler to focus input when typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing and not in another input/textarea, focus the paddle number input
      const target = e.target as HTMLElement;
      const isTyping = /^[a-z0-9]$/i.test(e.key);
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (isTyping && !isInInput) {
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!paddleNumber.trim()) {
      setError('Paddle number is required');
      return;
    }

    let bidAmount: number;

    if (useCustomAmount) {
      const parsedAmount = parseFloat(customAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Custom amount must be a positive number');
        return;
      }
      bidAmount = parsedAmount;
    } else {
      if (!currentLevel || currentLevel <= 0) {
        setError('Please select a donation level first');
        return;
      }
      bidAmount = currentLevel;
    }

    setIsSubmitting(true);

    try {
      await addBid(paddleNumber.trim(), bidAmount);
      setPaddleNumber('');
      setCustomAmount('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      // Re-focus after successful submission
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Add Bid</h2>

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

      {success && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          Bid added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Current Selected Level Display */}
        {!useCustomAmount && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: currentLevel ? '#d1fae5' : '#f3f4f6',
              border: `2px solid ${currentLevel ? '#10b981' : '#d1d5db'}`,
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: currentLevel ? '#065f46' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.25rem',
              }}
            >
              Selected Level
            </div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: currentLevel ? '#047857' : '#9ca3af',
                lineHeight: '1',
              }}
            >
              {currentLevel ? formatCurrency(currentLevel) : 'No level selected'}
            </div>
          </div>
        )}

        {/* Custom Amount Checkbox */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            <input
              type="checkbox"
              checked={useCustomAmount}
              onChange={(e) => setUseCustomAmount(e.target.checked)}
              style={{
                width: '1rem',
                height: '1rem',
                cursor: 'pointer',
              }}
            />
            Use Custom Amount
          </label>
        </div>

        {/* Custom Amount Input */}
        {useCustomAmount && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Custom Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
            Paddle Number *
          </label>
          <input
            ref={inputRef}
            type="text"
            value={paddleNumber}
            onChange={(e) => setPaddleNumber(e.target.value)}
            placeholder="e.g., 134"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (!useCustomAmount && !currentLevel)}
          style={{
            width: '100%',
            padding: '0.875rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: isSubmitting || (!useCustomAmount && !currentLevel) ? '#9ca3af' : '#2563eb',
            color: 'white',
            cursor: isSubmitting || (!useCustomAmount && !currentLevel) ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Bid'}
        </button>
      </form>
    </div>
  );
}
