"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FiltersBarProps {
  selectedCategory: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sortBy: string) => void;
  onClearFilters: () => void;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "adventure", label: "Adventure" },
  { value: "horror", label: "Horror" },
  { value: "action", label: "Action" },
  { value: "romantic", label: "Romantic" },
  { value: "figure", label: "Figure" },
];

const sortOptions = [
  { value: "date", label: "Latest" },
  { value: "likes", label: "Most Liked" },
  { value: "views", label: "Most Viewed" },
];

export function FiltersBar({ 
  selectedCategory, 
  sortBy, 
  onCategoryChange, 
  onSortChange, 
  onClearFilters 
}: FiltersBarProps) {
  const hasActiveFilters = selectedCategory !== "all";

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Category:</span>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter Badge */}
        {hasActiveFilters && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {categories.find(c => c.value === selectedCategory)?.label}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={onClearFilters}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}