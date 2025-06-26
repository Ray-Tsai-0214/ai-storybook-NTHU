"use client";

import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileInfoForm } from "@/components/profile/profile-info-form";
import { PasswordChangeForm } from "@/components/profile/password-change-form";
import { useAuth } from "@/lib/stores/auth-store";

export default function ProfileSettingsPage() {
  const { user, refreshSession } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSuccess = async (message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");
    await refreshSession();
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage("");
    // Clear error message after 5 seconds
    setTimeout(() => setErrorMessage(""), 5000);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground">You need to be signed in to access profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <ProfileInfoForm 
        user={user} 
        onSuccess={handleSuccess} 
        onError={handleError} 
      />

      {/* Password Change */}
      <PasswordChangeForm 
        onSuccess={handleSuccess} 
        onError={handleError} 
      />
    </div>
  );
}