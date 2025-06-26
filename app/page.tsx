"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye, Heart, BookOpen, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserArtbook {
  id: string;
  title: string;
  description?: string;
  category: string;
  coverPhoto?: string;
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

const categoryColors = {
  adventure: "bg-green-100 text-green-800",
  horror: "bg-red-100 text-red-800", 
  action: "bg-orange-100 text-orange-800",
  romantic: "bg-pink-100 text-pink-800",
  figure: "bg-blue-100 text-blue-800",
};

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

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
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
  };

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

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Welcome to AI Artbook</h2>
          <p className="text-muted-foreground">Please sign in to view your dashboard and create amazing stories.</p>
          <Link href="/login">
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
							<Link key={artbook.id} href={`/artbook/${artbook.id}`}>
								<Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group h-full">
									<CardContent className="p-0">
										<div className="relative aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
											{artbook.coverPhoto ? (
												<img 
													src={artbook.coverPhoto} 
													alt={artbook.title}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<div className="text-center">
														<BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
														<p className="text-sm text-gray-500">No cover</p>
													</div>
												</div>
											)}
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
											<div className="absolute top-2 right-2">
												<Badge 
													variant="secondary" 
													className={cn("capitalize", categoryColors[artbook.category.toLowerCase() as keyof typeof categoryColors])}
												>
													{artbook.category}
												</Badge>
											</div>
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
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}