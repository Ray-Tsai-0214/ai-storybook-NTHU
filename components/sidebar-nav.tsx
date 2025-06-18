"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Compass, BookOpen, User } from "lucide-react";

const navigationItems = [
  {
    key: "home",
    href: "/",
    icon: Home,
  },
  {
    key: "discovery", 
    href: "/discovery",
    icon: BookOpen,
  },
  {
    key: "create",
    href: "/create",
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 10H16M8 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 3V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

interface SidebarNavProps {
  className?: string;
  onItemClick?: () => void;
  isCollapsed?: boolean;
}

export function SidebarNav({ className, onItemClick, isCollapsed = false }: SidebarNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className={cn("space-y-4", className)}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <div key={item.key} className="relative">
            {isActive && !isCollapsed && (
              <>
                <div className="absolute -left-8 right-0 h-full bg-gradient-to-r from-transparent to-primary/6" />
                <div className="absolute -right-8 top-0 bottom-0 w-2 bg-primary rounded-l-[3px]" />
              </>
            )}
            <Button
              variant="ghost"
              className={cn(
                "w-full hover:bg-transparent px-0 h-auto py-0 font-normal text-base",
                "text-[#15171C]",
                isCollapsed ? "justify-center py-3" : "justify-start"
              )}
              style={{ fontFamily: 'Syne, sans-serif' }}
              asChild
              onClick={onItemClick}
              title={isCollapsed ? t(item.key) : undefined}
            >
              <Link href={item.href} className={cn(
                "flex items-center",
                isCollapsed ? "justify-center" : "gap-4"
              )}>
                {typeof Icon === 'function' && item.key !== 'create' ? (
                  <Icon className={cn(
                    "h-6 w-6 flex-shrink-0",
                    isActive ? "text-primary" : "text-[#15171C]"
                  )} />
                ) : item.key === 'create' ? (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="flex-shrink-0">
                    <path d="M1.41667 1.39404H20.5833V20.5607H1.41667V1.39404Z" fill={isActive ? "#FF6900" : "#FF6900"} />
                  </svg>
                ) : (
                  <Icon />
                )}
                {!isCollapsed && <span>{t(item.key)}</span>}
              </Link>
            </Button>
          </div>
        );
      })}
    </nav>
  );
}