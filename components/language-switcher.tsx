"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Locale = "en" | "zh-TW";

const languages = {
  en: { name: "English", flag: "🇺🇸" },
  "zh-TW": { name: "繁體中文", flag: "🇹🇼" },
};

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  
  const switchLanguage = (locale: Locale) => {
    startTransition(() => {
      // Set cookie for locale
      document.cookie = `locale=${locale}; path=/; max-age=31536000`; // 1 year
      // Reload to apply new locale
      window.location.reload();
    });
  };

  const getCurrentLocale = (): Locale => {
    if (typeof document !== "undefined") {
      const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("locale="));
      return (cookie?.split("=")[1] as Locale) || "en";
    }
    return "en";
  };

  const currentLocale = getCurrentLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          <Globe className="h-4 w-4 mr-2" />
          {languages[currentLocale].flag}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([locale, { name, flag }]) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale as Locale)}
            className={currentLocale === locale ? "bg-accent" : ""}
          >
            <span className="mr-2">{flag}</span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}