"use client";

import { useRef, useState } from "react";
import { Camera, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfilePictureUploadProps {
  currentImage?: string;
  userName?: string;
  onImageChange: (base64Image: string) => void;
  onError?: (error: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  disabled?: boolean;
}

const sizeMap = {
  sm: "h-12 w-12",
  md: "h-16 w-16", 
  lg: "h-20 w-20",
  xl: "h-24 w-24",
};

const buttonSizeMap = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-8 w-8", 
  xl: "h-9 w-9",
};

export function ProfilePictureUpload({
  currentImage,
  userName = "",
  onImageChange,
  onError,
  size = "lg",
  className,
  disabled = false,
}: ProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB");
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error("Please select a valid image file");
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        onImageChange(base64String);
        setIsUploading(false);
      };
      reader.onerror = () => {
        const error = "Failed to load image";
        onError?.(error);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      onError?.((error as Error).message);
      setIsUploading(false);
    }

    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleRemoveImage = () => {
    onImageChange("");
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const fallbackText = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(sizeMap[size], "cursor-pointer")} onClick={handleClick}>
        <AvatarImage src={currentImage} alt={userName} />
        <AvatarFallback className="text-lg">
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          ) : (
            fallbackText
          )}
        </AvatarFallback>
      </Avatar>

      {/* Upload button */}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "absolute -bottom-1 -right-1 rounded-full p-0 shadow-sm",
          buttonSizeMap[size]
        )}
        onClick={handleClick}
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
        ) : (
          <Camera className="h-3 w-3" />
        )}
      </Button>

      {/* Remove button (only show if there's an image) */}
      {currentImage && !isUploading && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className={cn(
            "absolute -top-1 -right-1 rounded-full p-0 shadow-sm",
            buttonSizeMap[size]
          )}
          onClick={handleRemoveImage}
          disabled={disabled}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

// Alternative drag-and-drop version
interface ProfilePictureDropzoneProps extends ProfilePictureUploadProps {
  showUploadText?: boolean;
}

export function ProfilePictureDropzone({
  currentImage,
  userName = "",
  onImageChange,
  onError,
  className,
  disabled = false,
  showUploadText = true,
}: ProfilePictureDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileProcessing = async (file: File) => {
    setIsUploading(true);

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB");
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error("Please select a valid image file");
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        onImageChange(base64String);
        setIsUploading(false);
      };
      reader.onerror = () => {
        const error = "Failed to load image";
        onError?.(error);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      onError?.((error as Error).message);
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileProcessing(file);
    }
    // Clear the input value
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      await handleFileProcessing(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const fallbackText = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
        isDragOver && !disabled 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <Avatar className="h-20 w-20 mb-4">
        <AvatarImage src={currentImage} alt={userName} />
        <AvatarFallback className="text-lg">
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          ) : (
            fallbackText
          )}
        </AvatarFallback>
      </Avatar>

      {showUploadText && (
        <div className="text-center">
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Upload profile picture"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Drag and drop or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or GIF. Max size 5MB.
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}