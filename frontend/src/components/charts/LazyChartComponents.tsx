import { lazy, Suspense } from 'react';

// Lazy load heavy chart components
const LazyLine = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));
const LazyBar = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Bar })));
const LazyPie = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Pie })));

// Loading fallback for charts
const ChartSkeleton = () => (
  <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
    <div className="text-gray-400 text-sm">Loading chart...</div>
  </div>
);

// Wrapped components with Suspense
export const LineChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyLine {...props} />
  </Suspense>
);

export const BarChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyBar {...props} />
  </Suspense>
);

export const PieChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyPie {...props} />
  </Suspense>
);

// Re-export chart registration for use in components that need it
export const registerChartComponents = async () => {
  const chartModule = await import('chart.js');
  const {
    Chart: ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale,
    TimeSeriesScale,
  } = chartModule;

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale,
    TimeSeriesScale
  );
};