import { useAuction } from '../../context/AuctionContext';
import { ControlTheme } from '../../types/controlTheme';

interface BidHistoryProps {
  theme: ControlTheme;
}

export default function BidHistory({ theme }: BidHistoryProps) {
  const { recentBids, undoLastBid } = useAuction();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleUndo = async () => {
    if (window.confirm('Are you sure you want to undo the last bid?')) {
      try {
        await undoLastBid();
      } catch (error) {
        alert('Failed to undo bid');
      }
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
          Recent Bids
        </h2>
        {recentBids.length > 0 && (
          <button
            onClick={handleUndo}
            style={{
              padding: '0.5rem 0.875rem',
              border: `1px solid ${theme.colors.red}`,
              borderRadius: '6px',
              backgroundColor: theme.colors.cardBg,
              color: theme.colors.red,
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              letterSpacing: '0.025em',
              boxShadow: `0 1px 2px ${theme.colors.shadow}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.redLight;
              e.currentTarget.style.color = theme.colors.redDark;
              e.currentTarget.style.borderColor = theme.colors.redDark;
              e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadowMd}`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.cardBg;
              e.currentTarget.style.color = theme.colors.red;
              e.currentTarget.style.borderColor = theme.colors.red;
              e.currentTarget.style.boxShadow = `0 1px 2px ${theme.colors.shadow}`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Undo Last
          </button>
        )}
      </div>

      {recentBids.length === 0 ? (
        <p style={{ color: theme.colors.textSecondary, fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0', transition: 'color 0.2s' }}>
          No bids yet. Add your first bid!
        </p>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: theme.colors.cardBg, transition: 'background-color 0.2s' }}>
              <tr style={{ borderBottom: `2px solid ${theme.colors.cardBorder}`, textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', fontWeight: '600', fontSize: '0.875rem', color: theme.colors.textSecondary, transition: 'color 0.2s' }}>
                  Paddle
                </th>
                <th style={{ padding: '0.75rem', fontWeight: '600', fontSize: '0.875rem', color: theme.colors.textSecondary, textAlign: 'right', transition: 'color 0.2s' }}>
                  Amount
                </th>
                <th style={{ padding: '0.75rem', fontWeight: '600', fontSize: '0.875rem', color: theme.colors.textSecondary, textAlign: 'right', transition: 'color 0.2s' }}>
                  #
                </th>
              </tr>
            </thead>
            <tbody>
              {recentBids.map((bid, index) => (
                <tr
                  key={bid.id}
                  style={{
                    borderBottom: `1px solid ${theme.colors.cardBorder}`,
                    backgroundColor: index === 0 ? theme.colors.greenLighter : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: index === 0 ? '600' : '400', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
                    {bid.paddleNumber}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: index === 0 ? '600' : '400', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
                    {formatCurrency(bid.amount)}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', color: theme.colors.textSecondary, fontVariantNumeric: 'tabular-nums', transition: 'color 0.2s' }}>
                    #{bid.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
