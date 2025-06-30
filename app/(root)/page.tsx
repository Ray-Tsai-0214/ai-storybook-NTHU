"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, Eye, Heart, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import { ArtbookManagementCard } from "@/components/artbook/artbook-management-card";

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

interface UserStats {
  totalArtbooks: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}


export default function Home() {
  const { user } = useAuth();
  const [userArtbooks, setUserArtbooks] = useState<UserArtbook[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalArtbooks: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      // Fetch user's artbooks
      const response = await fetch(`/api/artbooks?authorId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserArtbooks(data.artbooks);
        
        // Calculate stats
        const stats = data.artbooks.reduce((acc: UserStats, artbook: UserArtbook) => {
          acc.totalArtbooks += 1;
          acc.totalViews += artbook.post?.views || 0;
          acc.totalLikes += artbook.post?._count.likes || 0;
          acc.totalComments += artbook.post?._count.comments || 0;
          return acc;
        }, { totalArtbooks: 0, totalViews: 0, totalLikes: 0, totalComments: 0 });
        
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your artbooks');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user, fetchUserData]);

  const handleArtbookUpdate = (updatedArtbook: Partial<UserArtbook> & { id: string }) => {
    setUserArtbooks(prev => prev.map(artbook => 
      artbook.id === updatedArtbook.id ? { ...artbook, ...updatedArtbook } : artbook
    ));
  };

  const handleArtbookDelete = (deletedArtbookId: string) => {
    setUserArtbooks(prev => prev.filter(artbook => artbook.id !== deletedArtbookId));
    
    // Update stats
    setUserStats(prev => ({
      ...prev,
      totalArtbooks: prev.totalArtbooks - 1,
    }));
  };

  // Removed unused formatDate function

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Welcome to AI Artbook</h2>
          <p className="text-muted-foreground">Please sign in to view your dashboard and create amazing stories.</p>
          <Link href="/auth/login">
            <Button className="mt-4">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

	return (
		<div className="max-w-7xl mx-auto space-y-8">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Avatar className="h-16 w-16">
							<AvatarImage src={user.image || ""} alt={user.name || ""} />
							<AvatarFallback className="text-xl font-semibold">
								{user.name ? user.name.charAt(0).toUpperCase() : "U"}
							</AvatarFallback>
						</Avatar>
						<div>
							<h1 className="text-3xl font-bold text-foreground">
								Welcome back, {user.name || "Creator"}!
							</h1>
							<p className="text-muted-foreground mt-1 text-lg">
								Continue creating amazing AI-powered stories
							</p>
						</div>
					</div>
					<Link href="/create">
						<Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 h-auto text-lg">
							<Plus className="mr-2 h-5 w-5" />
							Create New Artbook
						</Button>
					</Link>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="bg-card border-border hover:border-primary/50 transition-all">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Artbooks</p>
								<p className="text-3xl font-bold text-primary mt-1">
									{loading ? "..." : userStats.totalArtbooks}
								</p>
							</div>
							<BookOpen className="h-8 w-8 text-primary/20" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card border-border hover:border-primary/50 transition-all">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Views</p>
								<p className="text-3xl font-bold text-primary mt-1">
									{loading ? "..." : userStats.totalViews.toLocaleString()}
								</p>
							</div>
							<Eye className="h-8 w-8 text-primary/20" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card border-border hover:border-primary/50 transition-all">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Likes</p>
								<p className="text-3xl font-bold text-primary mt-1">
									{loading ? "..." : userStats.totalLikes}
								</p>
							</div>
							<Heart className="h-8 w-8 text-primary/20" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card border-border hover:border-primary/50 transition-all">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Comments</p>
								<p className="text-3xl font-bold text-primary mt-1">
									{loading ? "..." : userStats.totalComments}
								</p>
							</div>
							<TrendingUp className="h-8 w-8 text-primary/20" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Artbooks Section */}
			<div>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-semibold">Your Recent Artbooks</h2>
					<Link href="/discovery">
						<Button variant="ghost" className="text-primary hover:text-primary/80">
							View All
						</Button>
					</Link>
				</div>

				{loading ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{[...Array(4)].map((_, i) => (
							<Card key={i} className="bg-card border-border">
								<CardContent className="p-0">
									<div className="aspect-[4/5] bg-muted rounded-t-lg animate-pulse" />
									<div className="p-4">
										<div className="h-4 bg-muted rounded animate-pulse mb-2" />
										<div className="h-3 bg-muted rounded animate-pulse w-3/4" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : userArtbooks.length === 0 ? (
					<div className="text-center py-12">
						<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No artbooks yet</h3>
						<p className="text-muted-foreground mb-6">Start creating your first AI-powered artbook!</p>
						<Link href="/create">
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Create Your First Artbook
							</Button>
						</Link>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{userArtbooks.slice(0, 8).map((artbook) => (
							<ArtbookManagementCard
								key={artbook.id}
								artbook={artbook}
								onUpdate={handleArtbookUpdate}
								onDelete={handleArtbookDelete}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}