"use client";

import { useState } from "react";
import { Menu, ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/sidebar-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/app-layout";

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const t = useTranslations("auth");
  const navT = useTranslations("nav");
  const pathname = usePathname();
  
  // Get current page title based on route
  const getPageTitle = () => {
    if (pathname === "/") return navT("home");
    if (pathname === "/discovery") return navT("discovery");
    if (pathname === "/create") return navT("create");
    if (pathname === "/profile") return navT("profile");
    return navT("home");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex h-screen flex-col bg-sidebar transition-all duration-300 relative fixed left-0 top-0 z-40",
        isCollapsed ? "w-[70px]" : "w-[270px]"
      )}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[60px] w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors z-50"
        >
          <ChevronLeft className={cn(
            "w-4 h-4 transition-transform",
            isCollapsed && "rotate-180"
          )} />
        </button>

        <div className={cn(
          "flex h-20 items-center",
          isCollapsed ? "px-5 justify-center" : "px-8"
        )}>
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-6 flex-shrink-0">
              <div className="absolute inset-0 bg-primary" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />
            </div>
            {!isCollapsed && (
              <h2 className="text-2xl font-extrabold text-[#15171C]" style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.05em' }}>
                Storyr
              </h2>
            )}
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className={cn(
          "py-6",
          isCollapsed ? "px-2.5" : "px-8"
        )}>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "gap-3"
          )}>
            <Avatar className="h-[50px] w-[50px] flex-shrink-0">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Shelly" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <span className="text-base font-normal text-[#15171C]" style={{ fontFamily: 'Syne, sans-serif' }}>
                Shelly
              </span>
            )}
          </div>
        </div>
        
        <div className={cn(
          "flex-1 overflow-auto",
          isCollapsed ? "px-2.5" : "px-8"
        )}>
          <SidebarNav isCollapsed={isCollapsed} />
        </div>
        
        {/* Categories Dropdown */}
        {!isCollapsed && (
          <div className="px-8 py-4">
            <div className="bg-white border-2 border-black rounded-[20px] p-4" 
                 style={{ boxShadow: '10px 10px 0px #FF6900' }}>
              <div className="flex items-center justify-between">
                <span className="text-base font-normal text-[#1E2939]" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Categories
                </span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="transform rotate-180">
                  <path d="M6 10.5L9 7.5L12 10.5" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {/* Logout button at bottom */}
        <div className={cn(
          isCollapsed ? "p-2.5" : "p-8"
        )}>
          <Button 
            className={cn(
              "w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-[52px] font-normal text-base",
              isCollapsed && "px-2"
            )} 
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {isCollapsed ? "↩" : "Logout"}
          </Button>
        </div>
      </aside>

      {/* Mobile Navbar */}
      <div className="md:hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[270px] bg-sidebar p-0">
              <div className="flex h-20 items-center px-8">
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-6">
                    <div className="absolute inset-0 bg-primary" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#15171C]" style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.05em' }}>Storyr</h2>
                </div>
              </div>
              
              {/* User Profile Section */}
              <div className="px-8 py-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-[50px] w-[50px]">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Shelly" />
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                  <span className="text-base font-normal text-[#15171C]" style={{ fontFamily: 'Syne, sans-serif' }}>Shelly</span>
                </div>
              </div>
              
              <div className="px-8">
                <SidebarNav onItemClick={() => setOpen(false)} />
              </div>
              
              {/* Categories Dropdown */}
              <div className="px-8 py-4">
                <div className="bg-white border-2 border-black rounded-[20px] p-4" 
                     style={{ boxShadow: '10px 10px 0px #FF6900' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-normal text-[#1E2939]" style={{ fontFamily: 'Syne, sans-serif' }}>Categories</span>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="transform rotate-180">
                      <path d="M6 10.5L9 7.5L12 10.5" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Logout button at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-[52px] font-normal text-base" style={{ fontFamily: 'Syne, sans-serif' }} onClick={() => setOpen(false)}>
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1" />
          
          <LanguageSwitcher />
          
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </header>
      </div>

      {/* Desktop Navbar */}
      <div className="hidden md:block fixed top-0 right-0 z-30" style={{ 
        left: isCollapsed ? '70px' : '270px',
        transition: 'left 300ms'
      }}>
        <header className="flex h-16 items-center gap-4 bg-background px-8 border-b">
          <h1 className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>{getPageTitle()}</h1>
          
          <div className="flex-1" />
          
          <LanguageSwitcher />
          
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </header>
      </div>
    </>
  );
}