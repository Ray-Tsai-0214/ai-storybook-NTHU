"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditArtbookModal } from "@/components/artbook/edit-artbook-modal";
import { 
  BookOpen, 
  Eye, 
  Heart, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2,
  ExternalLink 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface UserArtbook {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category: string;
  coverPhoto?: string;
  isPublic: boolean;
  createdAt: string;
  post?: {
    views: number;
    _count: {
      likes: number;
      comments: number;
    };
  };
  _count: {
    pages: number;
  };
}

interface ArtbookManagementCardProps {
  artbook: UserArtbook;
  onUpdate: (updatedArtbook: Partial<UserArtbook> & { id: string }) => void;
  onDelete: (artbookId: string) => void;
}

const categoryColors = {
  adventure: "bg-green-100 text-green-800",
  horror: "bg-red-100 text-red-800", 
  action: "bg-orange-100 text-orange-800",
  romantic: "bg-pink-100 text-pink-800",
  figure: "bg-blue-100 text-blue-800",
};

export function ArtbookManagementCard({
  artbook,
  onUpdate,
  onDelete,
}: ArtbookManagementCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/artbooks/${artbook.slug}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete artbook");
      }

      toast.success("Artbook deleted successfully!");
      onDelete(artbook.id);
    } catch (error) {
      console.error("Error deleting artbook:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete artbook");
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditSuccess = (updatedArtbook: Partial<UserArtbook> & { id: string }) => {
    onUpdate(updatedArtbook);
  };

  return (
    <>
      <Card className="bg-card border-border hover:border-primary/50 transition-all group h-full">
        <CardContent className="p-0">
          <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
            {artbook.coverPhoto ? (
              <Image 
                src={artbook.coverPhoto} 
                alt={artbook.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No cover</p>
                </div>
              </div>
            )}
            
            {/* Overlay with management buttons */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Category badge */}
            <div className="absolute top-2 left-2">
              <Badge 
                variant="secondary" 
                className={cn("capitalize", categoryColors[artbook.category.toLowerCase() as keyof typeof categoryColors])}
              >
                {artbook.category}
              </Badge>
            </div>

            {/* Management buttons */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/artbook/${artbook.slug}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Privacy indicator */}
            {!artbook.isPublic && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="outline" className="bg-white/90 text-gray-700">
                  Private
                </Badge>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold line-clamp-1 mb-1">{artbook.title}</h3>
            {artbook.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{artbook.description}</p>
            )}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {artbook.post?.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {artbook.post?._count.likes || 0}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(artbook.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditArtbookModal
        artbook={artbook}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your artbook
              &quot;{artbook.title}&quot; and remove all associated data including pages, comments, and likes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}