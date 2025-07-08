import { ReactNode, useState, useEffect } from 'react';
import { TradingSidebar } from '../components/ui/TradingSidebar';

interface AppLayoutNewProps {
  children: ReactNode;
}

const AppLayoutNew = ({ children }: AppLayoutNewProps) => {
  const [sidebarState, setSidebarState] = useState({
    isCollapsed: false,
    isMobile: false,
    isOpen: true
  });

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarState(event.detail);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
  }, []);

  // Calculate the margin based on sidebar state
  const getMainContentMargin = () => {
    if (sidebarState.isMobile) return '0';
    return sidebarState.isCollapsed ? '80px' : '280px';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TradingSidebar />
      
      {/* Main content area with dynamic margin */}
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{
          marginLeft: getMainContentMargin(),
        }}
      >
        <main className="p-4 sm:px-6 sm:py-4 w-full min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayoutNew; 