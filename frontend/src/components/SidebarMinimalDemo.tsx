import React from 'react';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@21st-dev/magic';
import { Home, Settings, User } from 'lucide-react';

const items = [
  { title: 'Home', url: '/home', icon: Home },
  { title: 'Profile', url: '/profile', icon: User },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export default function SidebarMinimalDemo() {
  return (
    <SidebarProvider>
      <Sidebar collapsible>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarFooter>
          <span className="text-xs text-muted-foreground">© 2025 YourApp</span>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
} 