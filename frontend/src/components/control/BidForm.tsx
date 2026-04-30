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
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentLevel = settings?.currentDonationLevel;
  const maxDigits = settings?.paddleDigits ?? 3;

  // Auto-focus on mount and after submission
  useEffect(() => {
    inputRef.current?.focus();
  }, [success]);

  // Global keyboard handler to focus input when typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setSuccess(false);

    if (!paddleNumber.trim()) {
      setError('Paddle number is required');
      return;
    }

    // Validate paddle number — allow 1 up to maxDigits digits (flexible, no forced leading zeros)
    const digitRegex = new RegExp(`^\\d{1,${maxDigits}}$`);
    if (!digitRegex.test(paddleNumber.trim())) {
      setError(`Paddle number must be 1–${maxDigits} digit${maxDigits === 1 ? '' : 's'}`);
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
      setTimeout(() => setSuccess(false), 600);
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

  const isDisabled = isSubmitting || (!useCustomAmount && !currentLevel) || paddleNumber.length === 0;

  return (
    <div
      style={{
        backgroundColor: theme.colors.cardBg,
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: `0 1px 3px ${theme.colors.shadow}`,
        border: `1px solid ${theme.colors.widgetBorder}`,
        borderLeft: `3px solid ${theme.colors.blue}`,
        transition: 'background-color 0.2s, box-shadow 0.2s',
      }}
    >
      <h2 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: '600', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
        Add Bid
      </h2>

      {error && (
        <div
          style={{
            padding: '0.625rem 0.875rem',
            backgroundColor: theme.colors.redLight,
            color: theme.colors.redDark,
            borderRadius: '6px',
            borderLeft: `3px solid ${theme.colors.red}`,
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s, color 0.2s',
          }}
        >
          {error}
        </div>
      )}


      <div role="presentation">
        {/* Current Selected Level Display */}
        {!useCustomAmount && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.875rem',
              backgroundColor: currentLevel ? theme.colors.greenLight : theme.colors.cardBorder,
              border: `2px solid ${currentLevel ? theme.colors.green : theme.colors.inputBorder}`,
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                color: currentLevel ? theme.colors.greenDark : theme.colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '0.35rem',
                transition: 'color 0.2s',
              }}
            >
              Selected Level
            </div>
            <div
              style={{
                fontSize: '2rem',
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
              style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
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
                borderRadius: '6px',
                fontSize: '1rem',
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.textPrimary,
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '0.875rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
            Paddle Number *{' '}
            <span style={{ fontWeight: '400', color: theme.colors.textSecondary }}>
              (up to {maxDigits} digits)
            </span>
          </label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={maxDigits}
            value={paddleNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, maxDigits);
              setPaddleNumber(value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={`e.g., ${maxDigits}`}
            disabled={isSubmitting}
            autoComplete="off"
            autoFocus
            style={{
              width: '100%',
              padding: '0.625rem',
              border: `1px solid ${success ? theme.colors.green : inputFocused ? theme.colors.blue : theme.colors.inputBorder}`,
              borderRadius: '6px',
              fontSize: '1rem',
              backgroundColor: success ? theme.colors.greenLight : theme.colors.inputBg,
              color: theme.colors.textPrimary,
              transition: 'all 0.2s',
              boxShadow: success ? `0 0 0 3px ${theme.colors.greenLight}` : inputFocused ? `0 0 0 3px ${theme.colors.blueLighter}` : 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          style={{
            width: '100%',
            padding: '0.875rem',
            border: 'none',
            borderRadius: '8px',
            background: isDisabled
              ? theme.colors.cardBorder
              : `linear-gradient(135deg, ${theme.colors.blue}, ${theme.colors.blueDark})`,
            color: isDisabled ? theme.colors.textMuted : 'white',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            fontSize: '0.9375rem',
            fontWeight: '700',
            boxShadow: isDisabled ? 'none' : `0 2px 4px ${theme.colors.shadowMd}`,
            transition: 'all 0.2s ease',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.shadowLg}`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadowMd}`;
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Bid'}
        </button>
      </div>
    </div>
  );
}
