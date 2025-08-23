import { create } from 'zustand';

interface Activity {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: string;
}

interface Log {
  id: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  timestamp: string;
}

interface DashboardState {
  activities: Activity[];
  logs: Log[];
  addActivity: (message: string, type?: Activity['type']) => void;
  addLog: (level: Log['level'], message: string) => void;
  clearActivities: () => void;
  clearLogs: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activities: [],
  logs: [],

  addActivity: (message, type = 'info') => {
    const activity: Activity = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    set(state => ({
      activities: [activity, ...state.activities].slice(0, 100), // Keep only last 100
    }));
  },

  addLog: (level, message) => {
    const log: Log = {
      id: Date.now().toString(),
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    set(state => ({
      logs: [log, ...state.logs].slice(0, 100), // Keep only last 100
    }));
  },

  clearActivities: () => set({ activities: [] }),
  clearLogs: () => set({ logs: [] }),
}));