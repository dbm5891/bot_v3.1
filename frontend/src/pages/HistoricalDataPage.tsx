import React from 'react';
import DataTable from '@/components/data/DataTable';
import DataUploadDialog from '@/components/data/DataUploadDialog';
import DataPreprocessingDialog from '@/components/data/DataPreprocessingDialog';
import { Button } from '@/components/ui/button';
import AppIcon from '@/components/icons/AppIcon';

export default function HistoricalDataPage() {
  const [showUploadDialog, setShowUploadDialog] = React.useState(false);
  const [showPreprocessingDialog, setShowPreprocessingDialog] = React.useState(false);
  const [selectedDataId, setSelectedDataId] = React.useState<string | null>(null);
  const [marketData, setMarketData] = React.useState([]);

  const handleUpload = async (formData: FormData) => {
    try {
      // TODO: Implement file upload
      console.log('Uploading file:', formData);
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handlePreprocess = async (indicators: string[]) => {
    try {
      // TODO: Implement preprocessing
      console.log('Preprocessing with indicators:', indicators);
      setShowPreprocessingDialog(false);
    } catch (error) {
      console.error('Preprocessing failed:', error);
    }
  };

  const handleViewData = (id: string) => {
    console.log('View data:', id);
  };

  const handleEditData = (id: string) => {
    console.log('Edit data:', id);
  };

  const handleDeleteData = (id: string) => {
    console.log('Delete data:', id);
  };

  const handleChartData = (id: string) => {
    console.log('Chart data:', id);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Historical Market Data</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPreprocessingDialog(true)}
          >
            <AppIcon name="Settings2" className="mr-2 h-4 w-4" />
            Preprocess Data
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <AppIcon name="Upload" className="mr-2 h-4 w-4" />
            Upload Data
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <DataTable
          data={marketData}
          onViewData={handleViewData}
          onEditData={handleEditData}
          onDeleteData={handleDeleteData}
          onChartData={handleChartData}
        />
      </div>

      <DataUploadDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUpload={handleUpload}
      />

      <DataPreprocessingDialog
        open={showPreprocessingDialog}
        onClose={() => setShowPreprocessingDialog(false)}
        onPreprocess={handlePreprocess}
        dataId={selectedDataId}
        dataset={undefined}
      />
    </div>
  );
} 