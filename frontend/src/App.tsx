import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { Box } from '@mui/material';

import DashboardPage from './pages/DashboardPage';
import BacktestingPage from './pages/BacktestingPage';
import StrategiesPage from './pages/StrategiesPage';
import StrategyDetailPage from './pages/StrategyDetailPage';
import DataManagementPage from './pages/DataManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import MarketDataPage from './pages/MarketDataPage';

import AppLayout from './layouts/AppLayout';
import NotificationsManager from './components/NotificationsManager';
import { fetchStrategies } from './store/slices/strategySlice';
import { fetchAvailableData, fetchAvailableSymbols } from './store/slices/dataSlice';
import { fetchBacktestHistory } from './store/slices/backtestingSlice';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Load initial data when the app starts
    dispatch(fetchStrategies());
    dispatch(fetchAvailableData());
    dispatch(fetchAvailableSymbols());
    dispatch(fetchBacktestHistory());
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/backtesting" element={<BacktestingPage />} />
          <Route path="/strategies" element={<StrategiesPage />} />
          <Route path="/strategies/:id" element={<StrategyDetailPage />} />
          <Route path="/data" element={<DataManagementPage />} />
          <Route path="/market-data" element={<MarketDataPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
      <NotificationsManager />
    </Box>
  );
}

export default App;