// Remove the local module declaration from this file. It will be placed in a .d.ts file instead.

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@21st-dev/magic';

import React from 'react';
import {
  User,
  ChevronsUpDown,
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
} from 'lucide-react';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Backtesting', url: '/backtesting', icon: Inbox },
  { title: 'Calendar', url: '/backtesting/compare', icon: Calendar },
  { title: 'Market Data', url: '/market-data', icon: Search },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export default function SidebarMagicDemo() {
  return (
    <SidebarProvider>
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={window.location.pathname === item.url}>
                        <a href={item.url}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarGroup>
              <SidebarMenuButton className="w-full justify-between gap-3 h-12">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 rounded-md" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Jane Doe</span>
                    <span className="text-xs text-muted-foreground">
                      jane@example.com
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="h-5 w-5 rounded-md" />
              </SidebarMenuButton>
            </SidebarGroup>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 bg-background" style={{ minHeight: '100vh' }}>
          <div className="p-4">
            <SidebarTrigger />
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-text-primary">
              Sidebar Demo Page
            </h1>
            <p className="mt-2 text-text-secondary">
              This page demonstrates the modern dark sidebar layout.
            </p>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 