import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { bidApi, settingsApi, uploadApi, exportApi, adminApi } from '../services/api';
import { Bid, NewBid } from '../types/bid';
import { Settings, UpdateSettings } from '../types/settings';

interface AuctionContextValue {
  // State
  currentTotal: number;
  startingTotal: number;
  goalAmount: number | null;
  lastBid: Bid | null;
  recentBids: Bid[];
  settings: Settings | null;
  isConnected: boolean;
  isLoading: boolean;
  lastUpdateTime: number;

  // Actions
  addBid: (paddleNumber: string, amount: number) => Promise<void>;
  undoLastBid: () => Promise<void>;
  updateSettings: (updates: UpdateSettings) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
  removeLogo: () => Promise<void>;
  uploadBackground: (file: File) => Promise<void>;
  removeBackground: () => Promise<void>;
  uploadGoalReachedBackground: (file: File) => Promise<void>;
  removeGoalReachedBackground: () => Promise<void>;
  exportCSV: () => Promise<void>;
  resetAuction: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuctionContext = createContext<AuctionContextValue | undefined>(undefined);

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [currentTotal, setCurrentTotal] = useState(0);
  const [startingTotal, setStartingTotal] = useState(0);
  const [goalAmount, setGoalAmount] = useState<number | null>(null);
  const [lastBid, setLastBid] = useState<Bid | null>(null);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  const { isConnected, on, off } = useWebSocket();

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [settingsData, bidsData, statsData] = await Promise.all([
        settingsApi.get(),
        bidApi.getRecent(10),
        bidApi.getStats(),
      ]);

      setSettings(settingsData);
      setStartingTotal(settingsData.startingTotal);
      setGoalAmount(settingsData.goalAmount);
      setRecentBids(bidsData);
      setCurrentTotal(statsData.currentTotal);
      setLastBid(bidsData.length > 0 ? bidsData[0] : null);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // WebSocket event handlers
  useEffect(() => {
    const handleInitialState = (data: any) => {
      console.log('📡 Received initial state:', data);
      setCurrentTotal(data.currentTotal);
      setSettings(data.settings);
      setStartingTotal(data.settings.startingTotal);
      setGoalAmount(data.settings.goalAmount);
      setLastBid(data.lastBid);
      setRecentBids(data.recentBids);
    };

    const handleBidAdded = (data: { bid: Bid; newTotal: number }) => {
      console.log('🎯 REAL-TIME BID ADDED:', data);
      setCurrentTotal(data.newTotal);
      setLastBid(data.bid);
      setRecentBids((prev) => [data.bid, ...prev.slice(0, 9)]);
      setLastUpdateTime(Date.now());
    };

    const handleBidUndone = (data: { removedBid: Bid; newTotal: number }) => {
      console.log('↩️ REAL-TIME BID UNDONE:', data);
      setCurrentTotal(data.newTotal);
      setRecentBids((prev) => {
        const filtered = prev.filter((b) => b.id !== data.removedBid.id);
        setLastBid(filtered.length > 0 ? filtered[0] : null);
        return filtered;
      });
      setLastUpdateTime(Date.now());
    };

    const handleSettingsUpdated = (data: { settings: Settings }) => {
      console.log('⚙️ REAL-TIME SETTINGS UPDATED:', data);
      setSettings(data.settings);
      setStartingTotal(data.settings.startingTotal);
      setGoalAmount(data.settings.goalAmount);
      setLastUpdateTime(Date.now());
    };

    const handleLogoUpdated = (data: { logoUrl: string | null }) => {
      console.log('🖼️ REAL-TIME LOGO UPDATED:', data);
      setSettings((prev) => (prev ? { ...prev, logoPath: data.logoUrl } : prev));
      setLastUpdateTime(Date.now());
    };

    const handleAdminReset = (data: { timestamp: number }) => {
      console.log('🔄 ADMIN RESET RECEIVED:', data);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    };

    console.log('📡 Setting up WebSocket event listeners...');
    on('state:initial', handleInitialState);
    on('bid:added', handleBidAdded);
    on('bid:undone', handleBidUndone);
    on('settings:updated', handleSettingsUpdated);
    on('logo:updated', handleLogoUpdated);
    on('admin:reset', handleAdminReset);

    return () => {
      console.log('📡 Cleaning up WebSocket event listeners...');
      off('state:initial', handleInitialState);
      off('bid:added', handleBidAdded);
      off('bid:undone', handleBidUndone);
      off('settings:updated', handleSettingsUpdated);
      off('logo:updated', handleLogoUpdated);
      off('admin:reset', handleAdminReset);
    };
  }, [on, off]);

