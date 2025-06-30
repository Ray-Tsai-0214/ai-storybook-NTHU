"use client";

import { useState } from "react";
import { AlertTriangle, Send, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

// Report category types
export type ReportCategory = 
  | "inappropriate-content"
  | "copyright-violation"
  | "spam-misleading"
  | "harassment-bullying"
  | "violence-gore"
  | "adult-content"
  | "other";

// Report data interface
export interface ReportData {
  artbookId: string;
  category: ReportCategory;
  description: string;
}

// Report form validation errors
interface ReportFormErrors {
  category?: string;
  description?: string;
  general?: string;
}

// Report categories with labels and descriptions
const REPORT_CATEGORIES = [
  {
    value: "inappropriate-content" as ReportCategory,
    label: "Inappropriate Content",
    description: "Content that violates community guidelines",
  },
  {
    value: "copyright-violation" as ReportCategory,
    label: "Copyright Violation",
    description: "Unauthorized use of copyrighted material",
  },
  {
    value: "spam-misleading" as ReportCategory,
    label: "Spam/Misleading",
    description: "Spam, scam, or misleading information",
  },
  {
    value: "harassment-bullying" as ReportCategory,
    label: "Harassment/Bullying",
    description: "Bullying, harassment, or threats",
  },
  {
    value: "violence-gore" as ReportCategory,
    label: "Violence/Gore",
    description: "Graphic violence or disturbing content",
  },
  {
    value: "adult-content" as ReportCategory,
    label: "Adult Content",
    description: "Sexual or adult content inappropriate for children",
  },
  {
    value: "other" as ReportCategory,
    label: "Other",
    description: "Other policy violations or concerns",
  },
] as const;

interface ReportArtbookDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Function to call when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** ID of the artbook being reported */
  artbookId: string;
  /** Title of the artbook being reported (for display purposes) */
  artbookTitle?: string;
  /** Function to call when report is successfully submitted */
  onSuccess?: (reportData: ReportData) => void;
  /** Function to call when report submission fails */
  onError?: (error: string) => void;
}

export function ReportArtbookDialog({
  open,
  onOpenChange,
  artbookId,
  artbookTitle,
  onSuccess,
  onError,
}: ReportArtbookDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ReportFormErrors>({});

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: ReportFormErrors = {};

    if (!selectedCategory) {
      newErrors.category = "Please select a report category";
    }

    if (!description.trim()) {
      newErrors.description = "Please provide a description of the issue";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    } else if (description.trim().length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // Special validation for "other" category
    if (selectedCategory === "other" && description.trim().length < 20) {
      newErrors.description = "Please provide a detailed description for 'Other' reports (minimum 20 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const reportData: ReportData = {
      artbookId,
      category: selectedCategory as ReportCategory,
      description: description.trim(),
    };

    try {
      // TODO: Replace with actual API call when backend is ready
      const response = await fetch(`/api/artbooks/${artbookId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit report");
      }

      // Success handling
      toast.success("Report submitted successfully", {
        description: "Thank you for helping keep our community safe. We'll review your report promptly.",
      });
      
      onSuccess?.(reportData);
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrors({ general: errorMessage });
      
      toast.error("Failed to submit report", {
        description: errorMessage,
      });
      
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form and close dialog
  const handleClose = () => {
    setSelectedCategory("");
    setDescription("");
    setErrors({});
    setIsSubmitting(false);
    onOpenChange(false);
  };

  // Clear field-specific errors when user starts typing/selecting
  const handleCategoryChange = (value: ReportCategory) => {
    setSelectedCategory(value);
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report Artbook
          </DialogTitle>
          <DialogDescription>
            {artbookTitle ? (
              <>Report &quot;{artbookTitle}&quot; for policy violations or inappropriate content.</>
            ) : (
              "Report this artbook for policy violations or inappropriate content."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Category Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Report Category <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              className="space-y-3"
            >
              {REPORT_CATEGORIES.map((category) => (
                <div key={category.value} className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={category.value}
                    id={category.value}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={category.value}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {category.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            {errors.category && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Additional Details <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder={
                selectedCategory === "other"
                  ? "Please provide a detailed description of the issue..."
                  : "Please describe the specific issue or provide additional context..."
              }
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              disabled={isSubmitting}
              className={cn(
                "min-h-[100px] resize-none",
                errors.description && "border-destructive focus-visible:border-destructive"
              )}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <div>
                {errors.description && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
              </div>
              <p className={cn(
                "text-xs",
                description.length > 450 
                  ? "text-destructive" 
                  : "text-muted-foreground"
              )}>
                {description.length}/500
              </p>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {errors.general}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || !selectedCategory || !description.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Export types for use in other components
export type { ReportFormErrors };
export { REPORT_CATEGORIES };