"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import { Heart, Eye, MessageCircle, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Unwrap params using React.use()
  const { slug } = use(params);

  const fetchArtbook = useCallback(async () => {
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

  const currentPageData = artbook.pages.find(p => p.pageNumber === currentPage) || artbook.pages[0];

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
            <div>
              <h1 className="text-3xl font-bold mb-2">{artbook.title}</h1>
              {artbook.description && (
                <p className="text-muted-foreground text-lg">{artbook.description}</p>
              )}
            </div>
            <Badge 
              variant="secondary" 
              className={cn("capitalize", categoryColors[artbook.category.toLowerCase() as keyof typeof categoryColors])}
            >
              {artbook.category}
            </Badge>
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
                    <span>{artbook.post?._count.comments || 0}</span>
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

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Page Image */}
          <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
            {currentPageData?.picture ? (
              <Image 
                src={currentPageData.picture} 
                alt={`Page ${currentPage}`}
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-32 bg-gray-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="w-16 h-20 bg-white rounded" />
                  </div>
                  <p className="text-gray-500">No image for this page</p>
                </div>
              </div>
            )}
          </div>

          {/* Page Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Page {currentPage} of {artbook.pages.length}
              </h3>
              <div className="prose prose-lg">
                <p className="text-gray-700 leading-relaxed">
                  {currentPageData?.content || "No content available for this page."}
                </p>
              </div>
            </div>

            {/* Audio Player */}
            {currentPageData?.audio && (
              <div>
                <h4 className="font-medium mb-2">Audio</h4>
                <audio controls className="w-full">
                  <source src={currentPageData.audio} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Page Navigation */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous Page
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {currentPage} / {artbook.pages.length}
              </span>
              
              <Button
                variant="outline"
                disabled={currentPage === artbook.pages.length}
                onClick={() => setCurrentPage(prev => Math.min(artbook.pages.length, prev + 1))}
              >
                Next Page
              </Button>
            </div>
          </div>
        </div>

        {/* Page Thumbnails */}
        {artbook.pages.length > 1 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">All Pages</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {artbook.pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page.pageNumber)}
                  className={cn(
                    "aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 transition-colors",
                    currentPage === page.pageNumber 
                      ? "border-primary" 
                      : "border-transparent hover:border-gray-300"
                  )}
                >
                  {page.picture ? (
                    <Image 
                      src={page.picture} 
                      alt={`Page ${page.pageNumber}`}
                      width={200}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-10 bg-gray-400 rounded mx-auto mb-1">
                          <div className="w-6 h-8 bg-white rounded mx-auto pt-1" />
                        </div>
                        <p className="text-xs text-gray-500">{page.pageNumber}</p>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}