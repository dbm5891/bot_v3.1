"use client";

import * as React from "react";
import { Menu, Search, User, Settings, Bell, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  description?: string;
  items?: NavItem[];
}

interface ModernNavbarProps {
  logo?: {
    src: string;
    alt: string;
    title: string;
  };
  navigation?: NavItem[];
  showSearch?: boolean;
  showNotifications?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const ModernNavbar = ({
  logo = {
    src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
    alt: "Dashboard",
    title: "Dashboard",
  },
  navigation = [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Products",
      href: "/products",
      items: [
        {
          title: "Analytics",
          href: "/products/analytics",
          description: "Track your performance and metrics",
        },
        {
          title: "Reports",
          href: "/products/reports",
          description: "Generate detailed reports",
        },
        {
          title: "Insights",
          href: "/products/insights",
          description: "Get actionable insights",
        },
        {
          title: "Integrations",
          href: "/products/integrations",
          description: "Connect with third-party tools",
        },
      ],
    },
    {
      title: "Team",
      href: "/team",
      items: [
        {
          title: "Members",
          href: "/team/members",
          description: "Manage team members",
        },
        {
          title: "Roles",
          href: "/team/roles",
          description: "Configure user roles",
        },
        {
          title: "Permissions",
          href: "/team/permissions",
          description: "Set access permissions",
        },
      ],
    },
    {
      title: "Settings",
      href: "/settings",
    },
    {
      title: "Help",
      href: "/help",
    },
  ],
  showSearch = true,
  showNotifications = true,
  user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
  },
}: ModernNavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // Escape to close search
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  // Focus search input when opened
  React.useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location?.pathname]); // Assuming you're using a router

  const renderNavigationItem = (item: NavItem) => {
    if (item.items && item.items.length > 0) {
      return (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuTrigger 
            className={cn(
              "text-foreground h-9 px-4 py-2",
              "transition-colors duration-200",
              "hover:bg-accent/50 data-[state=open]:bg-accent/50",
              "data-[active]:text-primary data-[active]:font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label={`${item.title} menu`}
          >
            {item.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div 
              className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] animate-in fade-in-0 slide-in-from-top-5 duration-200"
              role="menu"
            >
              {item.items.map((subItem) => (
                <NavigationMenuLink
                  key={subItem.title}
                  href={subItem.href}
                  className={cn(
                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none",
                    "transition-colors duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "group"
                  )}
                  role="menuitem"
                >
                  <div className="text-sm font-medium leading-none group-hover:translate-x-1 transition-transform duration-200">
                    {subItem.title}
                  </div>
                  {subItem.description && (
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1 group-hover:text-muted-foreground/70">
                      {subItem.description}
                    </p>
                  )}
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }

    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuLink
          href={item.href}
          className={cn(
            navigationMenuTriggerStyle(),
            "h-9 px-4 py-2",
            "transition-colors duration-200",
            "hover:bg-accent/50",
            "data-[active]:text-primary data-[active]:font-medium",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          {item.title}
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  };

  const renderMobileNavigationItem = (item: NavItem) => {
    return (
      <div key={item.title} className="space-y-3">
        <a
          href={item.href}
          className={cn(
            "block text-base font-medium text-foreground",
            "transition-all duration-200",
            "hover:text-primary hover:translate-x-1",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
          role="menuitem"
        >
          {item.title}
        </a>
        {item.items && item.items.length > 0 && (
          <div 
            className="ml-4 space-y-3 border-l pl-4 border-border"
            role="menu"
            aria-label={`${item.title} submenu`}
          >
            {item.items.map((subItem) => (
              <a
                key={subItem.title}
                href={subItem.href}
                className={cn(
                  "block text-sm text-muted-foreground",
                  "transition-all duration-200",
                  "hover:text-foreground hover:translate-x-1",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
                role="menuitem"
              >
                <div className="font-medium">{subItem.title}</div>
                {subItem.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 transition-colors duration-200 group-hover:text-muted-foreground/70">
                    {subItem.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border/40",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-all duration-200",
        isScrolled && "border-border/60 shadow-sm"
      )}
      role="banner"
    >
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <a 
            href="/" 
            className={cn(
              "flex items-center gap-2",
              "transition-all duration-200",
              "hover:opacity-80",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            )}
            aria-label="Home"
          >
            <img 
              src={logo.src} 
              alt={logo.alt} 
              className="h-8 w-8 transition-transform duration-200 hover:scale-105" 
            />
            <span className="text-lg font-semibold bg-gradient-to-r from-foreground/90 to-foreground bg-clip-text text-transparent">
              {logo.title}
            </span>
          </a>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-1">
              {navigation.map(renderNavigationItem)}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Search */}
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden md:flex",
                "transition-colors duration-200",
                "hover:bg-accent/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
              aria-expanded={isSearchOpen}
              aria-controls="search-bar"
              title="Search (⌘K)"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
              <kbd className="hidden lg:inline-flex ml-2 text-xs">⌘K</kbd>
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "hidden md:flex relative",
                "transition-colors duration-200",
                "hover:bg-accent/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <Badge 
                className={cn(
                  "absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0",
                  "text-[10px] font-medium",
                  "animate-in zoom-in-50 duration-200"
                )}
                aria-label="3 unread notifications"
              >
                3
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "hidden md:flex items-center gap-2 px-2",
                  "transition-colors duration-200",
                  "hover:bg-accent/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7 transition-transform duration-200 hover:scale-105">
                  <div 
                    className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium"
                    aria-hidden="true"
                  >
                    {user.name.charAt(0)}
                  </div>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium leading-none">{user.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{user.email}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className={cn(
                "w-56 mt-1",
                "animate-in fade-in-0 zoom-in-95 duration-200"
              )}
            >
              <DropdownMenuItem className="cursor-pointer transition-colors duration-200">
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer transition-colors duration-200">
                <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer transition-colors duration-200">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "lg:hidden",
                  "transition-colors duration-200",
                  "hover:bg-accent/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                aria-label="Menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className={cn(
                "w-80 p-6",
                "animate-in slide-in-from-right duration-300"
              )}
            >
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <img 
                    src={logo.src} 
                    alt={logo.alt} 
                    className="h-6 w-6 transition-transform duration-200 hover:scale-105" 
                  />
                  <span className="font-semibold bg-gradient-to-r from-foreground/90 to-foreground bg-clip-text text-transparent">
                    {logo.title}
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="space-y-6">
                {/* Mobile User Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-10 w-10 transition-transform duration-200 hover:scale-105">
                    <div 
                      className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-medium"
                      aria-hidden="true"
                    >
                      {user.name.charAt(0)}
                    </div>
                  </Avatar>
                  <div>
                    <div className="font-medium leading-none">{user.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{user.email}</div>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav 
                  className="space-y-4"
                  role="navigation"
                  aria-label="Mobile navigation"
                >
                  {navigation.map(renderMobileNavigationItem)}
                </nav>

                {/* Mobile Actions */}
                <div className="space-y-1 pt-4 border-t border-border">
                  {showSearch && (
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start h-9 px-2",
                        "transition-all duration-200",
                        "hover:bg-accent/50 hover:translate-x-1",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSearchOpen(true);
                      }}
                    >
                      <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                      Search
                    </Button>
                  )}
                  {showNotifications && (
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start h-9 px-2",
                        "transition-all duration-200",
                        "hover:bg-accent/50 hover:translate-x-1",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                    >
                      <Bell className="mr-2 h-4 w-4" aria-hidden="true" />
                      Notifications
                      <Badge className="ml-auto">3</Badge>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start h-9 px-2",
                      "transition-all duration-200",
                      "hover:bg-accent/50 hover:translate-x-1",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                  >
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    Settings
                  </Button>
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Bar (when expanded) */}
      {isSearchOpen && (
        <div 
          id="search-bar"
          className={cn(
            "border-t border-border/40 bg-background p-4",
            "animate-in slide-in-from-top-2 duration-200"
          )}
          role="search"
        >
          <div className="container">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                id="navbar-search"
                name="search"
                placeholder="Search..."
                className={cn(
                  "w-full h-9 rounded-md",
                  "border border-input bg-transparent",
                  "pl-10 pr-4 text-sm",
                  "ring-offset-background",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "transition-all duration-200"
                )}
                aria-label="Search"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden md:inline-flex">
                ESC to close
              </kbd>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default ModernNavbar; 