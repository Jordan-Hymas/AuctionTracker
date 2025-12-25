interface GoalDisplayProps {
  goalAmount: number;
  color?: string;
  labelColor?: string;
}

export default function GoalDisplay({ goalAmount, color = '#10b981', labelColor }: GoalDisplayProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div
        style={{
          fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
          fontWeight: '600',
          color: labelColor || '#9ca3af',
          marginBottom: '0.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Goal
      </div>
      <div
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
          fontWeight: '700',
          color: color,
          textShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
        }}
      >
        {formatCurrency(goalAmount)}
      </div>
    </div>
  );
}
