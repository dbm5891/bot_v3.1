import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { Box, CircularProgress } from '@mui/material';

// Lazy load all pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BacktestingPage = lazy(() => import('./pages/BacktestingPage'));
const StrategiesPage = lazy(() => import('./pages/StrategiesPage'));
const StrategyDetailPage = lazy(() => import('./pages/StrategyDetailPage'));
const DataManagementPage = lazy(() => import('./pages/DataManagementPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const MarketDataPage = lazy(() => import('./pages/MarketDataPage'));
const BacktestDetailPage = lazy(() => import('./pages/BacktestDetailPage'));
const BacktestComparisonPage = lazy(() => import('./pages/BacktestComparisonPage'));

import AppLayoutNew from './layouts/AppLayoutNew';
import NotificationsManager from './components/NotificationsManager';
import { fetchStrategies } from './store/slices/strategySlice';
import { fetchAvailableData, fetchAvailableSymbols } from './store/slices/dataSlice';
import { fetchBacktestHistory } from './store/slices/backtestingSlice';

// Loading fallback component
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

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
      <AppLayoutNew>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/backtesting" element={<BacktestingPage />} />
            <Route path="/backtesting/compare" element={<BacktestComparisonPage />} />
            <Route path="/backtesting/:id" element={<BacktestDetailPage />} />
            <Route path="/strategies" element={<StrategiesPage />} />
            <Route path="/strategies/:id" element={<StrategyDetailPage />} />
            <Route path="/data" element={<DataManagementPage />} />
            <Route path="/market-data" element={<MarketDataPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AppLayoutNew>
      <NotificationsManager />
    </Box>
  );
}

export default App;