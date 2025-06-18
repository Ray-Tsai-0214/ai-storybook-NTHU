"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Eye, Heart, BookOpen, Plus } from "lucide-react";
import Link from "next/link";

export default function Home() {
	const t = useTranslations("nav");

	// 示例數據
	const recentArtbooks = [
		{
			id: 1,
			title: "The Magical Forest Adventure",
			cover: "/api/placeholder/200/250",
			views: 234,
			likes: 45,
			date: "2 days ago"
		},
		{
			id: 2,
			title: "Space Explorer's Journey",
			cover: "/api/placeholder/200/250",
			views: 189,
			likes: 32,
			date: "5 days ago"
		},
		{
			id: 3,
			title: "Ocean Mysteries",
			cover: "/api/placeholder/200/250",
			views: 156,
			likes: 28,
			date: "1 week ago"
		},
		{
			id: 4,
			title: "Dragon's Tale",
			cover: "/api/placeholder/200/250",
			views: 142,
			likes: 25,
			date: "2 weeks ago"
		}
	];

	return (
		<div className="max-w-7xl mx-auto space-y-8">
			{/* Header Section */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-4xl font-bold tracking-tight text-white">
						Welcome Back!
					</h1>
					<p className="text-muted-foreground mt-2 text-lg">
						Continue creating amazing AI-powered stories
					</p>
				</div>
				<Link href="/create">
					<Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 h-auto">
						<Plus className="mr-2 h-5 w-5" />
						Create New Artbook
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Artbooks</p>
								<p className="text-3xl font-bold text-primary mt-1">12</p>
							</div>
							<BookOpen className="h-8 w-8 text-primary/20" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Views</p>
								<p className="text-3xl font-bold text-primary mt-1">1,234</p>
							</div>
							<Eye className="h-8 w-8 text-primary/20" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Likes</p>
								<p className="text-3xl font-bold text-primary mt-1">89</p>
							</div>
							<Heart className="h-8 w-8 text-primary/20" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Growth</p>
								<p className="text-3xl font-bold text-green-500 mt-1">+23%</p>
							</div>
							<TrendingUp className="h-8 w-8 text-green-500/20" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Artbooks Section */}
			<div>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-semibold text-white">Your Recent Artbooks</h2>
					<Link href="/profile">
						<Button variant="ghost" className="text-primary hover:text-primary/80">
							View All
						</Button>
					</Link>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{recentArtbooks.map((book) => (
						<Card key={book.id} className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group">
							<CardContent className="p-0">
								<div className="relative aspect-[4/5] bg-muted rounded-t-lg overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
										<p className="font-semibold">{book.title}</p>
									</div>
								</div>
								<div className="p-4">
									<h3 className="font-semibold text-white line-clamp-1">{book.title}</h3>
									<div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
										<div className="flex items-center gap-3">
											<span className="flex items-center gap-1">
												<Eye className="h-3.5 w-3.5" />
												{book.views}
											</span>
											<span className="flex items-center gap-1">
												<Heart className="h-3.5 w-3.5" />
												{book.likes}
											</span>
										</div>
										<span>{book.date}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}