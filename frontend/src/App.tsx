import { useEffect, lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import { store } from './store';
import { createBrowserRouter } from 'react-router-dom';
import AppLayoutNew from './layouts/AppLayoutNew';
import NotificationsManager from './components/NotificationsManager';
import { fetchStrategies } from './store/slices/strategySlice';
import { fetchAvailableData, fetchAvailableSymbols } from './store/slices/dataSlice';
import { fetchBacktestHistory } from './store/slices/backtestingSlice';
import { TwentyFirstToolbar } from '@21st-extension/toolbar-react';
import { ReactPlugin } from '@21st-extension/react';
// Lazy load all pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BacktestingPage = lazy(() => import('./pages/BacktestingPage'));
const StrategiesPage = lazy(() => import('./pages/StrategiesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DataManagementPage = lazy(() => import('./pages/DataManagementPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const BacktestDetailPage = lazy(() => import('./pages/BacktestDetailPage'));
const BacktestComparisonPage = lazy(() => import('./pages/BacktestComparisonPage'));
const StrategyDetailPage = lazy(() => import('./pages/StrategyDetailPage'));
const MarketDataPage = lazy(() => import('./pages/MarketDataPage'));
const HistoricalDataPage = lazy(() => import('./pages/HistoricalDataPage'));
const RealTimeMarketDataPage = lazy(() => import('./pages/RealTimeMarketDataPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
import { useThemeTransition } from './hooks/useThemeTransition';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load all pages

// Loading fallback component
const PageLoader = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-background">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-primary"></div>
      <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-primary animate-pulse"></div>
    </div>
    <div className="mt-4 text-sm text-muted-foreground animate-pulse">Loading...</div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayoutNew><Outlet /></AppLayoutNew>,
    errorElement: <AppLayoutNew><Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense></AppLayoutNew>,
    children: [
      {
        path: 'dashboard',
        element: <Navigate to="/" replace />,
      },
      {
        path: 'backtest/compare',
        element: <Suspense fallback={<PageLoader />}><BacktestComparisonPage /></Suspense>
      },
      {
        path: 'backtest/:id',
        element: <Suspense fallback={<PageLoader />}><BacktestDetailPage /></Suspense>
      },
      {
        path: 'strategy/:id',
        element: <Suspense fallback={<PageLoader />}><StrategyDetailPage /></Suspense>
      },
      {
        path: 'backtesting',
        element: <Suspense fallback={<PageLoader />}><BacktestingPage /></Suspense>
      },
      {
        path: 'strategies',
        element: <Suspense fallback={<PageLoader />}><StrategiesPage /></Suspense>
      },
      {
        path: 'settings',
        element: <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>
      },
      {
        path: 'data',
        element: <Suspense fallback={<PageLoader />}><DataManagementPage /></Suspense>
      },
      {
        path: 'analytics',
        element: <Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>
      },
      {
        path: 'market-data',
        element: <Suspense fallback={<PageLoader />}><MarketDataPage /></Suspense>
      },
      {
        path: 'market-data/historical',
        element: <Suspense fallback={<PageLoader />}><HistoricalDataPage /></Suspense>
      },
      {
        path: 'market-data/real-time',
        element: <Suspense fallback={<PageLoader />}><RealTimeMarketDataPage /></Suspense>
      },



      {
        index: true,
        element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
      },
      {
        path: '*',
        element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>
      }
    ]
  }
]);

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  useThemeTransition();

  useEffect(() => {
    // Load initial data when the app starts
    dispatch(fetchStrategies());
    dispatch(fetchAvailableData());
    dispatch(fetchAvailableSymbols());
    dispatch(fetchBacktestHistory());
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <ErrorBoundary>
          <NotificationsManager />
          <AppContent />
          <TwentyFirstToolbar 
            config={{
              plugins: [ReactPlugin],
            }}
          />
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}

export default App;