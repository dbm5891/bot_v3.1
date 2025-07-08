"use client";

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import {
  Home,
  Settings,
  AreaChart,
  History,
  BrainCircuit,
  BarChart,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: string;
}

interface ModernSidebarProps {
  navigation: NavItem[];
  user: {
    name: string;
    email: string;
  };
}

const iconMap: { [key: string]: React.ElementType } = {
  Home,
  AreaChart,
  History,
  BrainCircuit,
  BarChart,
  Settings,
  User,
};

export const ModernSidebar = ({ navigation, user }: ModernSidebarProps) => {
  // Local state for sidebar behavior (not shared with layout)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Notify parent of state changes via custom events
  useEffect(() => {
    const event = new CustomEvent('sidebarStateChange', {
      detail: { isCollapsed, isMobile, isOpen }
    });
    window.dispatchEvent(event);
  }, [isCollapsed, isMobile, isOpen]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActiveItem = (href: string) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <TooltipProvider>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border shadow-sm md:hidden"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5 text-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-foreground" />
          )}
        </button>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background shadow-sm transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            {!isCollapsed && (
              <h1 className="text-lg font-bold text-foreground">Bot v3.1</h1>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {navigation.map((item) => {
            const Icon = iconMap[item.icon] || Home;
            const isActive = isActiveItem(item.href);

            return (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "bg-muted/50 text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {!isCollapsed && (
                      <span className="font-medium truncate">{item.title}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="absolute right-3 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* User profile section */}
        <div className="mt-auto border-t p-3">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name.charAt(0)}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>

          {/* Logout button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 w-full mt-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all duration-200",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <LogOut className="h-5 w-5" />
                {!isCollapsed && <span className="font-medium">Logout</span>}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Logout
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}; 