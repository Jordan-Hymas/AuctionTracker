import { useState, useRef, useEffect } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { ControlTheme } from '../../types/controlTheme';

interface BidFormProps {
  theme: ControlTheme;
}

export default function BidForm({ theme }: BidFormProps) {
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

    // Validate paddle number is 1-3 digits only
    if (!/^\d{1,3}$/.test(paddleNumber.trim())) {
      setError('Paddle number must be 1-3 digits (0-999)');
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
        backgroundColor: theme.colors.cardBg,
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: `0 1px 3px ${theme.colors.shadow}`,
        transition: 'background-color 0.2s, box-shadow 0.2s',
      }}
    >
      <h2 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: '600', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
        Add Bid
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
            transition: 'background-color 0.2s, color 0.2s',
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
            transition: 'background-color 0.2s, color 0.2s',
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
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: currentLevel ? theme.colors.greenLight : theme.colors.cardBorder,
              border: `2px solid ${currentLevel ? theme.colors.green : theme.colors.inputBorder}`,
              borderRadius: '6px',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: currentLevel ? theme.colors.greenDark : theme.colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.25rem',
                transition: 'color 0.2s',
              }}
            >
              Selected Level
            </div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: '900',
                color: currentLevel ? theme.colors.greenDark : theme.colors.textMuted,
                lineHeight: '1',
                transition: 'color 0.2s',
              }}
            >
              {currentLevel ? formatCurrency(currentLevel) : 'No level selected'}
            </div>
          </div>
        )}

        {/* Custom Amount Checkbox */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: theme.colors.textPrimary,
              transition: 'color 0.2s',
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
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
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
                padding: '0.625rem',
                border: `1px solid ${theme.colors.inputBorder}`,
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.textPrimary,
                transition: 'all 0.2s',
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
            Paddle Number *
          </label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            value={paddleNumber}
            onChange={(e) => {
              // Only allow digits
              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
              setPaddleNumber(value);
            }}
            placeholder="e.g., 134"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.625rem',
              border: `1px solid ${theme.colors.inputBorder}`,
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: theme.colors.inputBg,
              color: theme.colors.textPrimary,
              transition: 'all 0.2s',
            }}
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (!useCustomAmount && !currentLevel)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: isSubmitting || (!useCustomAmount && !currentLevel) ? theme.colors.cardBorder : theme.colors.blue,
            color: isSubmitting || (!useCustomAmount && !currentLevel) ? theme.colors.textMuted : 'white',
            cursor: isSubmitting || (!useCustomAmount && !currentLevel) ? 'not-allowed' : 'pointer',
            fontSize: '0.9375rem',
            fontWeight: '600',
            boxShadow: isSubmitting || (!useCustomAmount && !currentLevel) ? 'none' : `0 2px 4px ${theme.colors.shadowMd}`,
            transition: 'all 0.2s ease',
            letterSpacing: '0.025em',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting && (useCustomAmount || currentLevel)) {
              e.currentTarget.style.backgroundColor = theme.colors.blueDark;
              e.currentTarget.style.boxShadow = `0 4px 8px ${theme.colors.shadowLg}`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting && (useCustomAmount || currentLevel)) {
              e.currentTarget.style.backgroundColor = theme.colors.blue;
              e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadowMd}`;
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Bid'}
        </button>
      </form>
    </div>
  );
}
