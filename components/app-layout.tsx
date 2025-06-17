"use client";

import { Sidebar } from "@/components/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}