import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert } from '../components/ui/alert';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import MarketStatusCard from '../components/dashboard/MarketStatusCard';

const RealTimeMarketDataPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Real-Time Market Data</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Market Status Card */}
        <div className="col-span-1">
          <MarketStatusCard className="h-full" />
        </div>

        {/* Additional real-time data components can be added here */}
      </div>
    </div>
  );
};

export default RealTimeMarketDataPage; 