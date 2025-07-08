import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  RefreshCw, 
  Database, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Settings,
  Download,
  Filter,
  Search,
  Plus,
  Activity,
  Clock,
  FileText
} from 'lucide-react';

import { RootState, AppDispatch } from '../store/index';
import DataTable from '../components/data/DataTable';
import DataUploadDialog from '../components/data/DataUploadDialog';
import DataPreprocessingDialog from '../components/data/DataPreprocessingDialog';
import { fetchAvailableData } from '../store/slices/dataSlice';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';

// Interface for market data
interface MarketData {
  id: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  recordCount: number;
  hasIndicators: boolean;
  appliedIndicators?: string[];
  lastUpdated: string;
}

const MarketDataPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get data from Redux store
  const { availableData, loading: dataLoading, error: dataError } = useSelector((state: RootState) => state.data);
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [preprocessingDialogOpen, setPreprocessingDialogOpen] = useState(false);
  const [selectedDataId, setSelectedDataId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Load market data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Dispatch the actual Redux action to fetch data
        await dispatch(fetchAvailableData());
        setError(null);
      } catch (err) {
        setError('Failed to fetch market data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);
  
  // Filter data based on search and timeframe
  const filteredData = availableData.filter(item => {
    const matchesSearch = item.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTimeframe = filterTimeframe === 'all' || item.timeframe === filterTimeframe;
    return matchesSearch && matchesTimeframe;
  });

  // Get unique timeframes for filter
  const uniqueTimeframes = [...new Set(availableData.map(item => item.timeframe))];
  
  // Handle data actions
  const handleRefresh = () => {
    dispatch(fetchAvailableData());
  };
  
  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
  };
  
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };
  
  const handleUploadData = async (formData: FormData) => {
    try {
      // In a real implementation, dispatch an action to upload the data
      console.log('Uploading data...', formData);
      setUploadDialogOpen(false);
      // Refresh the data after upload
      dispatch(fetchAvailableData());
    } catch (err) {
      console.error(err);
      setError('Failed to upload market data');
    }
  };
  
  const handleOpenPreprocessingDialog = (dataId: string) => {
    setSelectedDataId(dataId);
    setPreprocessingDialogOpen(true);
  };
  
  const handleClosePreprocessingDialog = () => {
    setPreprocessingDialogOpen(false);
    setSelectedDataId(null);
  };
  
  const handlePreprocessData = async (indicators: string[]) => {
    if (!selectedDataId) return;
    
    try {
      // In a real implementation, dispatch an action to preprocess the data
      console.log('Preprocessing data...', selectedDataId, indicators);
      setPreprocessingDialogOpen(false);
      // Refresh the data after preprocessing
      dispatch(fetchAvailableData());
    } catch (err) {
      console.error(err);
      setError('Failed to preprocess data');
    }
  };
  
  const handleDeleteData = async (dataId: string) => {
    if (window.confirm('Are you sure you want to delete this data?')) {
      try {
        // In a real implementation, dispatch an action to delete the data
        // Perform deletion logic here
        // Refresh the data after deletion
        dispatch(fetchAvailableData());
      } catch (err) {
        console.error(err);
        setError('Failed to delete market data');
      }
    }
  };

  // Find the selected dataset for preprocessing
  const selectedDataset = availableData.find(d => d.id === selectedDataId);

  // Calculate statistics
  const totalRecords = availableData.reduce((sum, item) => sum + (item.recordCount || 0), 0);
  const datasetsWithIndicators = availableData.filter(item => item.hasIndicators).length;
  const uniqueSymbols = new Set(availableData.map(item => item.symbol)).size;

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Market Data Management
              </h1>
              <p className="text-muted-foreground text-lg">
                Import, manage, and analyze your market data sources
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={dataLoading || isLoading}
                className="flex items-center gap-2 hover:bg-muted transition-all duration-200"
              >
                <RefreshCw className={cn("w-4 h-4", (dataLoading || isLoading) && "animate-spin")} />
                Refresh
              </Button>
              <Button 
                onClick={handleOpenUploadDialog}
                size="lg"
                className="flex items-center gap-2 h-12 px-6 hover:scale-105 transition-all duration-200"
              >
                <Upload className="w-5 h-5" />
                Import Data
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Datasets',
              value: availableData.length.toString(),
              icon: Database,
              color: 'text-blue-600'
            },
            {
              label: 'Unique Symbols',
              value: uniqueSymbols.toString(),
              icon: TrendingUp,
              color: 'text-green-800 dark:text-green-200'
            },
            {
              label: 'Total Records',
              value: totalRecords.toLocaleString(),
              icon: BarChart3,
              color: 'text-purple-600'
            },
            {
              label: 'With Indicators',
              value: datasetsWithIndicators.toString(),
              icon: Activity,
              color: 'text-orange-600'
            }
          ].map((stat) => (
            <Card key={stat.label} className="border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                  <div className={cn("p-2 rounded-lg bg-gradient-to-br", 
                    stat.color.includes('blue') && "from-blue-500/10 to-blue-500/5",
                    stat.color.includes('green') && "from-green-500/10 to-green-500/5",
                    stat.color.includes('purple') && "from-purple-500/10 to-purple-500/5",
                    stat.color.includes('orange') && "from-orange-500/10 to-orange-500/5"
                  )}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Error Alert */}
        {(error || dataError) && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20 animate-in slide-in-from-top-2 duration-300">
            <AlertDescription className="font-medium">
              {error || dataError}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex bg-card/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              Overview
            </TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              Data Table
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Search and Filter Section */}
            <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search by symbol or dataset ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
                      <SelectTrigger className="w-[140px] h-10">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Timeframes</SelectItem>
                        {uniqueTimeframes.map(timeframe => (
                          <SelectItem key={timeframe} value={timeframe}>{timeframe}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Grid */}
            {dataLoading || isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="space-y-3">
                        <div className="h-6 w-3/4 bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                        <div className="flex gap-2">
                          <div className="h-5 w-16 bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                          <div className="h-5 w-20 bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="h-4 w-full bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                        <div className="h-4 w-2/3 bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                {filteredData.map((dataset) => (
                  <Card key={dataset.id} className="group overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-lg font-semibold tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
                            {dataset.symbol}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-medium">
                              {dataset.timeframe}
                            </Badge>
                            {dataset.hasIndicators && (
                              <Badge variant="secondary" className="text-xs font-medium flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                Indicators
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={() => handleOpenPreprocessingDialog(dataset.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Records:</span>
                          <span className="font-medium">{dataset.recordCount?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Period:</span>
                          <span className="font-medium">
                            {dataset.startDate && dataset.endDate ? 
                              `${new Date(dataset.startDate).toLocaleDateString()} - ${new Date(dataset.endDate).toLocaleDateString()}` : 
                              'N/A'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Updated {new Date(dataset.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/market-data/${dataset.id}`)}
                          className="h-8 px-3 text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-6 p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30">
                    <Database className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm || filterTimeframe !== 'all' ? 'No Data Found' : 'No Market Data'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchTerm || filterTimeframe !== 'all' 
                      ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                      : 'Get started by importing your first dataset. Upload CSV files or connect to data sources.'
                    }
                  </p>
                  <div className="flex gap-3">
                    {searchTerm || filterTimeframe !== 'all' ? (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm('');
                          setFilterTimeframe('all');
                        }}
                        className="flex items-center gap-2"
                      >
                        Clear Filters
                      </Button>
                    ) : null}
                    <Button 
                      onClick={handleOpenUploadDialog}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Import Your First Dataset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-muted/5 to-muted/10 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Data Table View
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Detailed table view of all market data
                    </p>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1">
                    {filteredData.length} datasets
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable 
                  data={filteredData} 
                  onEditData={handleOpenPreprocessingDialog}
                  onDeleteData={handleDeleteData}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Data Upload Dialog */}
      <DataUploadDialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        onUpload={handleUploadData}
      />
      
      {/* Data Preprocessing Dialog */}
      <DataPreprocessingDialog
        open={preprocessingDialogOpen}
        onClose={handleClosePreprocessingDialog}
        onPreprocess={handlePreprocessData}
        dataId={selectedDataId}
        dataset={selectedDataset}
      />
    </div>
  );
};

export default MarketDataPage;