"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import { Heart, Eye, MessageCircle, Calendar, ArrowLeft, Flag, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentSection } from "@/components/artbook/comments/comment-section";
import { ReadingDialog } from "@/components/artbook/reading-dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ArtbookDetails {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category: string;
  coverPhoto?: string;
  author: {
    id: string;
    name?: string;
    image?: string;
  };
  pages: Array<{
    id: string;
    pageNumber: number;
    content: string;
    picture?: string;
    audio?: string;
  }>;
  post?: {
    views: number;
    _count: {
      likes: number;
      comments: number;
    };
  };
  createdAt: string;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const categoryColors = {
  adventure: "bg-green-100 text-green-800",
  horror: "bg-red-100 text-red-800", 
  action: "bg-orange-100 text-orange-800",
  romantic: "bg-pink-100 text-pink-800",
  figure: "bg-blue-100 text-blue-800",
};

export default function ArtbookDetail({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [artbook, setArtbook] = useState<ArtbookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  
  // Unwrap params using React.use()
  const { slug } = use(params);

  const fetchArtbook = useCallback(async () => {
    if (!slug) return;
    
    try {
      const response = await fetch(`/api/artbooks/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Artbook not found");
          router.push("/discovery");
          return;
        }
        throw new Error("Failed to fetch artbook");
      }
      
      const data = await response.json();
      setArtbook(data.artbook);
      setLikeCount(data.artbook.post?._count.likes || 0);
      setCommentCount(data.artbook.post?._count.comments || 0);
      
      // Check if user liked this artbook
      if (user && data.artbook.post) {
        const likeResponse = await fetch(`/api/artbooks/${slug}/like`);
        if (likeResponse.ok) {
          const likeData = await likeResponse.json();
          setIsLiked(likeData.userLiked);
        }
      }
    } catch (error) {
      console.error("Error fetching artbook:", error);
      toast.error("Failed to load artbook");
    } finally {
      setLoading(false);
    }
  }, [slug, user, router]);

  useEffect(() => {
    fetchArtbook();
  }, [fetchArtbook]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like artbooks");
      return;
    }

    try {
      const response = await fetch(`/api/artbooks/${slug}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();
      setIsLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleReadNow = () => {
    router.push(`/artbook/read?slug=${slug}`);
  };

  const handleReport = async () => {
    if (!user) {
      toast.error("Please sign in to report content");
      return;
    }
    
    // TODO: Implement report functionality
    toast.success("Report submitted. Thank you for helping keep our community safe.");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!artbook) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Artbook not found</h2>
          <Button onClick={() => router.push("/discovery")}>
            Back to Discovery
          </Button>
        </div>
      </div>
    );
  }

  // Get cover image - use first page's image or fallback
  const coverImage = artbook.coverPhoto || artbook.pages[0]?.picture;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{artbook.title}</h1>
              {artbook.description && (
                <p className="text-muted-foreground text-lg mb-4">{artbook.description}</p>
              )}
              
              {/* Read Now Button */}
              <Button 
                onClick={handleReadNow}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 text-lg font-semibold"
                size="lg"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Read Now
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className={cn("capitalize", categoryColors[artbook.category.toLowerCase() as keyof typeof categoryColors])}
              >
                {artbook.category}
              </Badge>
              
              {/* Report Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReport}
                className="text-muted-foreground hover:text-red-500"
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Author and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={artbook.author.image || ""} alt={artbook.author.name || ""} />
                <AvatarFallback>
                  {artbook.author.name ? artbook.author.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{artbook.author.name || "Anonymous"}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{artbook.post?.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{commentCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(artbook.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={handleLike}
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                )} 
              />
              <span className={cn(isLiked ? "text-red-500" : "text-muted-foreground")}>
                {likeCount}
              </span>
            </Button>
          </div>
        </div>

        {/* Cover Image */}
        <div className="mb-12">
          <div className="max-w-md mx-auto">
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-lg">
              {coverImage ? (
                <Image 
                  src={coverImage} 
                  alt={artbook.title}
                  width={400}
                  height={533}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-32 bg-gray-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="w-16 h-20 bg-white rounded" />
                    </div>
                    <p className="text-gray-500">No cover image</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Read Book Button */}
            <div className="mt-6 text-center">
              <ReadingDialog
                artbook={{
                  id: artbook.id,
                  title: artbook.title,
                  pages: artbook.pages
                }}
                initialPage={1}
                onPageChange={(pageNumber: number) => {
                  console.log(`Reading page ${pageNumber}`);
                }}
              >
                <Button 
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Read Book
                </Button>
              </ReadingDialog>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="mt-12 md:mt-16">
          <Separator className="mb-6 md:mb-8" />
          <CommentSection 
            artbookSlug={slug}
            className="max-w-4xl mx-auto"
            onCommentCountChange={setCommentCount}
          />
        </div>
      </div>
    </div>
  );
}