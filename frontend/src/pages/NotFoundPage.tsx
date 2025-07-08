import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="max-w-2xl w-full">
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
          <CardContent className="p-12 text-center">
            {/* Animated 404 */}
            <div className="mb-8 relative">
              <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-pulse">
                404
              </div>
              <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-primary/5 animate-pulse delay-100">
                404
              </div>
            </div>

            {/* Warning Icon */}
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-gradient-to-br from-orange-500/10 to-orange-500/5 animate-float">
                <AlertTriangle className="w-12 h-12 text-orange-500" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-bold tracking-tight">
                Oops! Page Not Found
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                The page you're looking for seems to have wandered off into the digital void. 
                Don't worry, even the best traders sometimes take a wrong turn.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/')} 
                size="lg"
                className="flex items-center gap-2 min-w-[160px] hover:scale-105 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                size="lg"
                className="flex items-center gap-2 min-w-[160px] hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">
                Looking for something specific? Try these popular sections:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: 'Backtesting', path: '/backtesting' },
                  { label: 'Strategies', path: '/strategies' },
                  { label: 'Market Data', path: '/market-data' },
                  { label: 'Analytics', path: '/analytics' }
                ].map((link) => (
                  <Button
                    key={link.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(link.path)}
                    className="text-xs hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    {link.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-full animate-pulse" />
            <div className="absolute bottom-4 right-4 w-20 h-20 bg-gradient-to-br from-secondary/5 to-transparent rounded-full animate-pulse delay-300" />
            <div className="absolute top-1/3 -right-8 w-12 h-12 bg-gradient-to-br from-accent/10 to-transparent rounded-full animate-pulse delay-700" />
          </CardContent>
        </Card>

        {/* Additional Help Text */}
        <div className="text-center mt-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team or check the documentation.
          </p>
        </div>
      </div>
    </div>
  );
} 