import React, { useState } from 'react';
import AppIcon from '../icons/AppIcon';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import { Alert } from '../ui/alert';

interface DataUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => void;
}

const DataUploadDialog: React.FC<DataUploadDialogProps> = ({ open, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [source, setSource] = useState('csv');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string[]>([]);

  const timeframeOptions = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      
      // Try to extract symbol from filename (optional)
      const fileName = selectedFile.name.toLowerCase();
      const symbolMatch = fileName.match(/^([a-z]+)_/);
      if (symbolMatch && !symbol) {
        setSymbol(symbolMatch[1].toUpperCase());
      }
      
      // Try to extract timeframe from filename (optional)
      const timeframeMatch = fileName.match(/_(1m|5m|15m|30m|1h|4h|1d|1w)_/);
      if (timeframeMatch && !timeframe) {
        setTimeframe(timeframeMatch[1]);
      }
      
      // Preview file contents
      previewFile(selectedFile);
    }
  };
  
  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        // Get first few lines of the file
        const lines = e.target.result.split('\n').slice(0, 5);
        setFilePreview(lines);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!file || !symbol || !timeframe) {
      setError('Please fill in all required fields');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('symbol', symbol);
      formData.append('timeframe', timeframe);
      formData.append('source', source);
      
      await onUpload(formData);
      handleReset();
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setSymbol('');
    setTimeframe('');
    setSource('csv');
    setError(null);
    setFilePreview([]);
  };
  
  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogTitle>
        Import Market Data
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert variant="destructive" className="mb-2">
            {error}
          </Alert>
        )}
        
        <div className="mb-2">
          <h3 className="text-sm font-semibold leading-6 text-gray-900">
            Upload a CSV file with market data
          </h3>
          <p className="text-xs leading-5 text-gray-500">
            The CSV file should contain columns for date, open, high, low, close, and volume.
            Date format should be in YYYY-MM-DD format or YYYY-MM-DD HH:MM:SS for intraday data.
          </p>
        </div>
        
        <div className="mb-3">
          <button
            className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <AppIcon name="UploadCloud" />
            Select File
            <input
              type="file"
              id="file-upload"
              name="file"
              hidden
              accept=".csv"
              onChange={handleFileChange}
            />
          </button>
          
          {file && (
            <p className="text-xs leading-5 text-gray-500">
              Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        
        {filePreview.length > 0 && (
          <div className="mb-3 max-h-[200px] overflow-auto rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold leading-6 text-gray-900">File Preview:</h4>
            {filePreview.map((line, i) => (
              <div key={i} className="whitespace-pre font-mono text-sm">
                {line}
              </div>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-4">
            <label htmlFor="symbol" className="block text-sm font-medium leading-6 text-gray-900">
              Symbol
            </label>
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
              placeholder="E.g. AAPL, MSFT, SPY"
            />
          </div>
          
          <div className="col-span-12 sm:col-span-4">
            <label htmlFor="timeframe" className="block text-sm font-medium leading-6 text-gray-900">
              Timeframe
            </label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as string)}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            >
              {timeframeOptions.map((tf) => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-12 sm:col-span-4">
            <label htmlFor="source" className="block text-sm font-medium leading-6 text-gray-900">
              Source
            </label>
            <select
              id="source"
              name="source"
              value={source}
              onChange={(e) => setSource(e.target.value as string)}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="csv">CSV Import</option>
              <option value="yahoo">Yahoo Finance</option>
              <option value="tdameritrade">TD Ameritrade</option>
            </select>
          </div>
        </div>
        
        {uploading && (
          <div className="w-full mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-indigo-600" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}
      </DialogContent>
      <DialogFooter>
        <button
          onClick={handleClose}
          disabled={uploading}
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit} 
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          disabled={!file || !symbol || !timeframe || uploading}
        >
          {uploading ? 'Uploading...' : 'Import Data'}
        </button>
      </DialogFooter>
    </Dialog>
  );
};

export default DataUploadDialog;