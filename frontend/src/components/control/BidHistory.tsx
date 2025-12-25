import { useAuction } from '../../context/AuctionContext';

export default function BidHistory() {
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
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Bids</h2>
        {recentBids.length > 0 && (
          <button
            onClick={handleUndo}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #dc2626',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Undo Last
          </button>
        )}
      </div>

      {recentBids.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
          No bids yet. Add your first bid!
        </p>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', fontWeight: '600', fontSize: '0.875rem', color: '#6b7280' }}>
                  Paddle
                </th>
                <th style={{ padding: '0.75rem', fontWeight: '600', fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>
                  Amount
                </th>
                <th style={{ padding: '0.75rem', fontWeight: '600', fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {recentBids.map((bid, index) => (
                <tr
                  key={bid.id}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: index === 0 ? '#f0fdf4' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: index === 0 ? '600' : '400' }}>
                    {bid.paddleNumber}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: index === 0 ? '600' : '400' }}>
                    {formatCurrency(bid.amount)}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', color: '#6b7280' }}>
                    {new Date(bid.timestamp).toLocaleTimeString()}
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
