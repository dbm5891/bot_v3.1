import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useRef, useEffect } from 'react';
import { createChart, IChartApi, LineStyle, Time } from 'lightweight-charts';
import AppLayout from '../layouts/AppLayoutNew';

// EquityCurveChart component
const EquityCurveChart = ({ data }: { data: { date: string; value: number }[] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      if (chartRef.current) chartRef.current.remove();
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 220,
        layout: { background: { color: 'transparent' }, textColor: 'white' },
        grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)', style: LineStyle.Dotted }, horzLines: { color: 'rgba(255, 255, 255, 0.1)', style: LineStyle.Dotted } },
        rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)' },
        timeScale: { borderColor: 'rgba(255, 255, 255, 0.1)', timeVisible: true, secondsVisible: false },
      });
      const lineSeries = chart.addLineSeries({ color: '#1976d2', lineWidth: 2 });
      lineSeries.setData(data.map(d => ({ time: d.date as Time, value: d.value })));
      chart.timeScale().fitContent();
      chartRef.current = chart;
      return () => { chart.remove(); };
    }
  }, [data]);
  return <div ref={chartContainerRef} style={{ width: '100%', maxWidth: '100%', height: 220 }} />;
};

// DrawdownCurveChart component
const DrawdownCurveChart = ({ data }: { data: { date: string; value: number }[] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      if (chartRef.current) chartRef.current.remove();
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 180,
        layout: { background: { color: 'transparent' }, textColor: 'white' },
        grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)', style: LineStyle.Dotted }, horzLines: { color: 'rgba(255, 255, 255, 0.1)', style: LineStyle.Dotted } },
        rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)' },
        timeScale: { borderColor: 'rgba(255, 255, 255, 0.1)', timeVisible: true, secondsVisible: false },
      });
      const lineSeries = chart.addLineSeries({ color: '#f44336', lineWidth: 2 });
      lineSeries.setData(data.map(d => ({ time: d.date as Time, value: d.value })));
      chart.timeScale().fitContent();
      chartRef.current = chart;
      return () => { chart.remove(); };
    }
  }, [data]);
  return <div ref={chartContainerRef} style={{ width: '100%', maxWidth: '100%', height: 180 }} />;
};

