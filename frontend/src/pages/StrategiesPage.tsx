import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Plus, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';

import { RootState, AppDispatch } from '../store';
import { fetchStrategies, deleteStrategy, Strategy } from '../store/slices/strategySlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const StrategiesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { strategies, loading, error } = useSelector((state: RootState) => state.strategy);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    // Only fetch if we don't have any strategies yet
    if (strategies.length === 0 && !loading) {
      dispatch(fetchStrategies());
    }
  }, [dispatch, strategies.length, loading]);

  const filteredStrategies = strategies
    .filter(strategy => {
      const matchesSearch = strategy.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || (strategy.status ?? '').toLowerCase() === status;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800';
      case 'testing':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'momentum':
        return <TrendingUp className="w-4 h-4" />;
      case 'mean_reversion':
        return <TrendingDown className="w-4 h-4" />;
      case 'scalping':
        return <Activity className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const renderStrategyCard = (strategy: Strategy) => {
    return (
      <Card key={strategy.id} className="group overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-lg font-semibold tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
                {strategy.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs font-medium", getStatusColor(strategy.status || 'inactive'))}>
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-1",
                    strategy.status?.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  )} />
                  {strategy.status || 'Inactive'}
                </Badge>
                <Badge variant="secondary" className="text-xs font-medium flex items-center gap-1">
                  {getTypeIcon(strategy.type)}
                  {strategy.type}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate(`/strategies/${strategy.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/strategies/${strategy.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Strategy
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => dispatch(deleteStrategy(strategy.id))}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {strategy.indicators && strategy.indicators.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-muted-foreground">Indicators:</p>
              <div className="flex flex-wrap gap-1">
                {strategy.indicators.slice(0, 3).map((indicator) => (
                  <Badge key={indicator} variant="outline" className="text-xs px-2 py-1">
                    {indicator}
                  </Badge>
                ))}
                {strategy.indicators.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +{strategy.indicators.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Updated {new Date(strategy.updatedAt).toLocaleDateString()}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/strategies/${strategy.id}`)}
              className="h-8 px-3 text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Trading Strategies
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage and monitor your algorithmic trading strategies
              </p>
            </div>
            <Button 
              onClick={() => navigate('/strategies/new')}
              size="lg"
              className="flex items-center gap-2 h-12 px-6 hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Create New Strategy
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search strategies by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[140px] h-10">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20 animate-in slide-in-from-top-2 duration-300">
            <AlertDescription className="font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Content Section */}
        {loading ? (
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
                    <div className="h-4 w-1/2 bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                    <div className="flex gap-1">
                      <div className="h-6 w-16 bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                      <div className="h-6 w-16 bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                    </div>
                    <div className="h-4 w-full bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStrategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            {filteredStrategies.map((strategy) => renderStrategyCard(strategy))}
          </div>
        ) : (
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30">
                <BarChart3 className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {search || status !== 'all' ? 'No Strategies Found' : 'No Strategies Yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {search || status !== 'all' 
                  ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                  : 'Get started by creating your first trading strategy. Define your rules, indicators, and risk management parameters.'
                }
              </p>
              <div className="flex gap-3">
                {search || status !== 'all' ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearch('');
                      setStatus('all');
                    }}
                    className="flex items-center gap-2"
                  >
                    Clear Filters
                  </Button>
                ) : null}
                <Button 
                  onClick={() => navigate('/strategies/new')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Strategy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        {strategies.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            {[
              {
                label: 'Total Strategies',
                value: strategies.length.toString(),
                icon: BarChart3,
                color: 'text-blue-600'
              },
              {
                label: 'Active',
                value: strategies.filter(s => s.status?.toLowerCase() === 'active').length.toString(),
                icon: TrendingUp,
                color: 'text-green-800 dark:text-green-200'
              },
              {
                label: 'Testing',
                value: strategies.filter(s => s.status?.toLowerCase() === 'testing').length.toString(),
                icon: Activity,
                color: 'text-orange-600'
              },
              {
                label: 'Recently Updated',
                value: strategies.filter(s => {
                  const daysSinceUpdate = (Date.now() - new Date(s.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
                  return daysSinceUpdate <= 7;
                }).length.toString(),
                icon: Clock,
                color: 'text-purple-600'
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
                      stat.color.includes('orange') && "from-orange-500/10 to-orange-500/5",
                      stat.color.includes('purple') && "from-purple-500/10 to-purple-500/5"
                    )}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategiesPage;