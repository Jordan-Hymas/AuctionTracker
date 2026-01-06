import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface TotalDisplayProps {
  total: number;
  label?: string;
  color?: string;
  labelColor?: string;
  themeName?: string;
}

export default function TotalDisplay({ total, label = 'Total Raised', color = '#2563eb', labelColor, themeName }: TotalDisplayProps) {
  const { value } = useAnimatedValue(total, 1500);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <div
        style={{
          fontSize: 'clamp(1.5rem, 3vmin, 3rem)',
          fontWeight: '600',
          color: labelColor || '#6b7280',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 'clamp(4rem, 12vmin, 14rem)',
          fontWeight: '900',
          color: color,
          lineHeight: '1',
          textShadow: themeName === 'boysGirlsClub'
            ? '0 0 30px rgba(37, 150, 190, 0.25), 0 0 60px rgba(37, 150, 190, 0.15), 0 4px 20px rgba(0, 0, 0, 0.2)'
            : '0 4px 20px rgba(37, 99, 235, 0.12)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {formatCurrency(value)}
      </div>
    </div>
  );
}
