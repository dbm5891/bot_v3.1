import React from "react";
import ModernNavbar from "../common/ModernNavbar";
import AppIcon from "../icons/AppIcon";

const ModernNavbarExample: React.FC = () => {
  // Custom navigation items
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <AppIcon name="LayoutDashboard" />,
    },
    {
      name: "Market Data",
      path: "/market-data",
      icon: <AppIcon name="TrendingUp" />,
      children: [
        {
          name: "Historical Data",
          path: "/market-data/historical",
          description: "View and manage historical market data",
        },
        {
          name: "Real-time Data",
          path: "/market-data/real-time",
          description: "Monitor real-time market movements",
        },
        {
          name: "Data Sources",
          path: "/market-data/sources",
          description: "Configure and manage data providers",
        },
      ],
    },
    {
      name: "Backtesting",
      path: "/backtesting",
      icon: <AppIcon name="BarChart2" />,
    },
    {
      name: "Strategies",
      path: "/strategies",
      icon: <AppIcon name="Code2" />,
      children: [
        {
          name: "My Strategies",
          path: "/strategies/my-strategies",
          description: "View and manage your custom strategies",
        },
        {
          name: "Strategy Builder",
          path: "/strategies/builder",
          description: "Create new trading strategies",
        },
      ],
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <AppIcon name="PieChart" />,
    },
  ];

  // Custom logo
  const customLogo = (
    <div className="flex items-center">
      <span className="mr-2 text-primary">
        <AppIcon name="Rocket" />
      </span>
      <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text select-none">
        AlgoTrader Pro
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Default ModernNavbar */}
      <ModernNavbar />
      
      {/* Content area with padding for the fixed navbar */}
      <div className="pt-16 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Modern Navbar Examples</h1>
          
          <div className="space-y-12">
            {/* Example 1: Default Navbar */}
            <section className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Default Navbar</h2>
              <p className="text-muted-foreground mb-4">
                The default navbar is shown at the top of the page with the default Bot v3.1 logo and navigation items.
              </p>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{`<ModernNavbar />`}</code>
              </pre>
            </section>
            
            {/* Example 2: Custom Navbar */}
            <section className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Custom Navbar</h2>
              <p className="text-muted-foreground mb-4">
                You can customize the navbar with your own logo, navigation items, and control whether to show notifications.
              </p>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{`<ModernNavbar 
  logo={customLogo}
  navItems={navItems}
  showNotifications={false}
/>`}</code>
              </pre>
              
              <div className="mt-6 p-4 border rounded-md">
                <h3 className="text-lg font-medium mb-2">Preview:</h3>
                <div className="border rounded-md p-2 relative h-16 flex items-center">
                  <div className="flex items-center justify-between w-full px-4">
                    {customLogo}
                    <div className="hidden md:flex items-center space-x-1">
                      {navItems.slice(0, 3).map((item) => (
                        <div key={item.name} className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/20">
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                      ))}
                      <span className="text-muted-foreground">...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 h-8 w-8 flex items-center justify-center text-primary">U</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Example 3: Usage Information */}
            <section className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Usage Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Props</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><code className="bg-muted px-1 rounded">logo</code> - React node for the navbar logo</li>
                    <li><code className="bg-muted px-1 rounded">navItems</code> - Array of navigation items</li>
                    <li><code className="bg-muted px-1 rounded">className</code> - Additional CSS classes</li>
                    <li><code className="bg-muted px-1 rounded">showNotifications</code> - Whether to show the notification icon</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Features</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>Responsive design - adapts to mobile and desktop</li>
                    <li>Dropdown menus for nested navigation</li>
                    <li>Auto-hide on scroll down, show on scroll up</li>
                    <li>Active state highlighting</li>
                    <li>User menu dropdown</li>
                    <li>Mobile slide-out menu</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernNavbarExample; 