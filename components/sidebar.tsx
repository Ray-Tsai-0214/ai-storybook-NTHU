"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/sidebar-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("auth");

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
        <div className="flex h-14 items-center px-4 border-b">
          <h2 className="text-lg font-semibold">AI Artbook</h2>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <SidebarNav />
        </div>
        
        {/* Auth buttons at bottom */}
        <div className="border-t p-4 space-y-2">
          <Button className="w-full" size="sm">
            {t("signup")}
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            {t("login")}
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
            <SheetContent side="left" className="w-64">
              <div className="flex h-14 items-center border-b mb-4">
                <h2 className="text-lg font-semibold">AI Artbook</h2>
              </div>
              <SidebarNav onItemClick={() => setOpen(false)} />
              
              {/* Auth buttons at bottom for mobile */}
              <div className="border-t pt-4 mt-4 space-y-2">
                <Button className="w-full" size="sm" onClick={() => setOpen(false)}>
                  {t("signup")}
                </Button>
                <Button variant="outline" className="w-full" size="sm" onClick={() => setOpen(false)}>
                  {t("login")}
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
      <div className="hidden md:block">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
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