"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Search, BookOpen, User } from "lucide-react";

const navigationItems = [
  {
    key: "home",
    href: "/",
    icon: Home,
  },
  {
    key: "discovery", 
    href: "/discovery",
    icon: Search,
  },
  {
    key: "create",
    href: "/create",
    icon: BookOpen,
  },
  {
    key: "profile",
    href: "/profile", 
    icon: User,
  },
];

interface SidebarNavProps {
  className?: string;
  onItemClick?: () => void;
}

export function SidebarNav({ className, onItemClick }: SidebarNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className={cn("space-y-2", className)}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Button
            key={item.key}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              isActive && "bg-secondary"
            )}
            asChild
            onClick={onItemClick}
          >
            <Link href={item.href}>
              <Icon className="mr-2 h-4 w-4" />
              {t(item.key)}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}