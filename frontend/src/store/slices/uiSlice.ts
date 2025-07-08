import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  darkMode: boolean;
  currentView: string;
  loading: boolean;
  notifications: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }[];
  sidebarOpen: boolean;
}

const initialState: UiState = {
  darkMode: true,
  currentView: 'dashboard',
  loading: false,
  notifications: [],
  sidebarOpen: true,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setCurrentView: (state, action: PayloadAction<string>) => {
      state.currentView = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addNotification: (state, action: PayloadAction<{ type: 'success' | 'error' | 'info' | 'warning'; message: string }>) => {
      const id = Date.now().toString();
      state.notifications.push({ id, ...action.payload });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((notification) => notification.id !== action.payload);
    },
  },
});

export const { 
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  setCurrentView, 
  setLoading,
  addNotification,
  removeNotification
} = uiSlice.actions;

export default uiSlice.reducer;