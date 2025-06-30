"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportArtbookDialog, ReportData } from "./report-artbook";

interface ReportArtbookTriggerProps {
  /** ID of the artbook to report */
  artbookId: string;
  /** Title of the artbook (optional, for display purposes) */
  artbookTitle?: string;
  /** Button variant */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Custom class name */
  className?: string;
  /** Whether to show only icon (for compact display) */
  iconOnly?: boolean;
  /** Custom label text */
  label?: string;
}

export function ReportArtbookTrigger({
  artbookId,
  artbookTitle,
  variant = "ghost",
  size = "sm",
  className,
  iconOnly = false,
  label = "Report",
}: ReportArtbookTriggerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleReportSuccess = (reportData: ReportData) => {
    console.log("Report submitted successfully:", reportData);
    // You can add additional success handling here
    // For example, tracking analytics, updating UI state, etc.
  };

  const handleReportError = (error: string) => {
    console.error("Report submission failed:", error);
    // You can add additional error handling here
    // For example, logging to error tracking service
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsDialogOpen(true)}
        title={`Report ${artbookTitle || "this artbook"}`}
      >
        <Flag className="h-4 w-4" />
        {!iconOnly && <span className="ml-2">{label}</span>}
      </Button>

      <ReportArtbookDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        artbookId={artbookId}
        artbookTitle={artbookTitle}
        onSuccess={handleReportSuccess}
        onError={handleReportError}
      />
    </>
  );
}

// Example usage component (for demonstration)
export function ReportArtbookExample() {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Report Artbook Examples</h3>
      
      {/* Default button */}
      <ReportArtbookTrigger
        artbookId="example-artbook-1"
        artbookTitle="My Fairy Tale Adventure"
      />
      
      {/* Icon only button */}
      <ReportArtbookTrigger
        artbookId="example-artbook-2"
        artbookTitle="Another Story"
        iconOnly
        variant="outline"
        size="icon"
      />
      
      {/* Custom styled button */}
      <ReportArtbookTrigger
        artbookId="example-artbook-3"
        artbookTitle="Custom Example"
        variant="destructive"
        size="default"
        label="Report Content"
        className="text-xs"
      />
    </div>
  );
}