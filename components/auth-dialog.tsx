"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

interface AuthDialogProps {
  children: React.ReactNode;
  mode: "login" | "signup";
  onOpenChange?: (open: boolean) => void;
}

export function AuthDialog({ children, mode, onOpenChange }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("auth");
  
  const isLogin = mode === "login";
  const title = isLogin ? t("login") : t("signup");

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for auth logic
    console.log(`${mode} form submitted`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isLogin 
              ? t("loginDescription")
              : t("signupDescription")
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("enterEmail")}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("enterPassword")}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                required
              />
            </div>
          )}
          
          <Button type="submit" className="w-full">
            {title}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                {t("noAccount")}{" "}
                <Button variant="link" size="sm" className="p-0 h-auto">
                  {t("signup")}
                </Button>
              </>
            ) : (
              <>
                {t("hasAccount")}{" "}
                <Button variant="link" size="sm" className="p-0 h-auto">
                  {t("login")}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}