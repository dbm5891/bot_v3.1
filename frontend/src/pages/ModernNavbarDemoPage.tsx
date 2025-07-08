import React from "react";
import ModernNavbar from "../components/common/ModernNavbar";
import AppIcon from "../components/icons/AppIcon";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const ModernNavbarDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Modern Navigation Bar */}
      <ModernNavbar />
      
      {/* Page Content */}
      <div className="container mx-auto pt-20 px-4 pb-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Modern Navigation Bar</h1>
          <p className="text-muted-foreground text-lg mb-8">
            A responsive navigation bar built with shadcn/ui and Tailwind CSS
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
                <CardDescription>What makes this navbar special</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <AppIcon name="Check" className="text-green-500 mt-1 h-5 w-5" />
                    <span>Fully responsive design for all screen sizes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppIcon name="Check" className="text-green-500 mt-1 h-5 w-5" />
                    <span>Dropdown menus for nested navigation items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppIcon name="Check" className="text-green-500 mt-1 h-5 w-5" />
                    <span>Auto-hide on scroll down, show on scroll up</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppIcon name="Check" className="text-green-500 mt-1 h-5 w-5" />
                    <span>Active state highlighting for current page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppIcon name="Check" className="text-green-500 mt-1 h-5 w-5" />
                    <span>Mobile-friendly slide-out menu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppIcon name="Check" className="text-green-500 mt-1 h-5 w-5" />
                    <span>User profile dropdown with actions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Implementation</CardTitle>
                <CardDescription>Built with modern technologies</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <AppIcon name="CheckCircle" className="text-primary mt-1 h-5 w-5" />
                    <span>shadcn/ui components for consistent design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppIcon name="CheckCircle" className="text-primary mt-1 h-5 w-5" />
                    <span>Tailwind CSS for responsive styling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppIcon name="CheckCircle" className="text-primary mt-1 h-5 w-5" />
                    <span>React Router integration for navigation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppIcon name="CheckCircle" className="text-primary mt-1 h-5 w-5" />
                    <span>Framer Motion for smooth animations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppIcon name="CheckCircle" className="text-primary mt-1 h-5 w-5" />
                    <span>Lucide icons for consistent iconography</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppIcon name="CheckCircle" className="text-primary mt-1 h-5 w-5" />
                    <span>TypeScript for type safety</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6 mb-10">
            <h2 className="text-2xl font-bold">Try It Out</h2>
            <p className="text-muted-foreground">
              Scroll down to see the navbar hide, then scroll back up to see it reappear.
              On mobile devices, tap the menu icon to open the slide-out navigation panel.
            </p>
            
            <div className="h-[50vh] border rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-center p-6">
                <h3 className="text-xl font-semibold mb-4">Scroll Down</h3>
                <AppIcon name="ArrowDown" className="h-10 w-10 mx-auto animate-bounce" />
              </div>
            </div>
          </div>
          
          <div className="space-y-6 mb-10">
            <h2 className="text-2xl font-bold">How to Use</h2>
            <Card>
              <CardHeader>
                <CardTitle>Basic Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code>{`import ModernNavbar from "../components/common/ModernNavbar";

const MyPage = () => {
  return (
    <>
      <ModernNavbar />
      <div className="pt-16">
        {/* Your page content */}
      </div>
    </>
  );
};`}</code>
                </pre>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Custom Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code>{`import ModernNavbar from "../components/common/ModernNavbar";
import AppIcon from "../components/icons/AppIcon";

const MyPage = () => {
  const customNavItems = [
    {
      name: "Home",
      path: "/",
      icon: <AppIcon name="Home" />,
    },
    {
      name: "Products",
      path: "/products",
      icon: <AppIcon name="Package" />,
      children: [
        {
          name: "New Arrivals",
          path: "/products/new",
          description: "Check out our latest products",
        },
        {
          name: "Best Sellers",
          path: "/products/best-sellers",
          description: "Our most popular items",
        },
      ],
    },
    // More items...
  ];

  return (
    <>
      <ModernNavbar 
        navItems={customNavItems}
        showNotifications={false}
      />
      <div className="pt-16">
        {/* Your page content */}
      </div>
    </>
  );
};`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <Button size="lg" className="gap-2">
              <AppIcon name="Code" />
              <span>View Source Code</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernNavbarDemoPage; 