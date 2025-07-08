import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'component' | 'critical';
  onError?: (error: Error, errorInfo: any) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  showDetails: boolean;
  copied: boolean;
  retryCount: number;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false,
      copied: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleToggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  handleCopyError = async () => {
    const errorText = `
Error: ${this.state.error?.name || 'Unknown Error'}
Message: ${this.state.error?.message || 'No message'}
Stack: ${this.state.error?.stack || 'No stack trace'}
Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack'}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      const { level = 'page' } = this.props;
      const isComponentLevel = level === 'component';
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const containerClass = isComponentLevel 
        ? "p-6 border border-destructive/20 rounded-lg bg-destructive/5"
        : "flex flex-col items-center justify-center min-h-screen bg-background p-6";

      return (
        <div className={containerClass}>
          <Card className={cn(
            "max-w-2xl w-full",
            isComponentLevel ? "border-destructive/20" : "border-border shadow-lg"
          )}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="text-destructive" size={isComponentLevel ? 32 : 48} />
              </div>
              <CardTitle className={cn(
                "text-destructive",
                isComponentLevel ? "text-lg" : "text-2xl"
              )}>
                {level === 'critical' ? 'Critical Error' : 'Something went wrong'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
                </AlertDescription>
              </Alert>

              {this.state.retryCount > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This error has occurred {this.state.retryCount} time(s). Consider reloading the page.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Reload Page
                </Button>
                
                {!isComponentLevel && (
                  <Button 
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Home size={16} />
                    Go Home
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={this.handleToggleDetails}
                  className="w-full"
                >
                  {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                </Button>

                {this.state.showDetails && (
                  <div className="space-y-3">
                    <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-40">
                      <div className="text-destructive font-semibold mb-2">
                        {this.state.error?.name}: {this.state.error?.message}
                      </div>
                      {this.state.error?.stack && (
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={this.handleCopyError}
                      className="w-full flex items-center gap-2"
                      disabled={this.state.copied}
                    >
                      {this.state.copied ? (
                        <>
                          <CheckCircle size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy Error Details
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                If this problem persists, please contact our support team with the error details above.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}