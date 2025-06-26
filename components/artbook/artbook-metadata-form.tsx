"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ArtbookData {
  title: string;
  description: string;
  category: string;
  coverPhoto: string;
}

interface ArtbookMetadataFormProps {
  artbookData: ArtbookData;
  onDataChange: (data: Partial<ArtbookData>) => void;
}

export function ArtbookMetadataForm({ artbookData, onDataChange }: ArtbookMetadataFormProps) {
  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
        Artbook Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={artbookData.title}
            onChange={(e) => onDataChange({ title: e.target.value })}
            placeholder="Enter artbook title"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select 
            value={artbookData.category} 
            onValueChange={(value) => onDataChange({ category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adventure">Adventure</SelectItem>
              <SelectItem value="horror">Horror</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="romantic">Romantic</SelectItem>
              <SelectItem value="figure">Figure</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={artbookData.description}
            onChange={(e) => onDataChange({ description: e.target.value })}
            placeholder="Enter artbook description (optional)"
          />
        </div>
      </div>
    </div>
  );
}