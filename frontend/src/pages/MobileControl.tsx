import { useState, useRef, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';

export default function MobileControl() {
  const { addBid, settings, currentTotal, undoLastBid, updateSettings } = useAuction();
  const [paddleNumber, setPaddleNumber] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmUndo, setConfirmUndo] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

    // Validate paddle number is 1-4 digits only
    if (!/^\d{1,4}$/.test(paddleNumber.trim())) {
      setError('Paddle must be 1-4 digits');
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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        {/* Status Messages — fixed height slot, opacity toggle avoids layout shift */}
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: error ? '#fee2e2' : '#ccfbf1',
            color: error ? '#991b1b' : '#115e59',
            borderRadius: '10px',
            marginBottom: '1rem',
            fontSize: '0.9375rem',
            fontWeight: '600',
            textAlign: 'center',
            border: success ? '2px solid #0f766e' : 'none',
            opacity: error || success ? 1 : 0,
            transition: 'opacity 0.15s',
            pointerEvents: 'none',
            minHeight: '2.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {error || (success ? '✓ Bid Added!' : '')}
        </div>

        {/* Active Level Selector */}
        {!useCustomAmount && settings?.donationLevels && settings.donationLevels.length > 0 && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: '700',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Active Level
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {settings.donationLevels.map((level) => {
                const isActive = currentLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); updateSettings({ currentDonationLevel: level }); }}
                    style={{
                      padding: '0.875rem 0.5rem',
                      backgroundColor: isActive ? '#0f766e' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#374151',
                      border: isActive ? '2px solid #0d6356' : '2px solid #d1d5db',
                      borderRadius: '10px',
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 4px 8px rgba(15, 118, 110, 0.3)' : 'none',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      touchAction: 'manipulation',
                    }}
                  >
                    {formatCurrency(level)}
                  </button>
                );
              })}
            </div>
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
            <textarea
              ref={inputRef}
              rows={1}
              inputMode="numeric"
              maxLength={4}
              value={paddleNumber}
              onChange={(e) => {
                // Only allow digits, max 4
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                setPaddleNumber(value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="0000"
              autoComplete="off"
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
                resize: 'none',
                overflow: 'hidden',
                lineHeight: '1.2',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Large Submit Button - Optimized for thumb tapping */}
          <button
            type="button"
            disabled={isSubmitting || (!useCustomAmount && !currentLevel)}
            onPointerDown={(e) => {
              e.preventDefault(); // prevents focus loss → keyboard stays open
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
          {confirmUndo ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); undoLastBid(); setConfirmUndo(false); }}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  boxSizing: 'border-box',
                  touchAction: 'manipulation',
                }}
              >
                Yes, Undo
              </button>
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); setConfirmUndo(false); }}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  boxSizing: 'border-box',
                  touchAction: 'manipulation',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); setConfirmUndo(true); }}
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
                touchAction: 'manipulation',
              }}
            >
              Undo Last Bid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
