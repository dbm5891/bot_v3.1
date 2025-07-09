import React, { memo } from 'react';
import { CheckCircle, XCircle, Activity } from 'lucide-react';

const BacktestResults = memo(() => {
  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-border/50">
        <h3 className="text-lg font-semibold mb-4">Backtest Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Total Return</span>
            </div>
            <div className="text-2xl font-bold text-green-600">+24.5%</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Sharpe Ratio</span>
            </div>
            <div className="text-2xl font-bold">1.42</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium">Max Drawdown</span>
            </div>
            <div className="text-2xl font-bold text-red-600">-8.3%</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BacktestResults;