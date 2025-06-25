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
import { Separator } from "@/components/ui/separator";
import { signIn } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";

interface SignInDialogProps {
  children: React.ReactNode;
}

export function SignInDialog({ children }: SignInDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn.email({
        email,
        password,
      });
      setOpen(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   setIsLoading(true);
  //   try {
  //     await signIn.social({
  //       provider: "google",
  //     });
  //   } catch (error) {
  //     console.error("Google sign in error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Sign in to your account to start creating artbooks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Sign In */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              Sign In with Email
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}