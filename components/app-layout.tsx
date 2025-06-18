"use client";

import { createContext, useContext, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex h-screen bg-background">
        {/* Sidebar is positioned absolutely or fixed, not in normal flow */}
        <Sidebar />
        
        {/* Main content area with dynamic margin */}
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          isCollapsed ? "md:ml-[70px]" : "md:ml-[270px]",
          "ml-0 md:pt-16" // Add padding top for fixed navbar
        )}>
          <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}