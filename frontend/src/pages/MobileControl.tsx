import { useState, useRef, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';

export default function MobileControl() {
  const { addBid, settings, currentTotal, undoLastBid } = useAuction();
  const [paddleNumber, setPaddleNumber] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentLevel = settings?.currentDonationLevel;

  // Auto-focus and keep keyboard open
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!paddleNumber.trim()) {
      setError('Paddle number required');
      return;
    }

    // Validate paddle number is 1-3 digits only
    if (!/^\d{1,3}$/.test(paddleNumber.trim())) {
      setError('Paddle must be 1-3 digits');
      return;
    }

    let bidAmount: number;

    if (useCustomAmount) {
      const parsedAmount = parseFloat(customAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Invalid amount');
        return;
      }
      bidAmount = parsedAmount;
    } else {
      if (!currentLevel || currentLevel <= 0) {
        setError('Select level first');
        return;
      }
      bidAmount = currentLevel;
    }

    setIsSubmitting(true);

    try {
      await addBid(paddleNumber.trim(), bidAmount);

      // Clear and show success
      setPaddleNumber('');
      setCustomAmount('');
      setSuccess(true);

      // Keep focus to maintain keyboard
      inputRef.current?.focus();

      // Hide success message
      setTimeout(() => setSuccess(false), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      setTimeout(() => setError(''), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter/Go key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Go') {
      e.preventDefault();
      handleSubmit();
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
        minHeight: '100vh',
        maxWidth: '100vw',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: 'max(env(safe-area-inset-top), 1rem) 1rem 1rem 1rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Bidding
          </h1>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0f766e' }}>
            {formatCurrency(currentTotal)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '1rem',
          paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        {/* Status Messages */}
        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '12px',
              marginBottom: '1rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#ccfbf1',
              color: '#115e59',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              textAlign: 'center',
              border: '2px solid #0f766e',
            }}
          >
            ✓ Bid Added!
          </div>
        )}

        {/* Current Level Display */}
        {!useCustomAmount && (
          <div
            style={{
              backgroundColor: currentLevel ? '#f0fdfa' : '#f8fafc',
              border: `3px solid ${currentLevel ? '#0f766e' : '#cbd5e1'}`,
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: '700',
                color: currentLevel ? '#115e59' : '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}
            >
              Current Level
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: '900',
                color: currentLevel ? '#0f766e' : '#94a3b8',
                lineHeight: '1',
              }}
            >
              {currentLevel ? formatCurrency(currentLevel) : 'Not Set'}
            </div>
          </div>
        )}

        {/* Form Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Custom Amount Toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={useCustomAmount}
              onChange={(e) => setUseCustomAmount(e.target.checked)}
              style={{
                width: '1.5rem',
                height: '1.5rem',
                cursor: 'pointer',
              }}
            />
            Use Custom Amount
          </label>

          {/* Custom Amount Input */}
          {useCustomAmount && (
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Amount ($)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  backgroundColor: '#ffffff',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Paddle Number Input */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Paddle Number
            </label>
            <input
              ref={inputRef}
              type="search"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              value={paddleNumber}
              onChange={(e) => {
                // Only allow digits, max 3
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                setPaddleNumber(value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="000"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              enterKeyHint="go"
              style={{
                width: '100%',
                padding: '1.25rem',
                border: '3px solid #0f766e',
                borderRadius: '16px',
                fontSize: '2.5rem',
                fontWeight: '700',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                WebkitAppearance: 'none',
                appearance: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Large Submit Button - Optimized for thumb tapping */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (!useCustomAmount && !currentLevel)}
            onTouchStart={(e) => {
              // Prevent focus loss on touch
              e.preventDefault();
              if (!isSubmitting && (useCustomAmount || currentLevel)) {
                handleSubmit();
              }
            }}
            style={{
              width: '100%',
              padding: '2rem',
              border: 'none',
              borderRadius: '16px',
              backgroundColor: isSubmitting || (!useCustomAmount && !currentLevel) ? '#cbd5e1' : '#0f766e',
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: '800',
              cursor: isSubmitting || (!useCustomAmount && !currentLevel) ? 'not-allowed' : 'pointer',
              boxShadow: isSubmitting || (!useCustomAmount && !currentLevel) ? 'none' : '0 8px 16px rgba(15, 118, 110, 0.4)',
              WebkitAppearance: 'none',
              appearance: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxSizing: 'border-box',
              touchAction: 'manipulation',
            }}
          >
            {isSubmitting ? 'Adding...' : '✓ Add Bid'}
          </button>

          {/* Undo Button */}
          <button
            type="button"
            onClick={undoLastBid}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #b91c1c',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              color: '#b91c1c',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none',
              boxSizing: 'border-box',
            }}
          >
            Undo Last Bid
          </button>
        </div>
      </div>
    </div>
  );
}
