"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FiltersBar } from "@/components/discovery/filters-bar";
import { ArtbookCard } from "@/components/discovery/artbook-card";
import { useAuth } from "@/lib/stores/auth-store";
import { toast } from "sonner";

interface Artbook {
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
  post?: {
    views: number;
    _count: {
      likes: number;
      comments: number;
    };
  };
  createdAt: string;
}

export default function Discovery() {
  const router = useRouter();
  const { user } = useAuth();
  const [artbooks, setArtbooks] = useState<Artbook[]>([]);
  const [filteredArtbooks, setFilteredArtbooks] = useState<Artbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Fetch artbooks
  useEffect(() => {
    fetchArtbooks();
  }, []);

  // Filter and sort artbooks
  useEffect(() => {
    let filtered = artbooks;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(book => 
        book.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return (b.post?._count.likes || 0) - (a.post?._count.likes || 0);
        case "views":
          return (b.post?.views || 0) - (a.post?.views || 0);
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredArtbooks(filtered);
  }, [artbooks, searchQuery, selectedCategory, sortBy]);

  const fetchArtbooks = async () => {
    try {
      const response = await fetch("/api/artbooks");
      if (!response.ok) {
        throw new Error("Failed to fetch artbooks");
      }
      const data = await response.json();
      setArtbooks(data.artbooks || []);
    } catch (error) {
      console.error("Error fetching artbooks:", error);
      toast.error("Failed to load artbooks");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (artbookId: string) => {
    if (!user) {
      toast.error("Please sign in to like artbooks");
      return;
    }

    try {
      const response = await fetch(`/api/artbooks/${artbookId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      // Refresh data to get updated like counts
      await fetchArtbooks();
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleArtbookClick = (artbookId: string) => {
    router.push(`/artbook/${artbookId}`);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Artbooks</h1>
          <p className="text-muted-foreground">
            Explore amazing stories created by our community
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search artbooks, authors, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <FiltersBar
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          onCategoryChange={setSelectedCategory}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
        />

        {/* Results */}
        {filteredArtbooks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {searchQuery || selectedCategory !== "all" 
                ? "No artbooks match your search criteria." 
                : "No artbooks found. Be the first to create one!"
              }
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <button 
                onClick={handleClearFilters}
                className="text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredArtbooks.length} of {artbooks.length} artbooks
              </p>
            </div>

            {/* Artbooks grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtbooks.map((artbook) => (
                <ArtbookCard
                  key={artbook.id}
                  id={artbook.id}
                  title={artbook.title}
                  description={artbook.description}
                  category={artbook.category}
                  coverPhoto={artbook.coverPhoto}
                  author={artbook.author}
                  stats={{
                    likes: artbook.post?._count.likes || 0,
                    views: artbook.post?.views || 0,
                    comments: artbook.post?._count.comments || 0,
                  }}
                  createdAt={artbook.createdAt}
                  onLike={handleLike}
                  onClick={handleArtbookClick}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}