// Utility: Convert trades to CSV
function tradesToCSV(trades: any[]): string {
  if (!trades || trades.length === 0) return '';
  const headers = [
    'Index', 'Type', 'Entry', 'Exit', 'Entry Price', 'Exit Price', 'Profit', 'Profit %'
  ];
  const rows = trades.map((trade, idx) => [
    idx + 1,
    trade.direction || trade.type || '',
    trade.entryDate || trade.date || '',
    trade.exitDate || '',
    trade.entryPrice ?? trade.price ?? '',
    trade.exitPrice ?? '',
    trade.profit ?? '',
    (trade.profitPercent ?? trade.profitPct ?? 0).toFixed(2) + '%'
  ]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}

const BacktestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { results, loading, error } = useSelector((state: RootState) => state.backtesting);
  const backtest = results.find((b) => b.id === id);

  if (loading) {
    return <div className="flex justify-center mt-8"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div></div>;
  }
  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>;
  }
  if (!backtest) {
    return <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">Backtest not found.</div>;
  }

  const equityData = Array.isArray((backtest as any).equity)
    ? (backtest as any).equity
    : Array.isArray((backtest as any).equityCurve)
      ? (backtest as any).equityCurve
      : null;

  // Find drawdown data
  const drawdownData = Array.isArray((backtest as any).drawdownCurve)
    ? (backtest as any).drawdownCurve
    : Array.isArray((backtest as any).drawdownSeries)
      ? (backtest as any).drawdownSeries
      : Array.isArray((backtest as any).drawdowns)
        ? (backtest as any).drawdowns
        : null;

  // Find trades array for export
  const tradesArray = Array.isArray(backtest.tradesDetails)
    ? backtest.tradesDetails
    : Array.isArray(backtest.trades)
      ? backtest.trades
      : [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto mt-4 overflow-x-hidden p-4">
        {/* Add a compare button */}
        <div className="flex justify-end mb-2">
          <button
            className="flex items-center justify-center w-full max-w-320 min-h-48 min-w-48 bg-white border border-border text-slate-600 hover:bg-slate-50 focus:ring-4 focus:outline-none focus:ring-primary shadow-dashboard hover:shadow-card-hover transition-shadow duration-200 rounded-lg"
            onClick={() => navigate('/backtesting/compare')}
          >
            <span className="mr-2 h-6 w-6">
              {/* Compare icon */}
            </span>
            Compare with other backtests
          </button>
        </div>

        {/* Performance Summary Cards */}
        <div className="grid grid-cols-12 gap-4 mb-3">
          <div className="col-span-12 sm:col-span-6 md:col-span-2.4">
            <div className="bg-white border border-border/50 rounded p-4 shadow-dashboard hover:shadow-card-hover transition-shadow duration-200">
              <span className={`h-16 mb-4 ${((backtest.totalReturn ?? backtest.roi ?? 0) >= 0) ? 'text-green-500' : 'text-red-500'}`}>
                {/* Trending up icon */}
              </span>
              <span className="text-sm">Total Return</span>
              <span className="text-2xl">{((backtest.totalReturn ?? backtest.roi ?? 0) * 100).toFixed(2)}%</span>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-2.4">
            <div className="bg-white border border-border/50 rounded p-4 shadow-dashboard hover:shadow-card-hover transition-shadow duration-200">
              <span className={`h-16 mb-4 ${'text-red-500'}`}>
                {/* Trending down icon */}
              </span>
              <span className="text-sm">Max Drawdown</span>
              <span className="text-2xl">{(backtest.maxDrawdown ?? backtest.drawdown ?? 0).toFixed(2)}%</span>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-2.4">
            <div className="bg-white border border-border/50 rounded p-4 shadow-dashboard hover:shadow-card-hover transition-shadow duration-200">
              <span className={`h-16 mb-4 ${'text-primary'}`}>
                {/* Show chart icon */}
              </span>
              <span className="text-sm">Sharpe Ratio</span>
              <span className="text-2xl">{(backtest.sharpeRatio ?? 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-2.4">
            <div className="bg-white border border-border/50 rounded p-4 shadow-dashboard hover:shadow-card-hover transition-shadow duration-200">
              <span className={`h-16 mb-4 ${'text-primary'}`}>
                {/* Swap icon */}
              </span>
              <span className="text-sm">Win Rate</span>
              <span className="text-2xl">{(backtest.winRate ?? 0).toFixed(2)}%</span>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-2.4">
            <div className="bg-white border border-border/50 rounded p-4 shadow-dashboard hover:shadow-card-hover transition-shadow duration-200">
              <span className={`h-16 mb-4 ${'text-primary'}`}>
                {/* Assessment icon */}
              </span>
              <span className="text-sm">Trades</span>
              <span className="text-2xl">{backtest.trades ?? backtest.tradesCount ?? 0}</span>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border/50 rounded p-4 shadow-dashboard hover:shadow-card-hover transition-shadow duration-200">
          <h2 className="text-2xl font-bold mb-4">{backtest.strategyName} ({backtest.symbol})</h2>
          <span className="text-sm text-slate-600">{backtest.startDate} - {backtest.endDate} | {backtest.timeframe}</span>
          <p className="mt-2">
            Final Balance: ${backtest.finalBalance?.toLocaleString() ?? 'N/A'}<br />
            Total Return: {(backtest.totalReturn ?? backtest.roi ?? 0) * 100}%<br />
            Max Drawdown: {backtest.maxDrawdown ?? backtest.drawdown ?? 'N/A'}%<br />
            Sharpe Ratio: {backtest.sharpeRatio ?? 'N/A'}<br />
            Win Rate: {backtest.winRate ?? 'N/A'}%<br />
            Trades: {backtest.trades ?? backtest.tradesCount ?? 'N/A'}
          </p>
          {/* Equity Curve Chart or Placeholder */}
          {Array.isArray(equityData) && equityData.length > 0 ? (
            <div className="mt-4 mb-2 p-4 border border-border/50 rounded shadow-dashboard hover:shadow-card-hover transition-shadow duration-200">
              <span className="text-sm text-slate-600 mb-1">Equity Curve</span>
              <EquityCurveChart data={equityData} />
            </div>
          ) : (
            <div className="mt-4 mb-2 p-4 text-center bg-gray-100 rounded">
              <span className="text-sm text-slate-600">
                [Equity Curve Chart Placeholder]
              </span>
            </div>
          )}
          {/* Drawdown Curve Chart or Placeholder */}
          {Array.isArray(drawdownData) && drawdownData.length > 0 ? (
            <div className="mt-2 mb-2 p-4 border border-border/50 rounded shadow-dashboard hover:shadow-card-hover transition-shadow duration-200">
              <span className="text-sm text-slate-600 mb-1">Drawdown Curve</span>
              <DrawdownCurveChart data={drawdownData} />
            </div>
          ) : (
            <div className="mt-2 mb-2 p-4 text-center bg-gray-100 rounded">
              <span className="text-sm text-slate-600">
                [Drawdown Curve Chart Placeholder]
              </span>
            </div>
          )}
          {/* Export Buttons above trades table */}
          {tradesArray.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-center sm:justify-end sm:items-center gap-1 mt-2">
              <button
                className="flex items-center justify-center w-full sm:w-auto min-h-48 min-w-48 bg-white border border-border text-slate-600 hover:bg-slate-50 focus:ring-4 focus:outline-none focus:ring-primary"
                onClick={() => {
                  const csv = tradesToCSV(tradesArray);
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `backtest_trades_${backtest.id}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <span className="mr-2 h-6 w-6">
                  {/* Download icon */}
                </span>
                Export Trades CSV
              </button>
              <button
                className="flex items-center justify-center w-full sm:w-auto min-h-48 min-w-48 bg-white border border-border text-slate-600 hover:bg-slate-50 focus:ring-4 focus:outline-none focus:ring-primary"
                onClick={() => {
                  const json = JSON.stringify(backtest, null, 2);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `backtest_result_${backtest.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <span className="mr-2 h-6 w-6">
                  {/* Download icon */}
                </span>
                Export Full Result (JSON)
              </button>
            </div>
          )}
          {/* Trades Table */}
          {(Array.isArray(backtest.tradesDetails) || Array.isArray(backtest.trades)) && (
            <div className="w-full overflow-x-auto">
              <h2 className="mt-4 mb-2 text-xl font-bold">Trades</h2>
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-sm">#</th>
                      <th className="px-4 py-2 text-sm">Type</th>
                      <th className="px-4 py-2 text-sm">Entry</th>
                      <th className="px-4 py-2 text-sm">Exit</th>
                      <th className="px-4 py-2 text-sm">Entry Price</th>
                      <th className="px-4 py-2 text-sm">Exit Price</th>
                      <th className="px-4 py-2 text-sm">Profit</th>
                      <th className="px-4 py-2 text-sm">Profit %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(backtest.tradesDetails)
                      ? backtest.tradesDetails
                      : Array.isArray(backtest.trades)
                        ? backtest.trades
                        : []
                    ).map((trade: any, idx: number) => (
                      <tr key={trade.id || idx}>
                        <td className="border px-4 py-2">{idx + 1}</td>
                        <td className="border px-4 py-2">{trade.direction || trade.type}</td>
                        <td className="border px-4 py-2">{trade.entryDate || trade.date}</td>
                        <td className="border px-4 py-2">{trade.exitDate || '-'}</td>
                        <td className="border px-4 py-2">{trade.entryPrice ?? trade.price ?? '-'}</td>
                        <td className="border px-4 py-2">{trade.exitPrice ?? '-'}</td>
                        <td className="border px-4 py-2">{trade.profit ?? '-'}</td>
                        <td className="border px-4 py-2">{(trade.profitPercent ?? trade.profitPct ?? 0).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default BacktestDetailPage; 