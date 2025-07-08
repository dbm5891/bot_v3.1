import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchAvailableData, fetchAvailableSymbols, importMarketData, preprocessData } from '../store/slices/dataSlice';
import { addNotification } from '../store/slices/uiSlice';
import DataPreprocessingDialog from '../components/data/DataPreprocessingDialog';
import DataUploadDialog from '../components/data/DataUploadDialog';
import AppLayout from '../layouts/AppLayoutNew';
import DataTable from '../components/data/DataTable';
import { RefreshCw, Upload, Database, LineChart, History } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DataManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { availableData, symbols, loading, error } = useSelector((state: RootState) => state.data);

  // Local state
  const [tabValue, setTabValue] = useState("datasets");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [preprocessingDialogOpen, setPreprocessingDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data when component mounts
    dispatch(fetchAvailableData());
    dispatch(fetchAvailableSymbols());
  }, [dispatch]);

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
  };

  const handlePreprocessingDialogOpen = (dataId: string) => {
    setSelectedDataset(dataId);
    setPreprocessingDialogOpen(true);
  };

  const handlePreprocessingDialogClose = () => {
    setPreprocessingDialogOpen(false);
    setSelectedDataset(null);
  };

  const handleRefreshData = () => {
    dispatch(fetchAvailableData());
    dispatch(addNotification({
      type: 'info',
      message: 'Data refreshed successfully'
    }));
  };

  const handleImportData = async (formData: FormData) => {
    try {
      await dispatch(importMarketData(formData)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Market data imported successfully'
      }));
      handleUploadDialogClose();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to import market data'
      }));
    }
  };

  const handlePreprocessData = async (dataId: string, indicators: string[]) => {
    try {
      await dispatch(preprocessData({ dataId, indicators })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Data preprocessing completed successfully'
      }));
      handlePreprocessingDialogClose();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to preprocess data'
      }));
    }
  };

  // Calculate statistics from the data
  const totalDatasets = availableData.length;
  const datasetsWithIndicators = availableData.filter(d => d.hasIndicators).length;
  const uniqueSymbols = [...new Set(availableData.map(d => d.symbol))].length;
  const totalRecords = availableData.reduce((sum, d) => sum + d.recordCount, 0);

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Data Management</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshData}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleUploadDialogOpen}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between space-x-2">
              <span className="truncate text-sm text-muted-foreground">Total Datasets</span>
            </div>
            <div className="mt-1 text-3xl font-semibold text-foreground">{totalDatasets}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between space-x-2">
              <span className="truncate text-sm text-muted-foreground">Datasets with Indicators</span>
            </div>
            <div className="mt-1 text-3xl font-semibold text-foreground">{datasetsWithIndicators}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between space-x-2">
              <span className="truncate text-sm text-muted-foreground">Unique Symbols</span>
            </div>
            <div className="mt-1 text-3xl font-semibold text-foreground">{uniqueSymbols}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between space-x-2">
              <span className="truncate text-sm text-muted-foreground">Total Records</span>
            </div>
            <div className="mt-1 text-3xl font-semibold text-foreground">{totalRecords.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different data views */}
      <Tabs defaultValue="datasets" value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="datasets" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Datasets
          </TabsTrigger>
          <TabsTrigger value="symbols" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Symbols
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Import History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="datasets" className="mt-0">
          <Card>
            <DataTable
              data={availableData}
              loading={loading}
              onEditData={handlePreprocessingDialogOpen}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="symbols" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <div className="text-muted-foreground">Symbols content goes here.</div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <div className="text-muted-foreground">Import history content goes here.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Import Data Dialog */}
      <DataUploadDialog
        open={uploadDialogOpen}
        onClose={handleUploadDialogClose}
        onUpload={handleImportData}
      />
      
      {/* Preprocessing Dialog */}
      <DataPreprocessingDialog
        open={preprocessingDialogOpen}
        onClose={handlePreprocessingDialogClose}
        onPreprocess={(indicators) => {
          if (selectedDataset) {
            handlePreprocessData(selectedDataset, indicators);
          }
        }}
        dataId={selectedDataset}
        dataset={availableData.find(d => d.id === selectedDataset)}
      />
    </AppLayout>
  );
};

export default DataManagementPage;