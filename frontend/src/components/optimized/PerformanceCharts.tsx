import React, { memo, Suspense } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

// Lazy load charts
const LineChart = React.lazy(() => import('../charts/LazyChartComponents').then(module => ({ default: module.LineChart })));

const PerformanceCharts = memo(() => {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [10000, 10500, 10200, 11000, 10800, 12000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Portfolio Performance Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Performance Charts</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Performance Chart */}
          <div className="h-64">
            <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse rounded"></div>}>
              <LineChart data={chartData} options={options} />
            </Suspense>
          </div>
          
          {/* Performance Metrics */}
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Win Rate</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-bold text-green-600">67.2%</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Profit Factor</span>
                <span className="font-bold">1.85</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Trades</span>
                <span className="font-bold">156</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Avg Win</span>
                <span className="font-bold text-green-600">$2.10</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Avg Loss</span>
                <span className="font-bold text-red-600">-$1.30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PerformanceCharts;