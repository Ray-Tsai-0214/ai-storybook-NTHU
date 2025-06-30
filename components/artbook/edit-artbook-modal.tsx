"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface EditArtbookModalProps {
  artbook: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    category: string;
    coverPhoto?: string;
    isPublic: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedArtbook: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    category: string;
    coverPhoto?: string;
    isPublic: boolean;
    createdAt: string;
  }) => void;
}

const CATEGORIES = [
  { value: "ADVENTURE", label: "Adventure" },
  { value: "HORROR", label: "Horror" },
  { value: "ACTION", label: "Action" },
  { value: "ROMANTIC", label: "Romantic" },
  { value: "FIGURE", label: "Figure" },
];

export function EditArtbookModal({
  artbook,
  open,
  onOpenChange,
  onSuccess,
}: EditArtbookModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: artbook.title,
    description: artbook.description || "",
    category: artbook.category,
    coverPhoto: artbook.coverPhoto || "",
    isPublic: artbook.isPublic,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/artbooks/${artbook.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update artbook");
      }

      toast.success("Artbook updated successfully!");
      onSuccess(data.artbook);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating artbook:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update artbook");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Artbook</DialogTitle>
          <DialogDescription>
            Update your artbook details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter artbook title"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of your artbook"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverPhoto">Cover Photo URL</Label>
            <Input
              id="coverPhoto"
              value={formData.coverPhoto}
              onChange={(e) => handleInputChange("coverPhoto", e.target.value)}
              placeholder="Enter cover photo URL (optional)"
              type="url"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
            />
            <Label htmlFor="isPublic">Make artbook public</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}