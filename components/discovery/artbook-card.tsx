"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Eye, MessageCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArtbookCardProps {
  id: string;
  title: string;
  description?: string;
  category: string;
  coverPhoto?: string;
  author: {
    id: string;
    name?: string;
    image?: string;
  };
  stats: {
    likes: number;
    views: number;
    comments: number;
  };
  createdAt: string;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onClick?: (id: string) => void;
}

const categoryColors = {
  adventure: "bg-green-100 text-green-800",
  horror: "bg-red-100 text-red-800", 
  action: "bg-orange-100 text-orange-800",
  romantic: "bg-pink-100 text-pink-800",
  figure: "bg-blue-100 text-blue-800",
};

export function ArtbookCard({
  id,
  title,
  description,
  category,
  coverPhoto,
  author,
  stats,
  createdAt,
  isLiked = false,
  onLike,
  onClick,
}: ArtbookCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(stats.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    onLike?.(id);
  };

  const handleClick = () => {
    onClick?.(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
        {coverPhoto ? (
          <img 
            src={coverPhoto} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-20 bg-gray-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <div className="w-10 h-12 bg-white rounded" />
              </div>
              <p className="text-sm text-gray-500">No Cover</p>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <Badge 
            variant="secondary" 
            className={cn("ml-2 capitalize", categoryColors[category as keyof typeof categoryColors])}
          >
            {category}
          </Badge>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={author.image || ""} alt={author.name || ""} />
            <AvatarFallback className="text-xs">
              {author.name ? author.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground truncate">
            {author.name || "Anonymous"}
          </span>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{stats.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{stats.comments}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 hover:bg-transparent"
            onClick={handleLike}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors",
                liked ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
              )} 
            />
            <span className={cn("text-sm", liked ? "text-red-500" : "text-muted-foreground")}>
              {likeCount}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}