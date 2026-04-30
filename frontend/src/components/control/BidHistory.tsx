import { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { ControlTheme } from '../../types/controlTheme';

interface BidHistoryProps {
  theme: ControlTheme;
}

export default function BidHistory({ theme }: BidHistoryProps) {
  const { recentBids, undoLastBid, deleteBid, clearAllBids } = useAuction();
  const [confirmUndo, setConfirmUndo] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleUndo = async () => {
    if (!confirmUndo) {
      setConfirmUndo(true);
      setTimeout(() => setConfirmUndo(false), 3000);
      return;
    }
    setConfirmUndo(false);
    try {
      await undoLastBid();
    } catch {
      // silent — undo errors are uncommon and state stays consistent
    }
  };

  const handleClearAll = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setConfirmClear(false);
    try {
      await clearAllBids();
    } catch {
      // silent
    }
  };

  const handleDeleteBid = async (id: number) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId((prev) => (prev === id ? null : prev)), 3000);
      return;
    }
    setConfirmDeleteId(null);
    try {
      await deleteBid(id);
    } catch {
      // silent
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.cardBg,
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: `0 1px 3px ${theme.colors.shadow}`,
        border: `1px solid ${theme.colors.widgetBorder}`,
        transition: 'background-color 0.2s, box-shadow 0.2s',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
          Recent Bids
        </h2>
        {recentBids.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleClearAll}
              style={{
                padding: '0.4rem 0.75rem',
                border: `1px solid ${confirmClear ? theme.colors.redDark : theme.colors.cardBorder}`,
                borderRadius: '6px',
                backgroundColor: confirmClear ? theme.colors.redLight : theme.colors.cardBg,
                color: confirmClear ? theme.colors.redDark : theme.colors.textSecondary,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!confirmClear) {
                  e.currentTarget.style.borderColor = theme.colors.red;
                  e.currentTarget.style.color = theme.colors.red;
                }
              }}
              onMouseLeave={(e) => {
                if (!confirmClear) {
                  e.currentTarget.style.borderColor = theme.colors.cardBorder;
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }
              }}
            >
              {confirmClear ? 'Confirm Clear?' : 'Clear All'}
            </button>
            <button
              onClick={handleUndo}
              style={{
                padding: '0.4rem 0.75rem',
                border: `1px solid ${confirmUndo ? theme.colors.redDark : theme.colors.red}`,
                borderRadius: '6px',
                backgroundColor: confirmUndo ? theme.colors.redLight : theme.colors.cardBg,
                color: confirmUndo ? theme.colors.redDark : theme.colors.red,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                letterSpacing: '0.025em',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!confirmUndo) {
                  e.currentTarget.style.backgroundColor = theme.colors.redLight;
                  e.currentTarget.style.color = theme.colors.redDark;
                  e.currentTarget.style.borderColor = theme.colors.redDark;
                }
              }}
              onMouseLeave={(e) => {
                if (!confirmUndo) {
                  e.currentTarget.style.backgroundColor = theme.colors.cardBg;
                  e.currentTarget.style.color = theme.colors.red;
                  e.currentTarget.style.borderColor = theme.colors.red;
                }
              }}
            >
              {confirmUndo ? 'Confirm Undo?' : 'Undo Last'}
            </button>
          </div>
        )}
      </div>

      {recentBids.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: theme.colors.textSecondary, fontSize: '0.875rem', transition: 'color 0.2s' }}>
            No bids yet. Add your first bid!
          </p>
        </div>
      ) : (
        <div className="scrollbar-hidden" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: theme.colors.cardBg, transition: 'background-color 0.2s' }}>
              <tr style={{ borderBottom: `2px solid ${theme.colors.cardBorder}`, textAlign: 'left' }}>
                <th style={{ padding: '0.625rem 0.75rem', fontWeight: '700', fontSize: '0.7rem', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.07em', transition: 'color 0.2s' }}>
                  Paddle
                </th>
                <th style={{ padding: '0.625rem 0.75rem', fontWeight: '700', fontSize: '0.7rem', color: theme.colors.textSecondary, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.07em', transition: 'color 0.2s' }}>
                  Amount
                </th>
                <th style={{ padding: '0.625rem 0.75rem', fontWeight: '700', fontSize: '0.7rem', color: theme.colors.textSecondary, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.07em', transition: 'color 0.2s' }}>
                  ID
                </th>
                <th style={{ padding: '0.625rem 0.5rem', width: '4rem' }} />
              </tr>
            </thead>
            <tbody>
              {recentBids.map((bid, index) => (
                <tr
                  key={bid.id}
                  style={{
                    borderBottom: `1px solid ${theme.colors.cardBorder}`,
                    background: index === 0
                      ? `linear-gradient(to right, ${theme.colors.greenLighter}, transparent)`
                      : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (index !== 0) e.currentTarget.style.backgroundColor = theme.colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    if (index !== 0) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem', fontWeight: index === 0 ? '600' : '400', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
                    {bid.paddleNumber}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: index === 0 ? '600' : '400', color: theme.colors.textPrimary, transition: 'color 0.2s' }}>
                    {formatCurrency(bid.amount)}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', transition: 'color 0.2s' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      fontWeight: '600',
                      color: theme.colors.textMuted,
                      backgroundColor: theme.colors.cardBorder,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                    }}>
                      #{bid.id}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteBid(bid.id)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        border: `1px solid ${confirmDeleteId === bid.id ? theme.colors.redDark : theme.colors.cardBorder}`,
                        borderRadius: '4px',
                        backgroundColor: confirmDeleteId === bid.id ? theme.colors.redLight : 'transparent',
                        color: confirmDeleteId === bid.id ? theme.colors.redDark : theme.colors.textMuted,
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        if (confirmDeleteId !== bid.id) {
                          e.currentTarget.style.borderColor = theme.colors.red;
                          e.currentTarget.style.color = theme.colors.red;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (confirmDeleteId !== bid.id) {
                          e.currentTarget.style.borderColor = theme.colors.cardBorder;
                          e.currentTarget.style.color = theme.colors.textMuted;
                        }
                      }}
                    >
                      {confirmDeleteId === bid.id ? 'Confirm?' : 'Delete'}
                    </button>
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
