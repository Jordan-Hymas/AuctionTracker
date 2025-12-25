import { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';

export default function ExportButton() {
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
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: isExporting ? '#9ca3af' : '#8b5cf6',
        color: 'white',
        cursor: isExporting ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
      }}
    >
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
