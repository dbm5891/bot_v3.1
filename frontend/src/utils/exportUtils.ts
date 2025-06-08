/**
 * Utility functions for exporting data
 */

/**
 * Converts data to CSV format and triggers download
 * @param data Array of data objects to convert
 * @param fileName Name of the file to download
 * @param headers Optional custom headers for the CSV
 */
export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  fileName: string,
  headers?: string[]
): void => {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }

  // If headers aren't provided, use object keys
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV header row
  const headerRow = csvHeaders.join(',');

  // Create CSV content rows
  const csvRows = data.map(row => {
    return csvHeaders.map(header => {
      const cell = row[header] !== undefined ? row[header] : '';
      // Handle values that might contain commas or quotes
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',');
  });

  // Combine header and content
  const csvContent = [headerRow, ...csvRows].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.display = 'none';
  
  // Add to document, trigger download, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format performance data for export
 * @param performanceData Array of performance data points
 * @param benchmarkData Optional benchmark data for comparison
 * @returns Formatted data ready for CSV export
 */
export const formatPerformanceDataForExport = (
  performanceData: Array<{ date: string; value: number }>,
  benchmarkData?: Array<{ date: string; value: number }>,
): Array<{ Date: string; Portfolio: number; Benchmark?: number }> => {
  // Helper to standardize date format (ensure consistent format for sorting)
  const standardizeDate = (dateStr: string): string => {
    // If date is in MM/DD/YYYY format, convert to YYYY-MM-DD for sorting
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
    }
    return dateStr;
  };
  
  // Helper to format date for display in CSV (using original format)
  const formatDateForCSV = (dateStr: string): string => {
    return dateStr; // Keep original format for CSV display
  };
  
  // Create a map of dates to make merging easier
  const dataMap = new Map<string, { Date: string; Portfolio: number; Benchmark?: number }>();
  
  // Add portfolio data to map
  performanceData.forEach(item => {
    const standardDate = standardizeDate(item.date);
    dataMap.set(standardDate, {
      Date: formatDateForCSV(item.date),
      Portfolio: item.value,
    });
  });
  
  // Add benchmark data if available
  if (benchmarkData) {
    benchmarkData.forEach(item => {
      const standardDate = standardizeDate(item.date);
      const existingEntry = dataMap.get(standardDate);
      if (existingEntry) {
        existingEntry.Benchmark = item.value;
      } else {
        dataMap.set(standardDate, {
          Date: formatDateForCSV(item.date),
          Portfolio: 0, // No portfolio data for this date
          Benchmark: item.value
        });
      }
    });
  }
  
  // Convert map to array and sort by date
  return Array.from(dataMap.values()).sort((a, b) => {
    // Use standardized dates for sorting
    const dateA = standardizeDate(a.Date);
    const dateB = standardizeDate(b.Date);
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });
};

/**
 * Export dashboard data to CSV including metrics
 * @param performanceData Array of performance data points
 * @param benchmarkData Optional benchmark data for comparison
 * @param metrics Performance metrics
 * @param timeRange Selected time range
 * @returns Void - triggers file download
 */
export const exportDashboardData = (
  performanceData: Array<{ date: string; value: number }>,
  benchmarkData?: Array<{ date: string; value: number }>,
  metrics?: {
    totalReturn?: number;
    monthlyReturn?: number;
    sharpeRatio?: number;
    maxDrawdown?: number;
    winRate?: number;
    profitFactor?: number;
  },
  timeRange: string = 'ALL'
): void => {
  // Prepare performance data
  const formattedPerformanceData = formatPerformanceDataForExport(performanceData, benchmarkData);
  
  // Add metrics summary at the beginning
  const metricsSummary: Record<string, string>[] = [];
  
  if (metrics) {
    metricsSummary.push(
      {
        Date: 'SUMMARY',
        Portfolio: '',
        Benchmark: ''
      },
      {
        Date: 'Time Range',
        Portfolio: timeRange,
        Benchmark: ''
      },
      {
        Date: 'Total Return',
        Portfolio: metrics.totalReturn !== undefined ? `${metrics.totalReturn.toFixed(2)}%` : 'N/A',
        Benchmark: ''
      },
      {
        Date: 'Monthly Return',
        Portfolio: metrics.monthlyReturn !== undefined ? `${metrics.monthlyReturn.toFixed(2)}%` : 'N/A',
        Benchmark: ''
      },
      {
        Date: 'Sharpe Ratio',
        Portfolio: metrics.sharpeRatio !== undefined ? metrics.sharpeRatio.toFixed(2) : 'N/A',
        Benchmark: ''
      },
      {
        Date: 'Max Drawdown',
        Portfolio: metrics.maxDrawdown !== undefined ? `${metrics.maxDrawdown.toFixed(2)}%` : 'N/A',
        Benchmark: ''
      },
      {
        Date: 'Win Rate',
        Portfolio: metrics.winRate !== undefined ? `${metrics.winRate.toFixed(2)}%` : 'N/A',
        Benchmark: ''
      },
      {
        Date: 'Profit Factor',
        Portfolio: metrics.profitFactor !== undefined ? metrics.profitFactor.toFixed(2) : 'N/A',
        Benchmark: ''
      },
      {
        Date: '',
        Portfolio: '',
        Benchmark: ''
      },
      {
        Date: 'DATA',
        Portfolio: '',
        Benchmark: ''
      }
    );
  }
  
  // Merge metrics summary with performance data
  const combinedData = [...metricsSummary, ...formattedPerformanceData];
  
  // Generate filename with date and time range
  const fileName = `dashboard-export-${timeRange.toLowerCase()}-${new Date().toISOString().split('T')[0]}`;
  
  // Export to CSV
  exportToCsv(combinedData, fileName);
}; 