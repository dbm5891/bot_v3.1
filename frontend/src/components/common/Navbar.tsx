import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppIcon from "../icons/AppIcon";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";
import { cn } from "../../lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../ui/sheet";
import { useNavigate, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface NavbarProps {
  logo?: React.ReactNode;
  navItems?: NavItem[];
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  logo = (
    <div className="flex items-center">
      <span className="mr-2 text-primary">
        <AppIcon name="BarChart2" />
      </span>
      <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text select-none">
        Bot v3.1
      </span>
    </div>
  ),
  navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <AppIcon name="LayoutDashboard" />,
    },
    {
      name: "Market Data",
      path: "/market-data",
      icon: <AppIcon name="TrendingUp" />,
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
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <AppIcon name="PieChart" />,
    },
  ],
  className = "",
}) => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full h-16 px-4 md:px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 fixed top-0 left-0 right-0 ${className}`}
    >
      <div className="flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <a href="/" className="flex items-center gap-2">
            {logo}
          </a>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavigationMenuItem key={item.name}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md transition-colors cursor-pointer",
                      isActive 
                        ? "bg-secondary text-secondary-foreground font-semibold" 
                        : "bg-transparent hover:bg-accent hover:text-accent-foreground font-normal"
                    )}
                    onClick={() => handleNav(item.path)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* User Menu & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="rounded-full p-1 hover:bg-accent cursor-pointer flex items-center justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <AppIcon name="Settings" className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AppIcon name="LogOut" className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <div className="md:hidden p-2 hover:bg-accent rounded-md cursor-pointer">
                <AppIcon name="Menu" className="h-5 w-5" />
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] max-w-sm">
              <div className="flex flex-col gap-6 py-6">
                <div className="px-2">
                  {logo}
                </div>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <div
                        key={item.name}
                        className={cn(
                          "flex items-center justify-start gap-2 px-3 py-2 rounded-md transition-colors cursor-pointer",
                          isActive 
                            ? "bg-secondary text-secondary-foreground font-semibold" 
                            : "bg-transparent hover:bg-accent hover:text-accent-foreground font-normal"
                        )}
                        onClick={() => handleNav(item.path)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                    );
                  })}
                </nav>
                {/* Add Theme Toggle to Mobile Menu */}
                <div className="px-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md">
                    <AppIcon name="Sun" />
                    <span>Theme</span>
                    <div className="ml-auto">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar; 