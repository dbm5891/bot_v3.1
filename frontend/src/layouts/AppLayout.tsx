import { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { toggleDarkMode } from '../store/slices/uiSlice';
import ModernNavbar from '../components/common/ModernNavbar';
import { Button } from '../components/ui/button';
import { Sun, Moon } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state: RootState) => state.ui);

  // Define navigation structure for the new ModernNavbar
  const navigation = [
    {
      title: "Dashboard",
      href: "/",
    },
    {
      title: "Market Data",
      href: "/market-data",
      items: [
        {
          title: "Historical Data",
          href: "/market-data/historical",
          description: "View and manage historical market data",
        },
        {
          title: "Real-time Data",
          href: "/market-data/real-time",
          description: "Monitor real-time market movements",
        },
      ],
    },
    {
      title: "Backtesting",
      href: "/backtesting",
    },
    {
      title: "Strategies",
      href: "/strategies",
    },
    {
      title: "Analytics",
      href: "/analytics",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernNavbar
        logo={{
          src: "/logo.svg",
          alt: "Bot v3.1",
          title: "Bot v3.1",
        }}
        navigation={navigation}
        showSearch={true}
        showNotifications={true}
        user={{
          name: "Demo User",
          email: "demo@bot.com",
        }}
      />
      
      {/* Dark mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full shadow-lg"
        onClick={() => dispatch(toggleDarkMode())}
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}