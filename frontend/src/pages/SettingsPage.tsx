import { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Key,
  Save,
  Monitor,
  Moon,
  Sun,
  Mail,
  AlertTriangle,
  TrendingDown,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const SettingsPage = () => {
  // UI Settings
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [tradingAlerts, setTradingAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  
  // Trading Settings
  const [riskLevel, setRiskLevel] = useState('medium');
  const [maxDrawdown, setMaxDrawdown] = useState(2);
  const [maxPositions, setMaxPositions] = useState(5);
  const [autoStop, setAutoStop] = useState(true);
  
  // API Settings
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('https://api.polygon.io');
  
  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Settings
              </h1>
              <p className="text-muted-foreground text-lg">
                Configure your trading platform preferences and settings
              </p>
            </div>
            <div className="flex gap-3">
              {saveSuccess && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800 animate-in slide-in-from-top-2 duration-300">
                  <Check className="w-4 h-4 mr-1" />
                  Settings Saved
                </Badge>
              )}
              <Button 
                onClick={handleSaveSettings}
                disabled={isLoading}
                size="lg"
                className="flex items-center gap-2 h-12 px-6 hover:scale-105 transition-all duration-200"
              >
                <Save className={cn("w-5 h-5", isLoading && "animate-spin")} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="interface" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="interface" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              <Palette className="w-4 h-4 mr-2" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="trading" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              <TrendingDown className="w-4 h-4 mr-2" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              <Key className="w-4 h-4 mr-2" />
              API
            </TabsTrigger>
          </TabsList>

          {/* Interface Settings */}
          <TabsContent value="interface" className="space-y-6">
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-muted/5 to-muted/10">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  User Interface Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium flex items-center gap-2">
                          {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                          Dark Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <Switch
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Compact Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Reduce spacing for more information density
                        </p>
                      </div>
                      <Switch
                        checked={compactMode}
                        onCheckedChange={setCompactMode}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Animations</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable smooth transitions and animations
                        </p>
                      </div>
                      <Switch
                        checked={animationsEnabled}
                        onCheckedChange={setAnimationsEnabled}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-muted/5 to-muted/10">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Browser push notifications
                        </p>
                      </div>
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Trading Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications for trade executions
                        </p>
                      </div>
                      <Switch
                        checked={tradingAlerts}
                        onCheckedChange={setTradingAlerts}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          System Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Critical system notifications
                        </p>
                      </div>
                      <Switch
                        checked={systemAlerts}
                        onCheckedChange={setSystemAlerts}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Settings */}
          <TabsContent value="trading" className="space-y-6">
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-muted/5 to-muted/10">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Trading & Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="risk-level" className="text-base font-medium">
                        Risk Level
                      </Label>
                      <Select value={riskLevel} onValueChange={setRiskLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="outline" className={cn("w-fit", getRiskLevelColor(riskLevel))}>
                        Current: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max-drawdown" className="text-base font-medium">
                        Max Drawdown (%)
                      </Label>
                      <Input
                        id="max-drawdown"
                        type="number"
                        value={maxDrawdown}
                        onChange={(e) => setMaxDrawdown(Number(e.target.value))}
                        min={0.1}
                        max={100}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        Maximum portfolio drawdown before automatic stop
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-positions" className="text-base font-medium">
                        Max Concurrent Positions
                      </Label>
                      <Input
                        id="max-positions"
                        type="number"
                        value={maxPositions}
                        onChange={(e) => setMaxPositions(Number(e.target.value))}
                        min={1}
                        max={50}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        Maximum number of open positions
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Auto-Stop Trading</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically stop trading on risk limits
                        </p>
                      </div>
                      <Switch
                        checked={autoStop}
                        onCheckedChange={setAutoStop}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api" className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-400">
                Keep your API credentials secure. Never share them with anyone.
              </AlertDescription>
            </Alert>
            
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-muted/5 to-muted/10">
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-endpoint" className="text-base font-medium">
                      API Endpoint
                    </Label>
                    <Input
                      id="api-endpoint"
                      type="url"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      placeholder="https://api.polygon.io"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key" className="text-base font-medium">
                        API Key
                      </Label>
                      <div className="relative">
                        <Input
                          id="api-key"
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter your API key"
                          className="w-full pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="api-secret" className="text-base font-medium">
                        API Secret
                      </Label>
                      <div className="relative">
                        <Input
                          id="api-secret"
                          type={showApiSecret ? "text" : "password"}
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value)}
                          placeholder="Enter your API secret"
                          className="w-full pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiSecret(!showApiSecret)}
                        >
                          {showApiSecret ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;