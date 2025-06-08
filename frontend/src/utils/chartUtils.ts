export interface PerformanceDataPoint {
  date: string;
  value: number;
}

export const timeRanges = [
  { label: '1M', days: 30, description: 'Last 30 Days' },
  { label: '3M', days: 90, description: 'Last 90 Days' },
  { label: '6M', days: 180, description: 'Last 180 Days' },
  { label: 'YTD', days: 0, description: 'Year to Date' }, // Special case for Year-to-Date
  { label: '1Y', days: 365, description: 'Last 365 Days' },
  { label: 'ALL', days: 0, description: 'All Available Data' } // Special case for all data
];

export const getFilteredData = (sourceData: PerformanceDataPoint[], range: string): PerformanceDataPoint[] => {
  if (!sourceData || sourceData.length === 0) return [];

  if (range === 'ALL') return sourceData;

  const now = new Date();
  let cutoffDate: Date;

  if (range === 'YTD') {
    cutoffDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
  } else {
    const days = timeRanges.find(r => r.label === range)?.days || 0;
    cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - days);
  }

  return sourceData.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= cutoffDate;
  });
};

// Helper function to convert date format from MM/DD/YYYY to YYYY-MM-DD
export const formatDateForChart = (dateString: string): number | undefined => {
  let dateObj: Date;

  // Attempt to parse various formats
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/.test(dateString)) { // YYYY-MM-DD or ISO
    dateObj = new Date(dateString);
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) { // MM/DD/YYYY
    const parts = dateString.split('/');
    // Note: Date constructor month is 0-indexed
    dateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
  } else {
    // console.warn(`Date format not recognized: ${dateString}. Could not parse.`);
    return undefined; // Return undefined for unparsable formats
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    // console.warn(`Invalid date created from string: ${dateString}`);
    return undefined; // Return undefined for invalid dates
  }

  // Return UNIX timestamp (seconds)
  return Math.floor(dateObj.getTime() / 1000);
}; 