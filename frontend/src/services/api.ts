import axios from 'axios';
import { Bid, NewBid, BidStats } from '../types/bid';
import { Settings, UpdateSettings } from '../types/settings';

export interface NetworkInfo {
  lanIp: string | null;
  ipAddresses: string[];
  port: number;
  controlUrlLan: string | null;
  controlUrlLocal: string;
  warning: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== BID API ====================

export const bidApi = {
  getAll: async (): Promise<Bid[]> => {
    const response = await api.get('/bids');
    return response.data.bids;
  },

  getRecent: async (limit: number = 10): Promise<Bid[]> => {
    const response = await api.get(`/bids/recent?limit=${limit}`);
    return response.data.bids;
  },

  getStats: async (): Promise<BidStats> => {
    const response = await api.get('/bids/total');
    return response.data;
  },

  create: async (newBid: NewBid): Promise<{ bid: Bid; currentTotal: number; totalBids: number }> => {
    const response = await api.post('/bids', newBid);
    return response.data;
  },

  undoLast: async (): Promise<{ removedBid: Bid | null; newTotal: number; totalBids: number }> => {
    const response = await api.delete('/bids/last');
    return response.data;
  },

  deleteById: async (id: number): Promise<{ removedBid: Bid; newTotal: number; totalBids: number }> => {
    const response = await api.delete(`/bids/${id}`);
    return response.data;
  },

  clearAll: async (): Promise<{ newTotal: number }> => {
    const response = await api.delete('/bids/all', { data: { confirm: true } });
    return response.data;
  },
};

// ==================== SETTINGS API ====================

export const settingsApi = {
  get: async (): Promise<Settings> => {
    const response = await api.get('/settings');
    return response.data.settings;
  },

  update: async (updates: UpdateSettings): Promise<Settings> => {
    const response = await api.put('/settings', updates);
    return response.data.settings;
  },
};

// ==================== UPLOAD API ====================

export const uploadApi = {
  uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await api.post('/upload/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteLogo: async (): Promise<void> => {
    await api.delete('/upload/logo');
  },

  uploadBackground: async (file: File): Promise<{ backgroundUrl: string }> => {
    const formData = new FormData();
    formData.append('background', file);

    const response = await api.post('/upload/background', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteBackground: async (): Promise<void> => {
    await api.delete('/upload/background');
  },

  uploadGoalReachedBackground: async (file: File): Promise<{ goalReachedBackgroundUrl: string }> => {
    const formData = new FormData();
    formData.append('background', file);

    const response = await api.post('/upload/goal-reached-background', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteGoalReachedBackground: async (): Promise<void> => {
    await api.delete('/upload/goal-reached-background');
  },
};

// ==================== EXPORT API ====================

export const exportApi = {
  downloadCSV: async (): Promise<Blob> => {
    const response = await api.get('/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ==================== ADMIN API ====================

export const adminApi = {
  reset: async (): Promise<void> => {
    await api.post('/admin/reset', { confirm: true });
  },

  health: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },

  getServerInfo: async (): Promise<NetworkInfo> => {
    const response = await api.get('/server-info');
    return response.data;
  },

  getNetworkInfo: async (): Promise<NetworkInfo> => {
    const response = await api.get('/network-info');
    return response.data;
  },
};

export default api;
