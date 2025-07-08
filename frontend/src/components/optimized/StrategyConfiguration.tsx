import React, { memo } from 'react';
import { Settings, Play } from 'lucide-react';

const StrategyConfiguration = memo(() => {
  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Strategy Configuration</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Strategy Type</label>
              <select className="w-full p-2 border rounded-lg">
                <option>RSI Mean Reversion</option>
                <option>Moving Average Crossover</option>
                <option>Bollinger Band Squeeze</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Symbol</label>
              <input 
                type="text" 
                placeholder="BTCUSD" 
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Timeframe</label>
              <select className="w-full p-2 border rounded-lg">
                <option>1h</option>
                <option>4h</option>
                <option>1d</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Initial Capital</label>
              <input 
                type="number" 
                placeholder="10000" 
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Play className="h-4 w-4" />
            Run Backtest
          </button>
        </div>
      </div>
    </div>
  );
});

export default StrategyConfiguration;