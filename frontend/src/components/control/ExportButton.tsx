import { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { ControlTheme } from '../../types/controlTheme';

interface ExportButtonProps {
  theme: ControlTheme;
}

export default function ExportButton({ theme }: ExportButtonProps) {
  const { exportCSV } = useAuction();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportCSV();
    } catch (error) {
      alert('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      style={{
        padding: '0.625rem 1.25rem',
        border: `1px solid ${isExporting ? theme.colors.cardBorder : theme.colors.purple}`,
        borderRadius: '6px',
        backgroundColor: isExporting ? theme.colors.cardBorder : theme.colors.cardBg,
        color: isExporting ? theme.colors.textMuted : theme.colors.purple,
        cursor: isExporting ? 'not-allowed' : 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
        boxShadow: isExporting ? 'none' : `0 1px 2px ${theme.colors.shadow}`,
        transition: 'all 0.2s ease',
        letterSpacing: '0.025em',
      }}
      onMouseEnter={(e) => {
        if (!isExporting) {
          e.currentTarget.style.backgroundColor = theme.colors.purpleLight;
          e.currentTarget.style.color = theme.colors.purpleDark;
          e.currentTarget.style.borderColor = theme.colors.purpleDark;
          e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadowMd}`;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isExporting) {
          e.currentTarget.style.backgroundColor = theme.colors.cardBg;
          e.currentTarget.style.color = theme.colors.purple;
          e.currentTarget.style.borderColor = theme.colors.purple;
          e.currentTarget.style.boxShadow = `0 1px 2px ${theme.colors.shadow}`;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
