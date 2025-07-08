"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'

import { 
  BarChart3, 
  TrendingUp, 
  Microscope,
  Zap, 
  PieChart, 
  Settings, 
  ChevronRight,
  User,
  Bell,
  LogOut,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'



interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  notifications?: number
  badge?: string
}

interface TradingSidebarProps {
  defaultCollapsed?: boolean
  className?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    href: "/"
  },
  {
    id: "market-data",
    label: "Market Data",
    icon: TrendingUp,
    href: "/market-data"
  },
  {
    id: "backtesting",
    label: "Backtesting",
    icon: Microscope,
    href: "/backtesting"
  },
  {
    id: "strategies",
    label: "Strategies",
    icon: Zap,
    href: "/strategies",
    badge: "Pro"
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: PieChart,
    href: "/analytics"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings"
  }
]

const sidebarVariants: Variants = {
  expanded: {
    width: 280,
    transition: {
      duration: 0.45,
      ease: [0.4, 0.0, 0.1, 1]
    }
  },
  collapsed: {
    width: 80,
    transition: {
      duration: 0.45,
      ease: [0.4, 0.0, 0.1, 1]
    }
  }
}

const contentVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      delay: 0.18,
      ease: [0.4, 0.0, 0.1, 1]
    }
  },
  collapsed: {
    opacity: 0,
    x: -15,
    scale: 0.95,
    transition: {
      duration: 0.25,
      ease: [0.4, 0.0, 0.1, 1]
    }
  }
}

const NavigationItem = ({ item, isActive, isCollapsed }: { 
  item: NavigationItem
  isActive: boolean
  isCollapsed: boolean 
}) => {
  const Icon = item.icon

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Link to={item.href} className="block w-full cursor-default">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 px-3 mb-1 relative overflow-hidden nav-item-button rounded-lg cursor-default",
                  isActive && "nav-item-active",
                  isActive
                    ? "bg-primary/15 border-primary/20 shadow-sm ring-1 ring-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:shadow-sm",
                  isCollapsed && "px-0 justify-center",
                  "transition-all duration-200"
                )}
                asChild
              >
                <div>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                  
                  <Icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                  
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.div
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="flex items-center justify-between flex-1 min-w-0"
                      >
                        <span className="truncate cursor-default" style={{ fontFamily: 'system-ui', fontSize: '14px', lineHeight: '20px', letterSpacing: '0px', fontWeight: '500', color: '#737373', transition: 'color 0.2s ease', textShadow: '0 0.5px 1px rgba(0, 0, 0, 0.03)' }}>{item.label}</span>
                        <div className="flex items-center gap-1">
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-[8px]" style={{ fontFamily: 'system-ui', fontSize: '12px', lineHeight: '16px', letterSpacing: '0px', fontWeight: '500', color: '#171717', textShadow: '0 0.5px 1px rgba(0, 0, 0, 0.03)' }}>
                              {item.badge}
                            </Badge>
                          )}
                          {item.notifications && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                              {item.notifications}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Button>
            </Link>
          </motion.div>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            {item.label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

export const TradingSidebar: React.FC<TradingSidebarProps> = ({
  defaultCollapsed = false,
  className = ""
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const location = useLocation()

  // Determine active item based on current location
  const getActiveItem = () => {
    const currentPath = location.pathname
    if (currentPath === '/' || currentPath === '/dashboard') return 'dashboard'
    if (currentPath.startsWith('/market-data')) return 'market-data'
    if (currentPath.startsWith('/backtesting')) return 'backtesting'
    if (currentPath.startsWith('/strategies')) return 'strategies'
    if (currentPath.startsWith('/analytics')) return 'analytics'
    if (currentPath.startsWith('/settings')) return 'settings'
    return 'dashboard' // fallback
  }

  const activeItem = getActiveItem()

  // Notify parent of sidebar state changes
  React.useEffect(() => {
    const event = new CustomEvent('sidebarStateChange', {
      detail: { isCollapsed, isMobile: false, isOpen: true }
    });
    window.dispatchEvent(event);
  }, [isCollapsed])

  return (
    <motion.div
      variants={sidebarVariants}
      initial={isCollapsed ? "collapsed" : "expanded"}
      animate={isCollapsed ? "collapsed" : "expanded"}
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-background/95 border-r border-border/60 flex flex-col",
        "shadow-xl backdrop-blur-md",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex items-center gap-3"
              >
              <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/70 via-primary/45 to-primary/20 rounded-[10px] flex items-center justify-center shadow-md ring-1 ring-primary/10">
                <TrendingUp className="h-5 w-5" style={{ color: '#fafafa' }} />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-foreground truncate cursor-default" style={{ fontFamily: 'system-ui', fontSize: '18px', lineHeight: '28px', letterSpacing: '0px', textShadow: '0 0.5px 1px rgba(0, 0, 0, 0.03)' }}>TradingBot</h2>
                <p className="truncate cursor-default" style={{ fontFamily: 'system-ui', fontSize: '12px', lineHeight: '16px', letterSpacing: '0px', fontWeight: '400', color: '#737373', textShadow: '0 0.5px 1px rgba(0, 0, 0, 0.03)' }}>Pro Dashboard</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 hover:bg-accent transition-all duration-200 cursor-default"
        >
          <motion.div
            animate={{ 
              rotate: isCollapsed ? 0 : 180,
              scale: isCollapsed ? 1 : 1.05 
            }}
            transition={{ 
              duration: 0.2,
              ease: [0.4, 0.0, 0.2, 1]
            }}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </motion.div>
        </Button>
      </div>
    </div>

    {/* Navigation */}
    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="mb-3"
          >
            <p className="uppercase px-3 cursor-default" style={{ fontFamily: 'system-ui', fontSize: '12px', lineHeight: '16px', letterSpacing: '0.6px', fontWeight: '600', color: '#737373', textShadow: '0 0.5px 1px rgba(0, 0, 0, 0.03)' }}>
              Navigation
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1">
        {navigationItems.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>

    {/* User Profile */}
    <div className="p-3 border-t border-border mt-auto">
      <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
        <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-sm">
          <div className="w-full h-full bg-gradient-to-br from-primary via-primary/70 via-primary/45 to-primary/20 rounded-full flex items-center justify-center">
            <User className="h-5 w-5" style={{ color: '#fafafa' }} />
          </div>
        </Avatar>
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex-1 min-w-0"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                   <p className="truncate cursor-default" style={{ fontFamily: 'system-ui', fontSize: '14px', lineHeight: '20px', letterSpacing: '0px', fontWeight: '500', color: '#0a0a0a', textShadow: '0 0.5px 1px rgba(0, 0, 0, 0.03)' }}>John Trader</p>
                   <p className="truncate cursor-default" style={{ fontFamily: 'system-ui', fontSize: '12px', lineHeight: '16px', letterSpacing: '0px', fontWeight: '400', color: '#737373', textShadow: '0 0.5px 1px rgba(0, 0, 0, 0.03)' }}>Premium Account</p>
                </div>
                <div className="flex items-center gap-1">
                                      <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent transition-all duration-200 cursor-default"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent transition-all duration-200 cursor-default"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </motion.div>
  );
};

export default TradingSidebar 