  // Actions
  const addBid = useCallback(async (paddleNumber: string, amount: number) => {
    try {
      await bidApi.create({ paddleNumber, amount });
      // WebSocket will instantly broadcast the update to all connected clients
    } catch (error) {
      console.error('Error adding bid:', error);
      throw error;
    }
  }, []);

  const undoLastBid = useCallback(async () => {
    try {
      const result = await bidApi.undoLast();

      // Apply immediately so the caller sees the subtraction even if the
      // socket event is delayed/missed. WebSocket remains the source of truth.
      setCurrentTotal(result.newTotal);
      setRecentBids((prev) => {
        const filtered = prev.filter((b) => b.id !== result.removedBid?.id);
        setLastBid(filtered.length > 0 ? filtered[0] : null);
        return filtered;
      });
      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error('Error undoing bid:', error);
      throw error;
    }
  }, []);

  const updateSettings = useCallback(async (updates: UpdateSettings) => {
    try {
      const updatedSettings = await settingsApi.update(updates);
      setSettings(updatedSettings);
      // WebSocket will broadcast to other clients
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    try {
      const { logoUrl } = await uploadApi.uploadLogo(file);
      if (settings) {
        setSettings({ ...settings, logoPath: logoUrl });
      }
      // WebSocket will broadcast to other clients
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  }, [settings]);

  const removeLogo = useCallback(async () => {
    try {
      await uploadApi.deleteLogo();
      if (settings) {
        setSettings({ ...settings, logoPath: null });
      }
      // WebSocket will broadcast to other clients
    } catch (error) {
      console.error('Error removing logo:', error);
      throw error;
    }
  }, [settings]);

  const uploadBackground = useCallback(async (file: File) => {
    try {
      const { backgroundUrl } = await uploadApi.uploadBackground(file);
      if (settings) {
        setSettings({ ...settings, customBackgroundPath: backgroundUrl });
      }
    } catch (error) {
      console.error('Error uploading background:', error);
      throw error;
    }
  }, [settings]);

  const removeBackground = useCallback(async () => {
    try {
      await uploadApi.deleteBackground();
      if (settings) {
        setSettings({ ...settings, customBackgroundPath: null });
      }
    } catch (error) {
      console.error('Error removing background:', error);
      throw error;
    }
  }, [settings]);

  const uploadGoalReachedBackground = useCallback(async (file: File) => {
    try {
      const { goalReachedBackgroundUrl } = await uploadApi.uploadGoalReachedBackground(file);
      if (settings) {
        setSettings({ ...settings, goalReachedBackgroundPath: goalReachedBackgroundUrl });
      }
    } catch (error) {
      console.error('Error uploading goal reached background:', error);
      throw error;
    }
  }, [settings]);

  const removeGoalReachedBackground = useCallback(async () => {
    try {
      await uploadApi.deleteGoalReachedBackground();
      if (settings) {
        setSettings({ ...settings, goalReachedBackgroundPath: null });
      }
    } catch (error) {
      console.error('Error removing goal reached background:', error);
      throw error;
    }
  }, [settings]);

  const exportCSV = useCallback(async () => {
    try {
      const blob = await exportApi.downloadCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auction-bids-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }, []);

  const resetAuction = useCallback(async () => {
    try {
      await adminApi.reset();
      await loadInitialData();
      // WebSocket will broadcast to other clients
    } catch (error) {
      console.error('Error resetting auction:', error);
      throw error;
    }
  }, [loadInitialData]);

  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  const value: AuctionContextValue = {
    currentTotal,
    startingTotal,
    goalAmount,
    lastBid,
    recentBids,
    settings,
    isConnected,
    isLoading,
    lastUpdateTime,
    addBid,
    undoLastBid,
    updateSettings,
    uploadLogo,
    removeLogo,
    uploadBackground,
    removeBackground,
    uploadGoalReachedBackground,
    removeGoalReachedBackground,
    exportCSV,
    resetAuction,
    refreshData,
  };

  return <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>;
}

export function useAuction() {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within AuctionProvider');
  }
  return context;
}
