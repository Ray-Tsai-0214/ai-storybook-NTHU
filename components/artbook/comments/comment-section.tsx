"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/stores/auth-store";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  postId: string;
  parentId?: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  replies?: Comment[];
  _count: {
    replies: number;
    likes: number;
  };
  userLiked?: boolean;
}

interface CommentSectionProps {
  artbookSlug: string;
  className?: string;
  onCommentCountChange?: (count: number) => void;
}

export function CommentSection({ artbookSlug, className, onCommentCountChange }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/artbooks/${artbookSlug}/comments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [artbookSlug]);

  // Submit new comment
  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to comment');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/artbooks/${artbookSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          parentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }

      const data = await response.json();
      
      // Optimistically update the UI
      const newComment: Comment = {
        ...data.comment,
        replies: [],
      };

      if (parentId) {
        // Add reply to parent comment
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === parentId 
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), newComment],
                  _count: { 
                    replies: comment._count.replies + 1,
                    likes: comment._count.likes
                  }
                }
              : comment
          )
        );
      } else {
        // Add new top-level comment
        setComments(prevComments => [newComment, ...prevComments]);
      }

      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      // TODO: Implement delete API endpoint
      toast.success('Comment deleted successfully');
      
      // Remove comment from state
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Edit comment
  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      // TODO: Implement edit API endpoint
      toast.success('Comment updated successfully');
      
      // Update comment in state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: newContent, updatedAt: new Date().toISOString() }
            : comment
        )
      );
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  // Like/Unlike comment with optimistic updates
  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to like comments');
      return;
    }

    // Find the comment to toggle like state
    const updateCommentLike = (comments: Comment[], targetId: string, isLiked: boolean): Comment[] => {
      return comments.map(comment => {
        if (comment.id === targetId) {
          return {
            ...comment,
            userLiked: isLiked,
            _count: {
              ...comment._count,
              likes: isLiked ? comment._count.likes + 1 : comment._count.likes - 1,
            },
          };
        }
        
        // Check in replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentLike(comment.replies, targetId, isLiked),
          };
        }
        
        return comment;
      });
    };

    // Find current like state
    const findComment = (comments: Comment[], targetId: string): Comment | null => {
      for (const comment of comments) {
        if (comment.id === targetId) return comment;
        if (comment.replies) {
          const found = findComment(comment.replies, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const currentComment = findComment(comments, commentId);
    if (!currentComment) return;

    const isCurrentlyLiked = currentComment.userLiked ?? false;
    const newLikedState = !isCurrentlyLiked;

    // Optimistic update
    setComments(prevComments => updateCommentLike(prevComments, commentId, newLikedState));

    try {
      const response = await fetch(`/api/artbooks/${artbookSlug}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      
      // Update with actual server response
      setComments(prevComments => updateCommentLike(prevComments, commentId, data.liked));
      
    } catch (error) {
      console.error('Error toggling comment like:', error);
      // Rollback optimistic update
      setComments(prevComments => updateCommentLike(prevComments, commentId, isCurrentlyLiked));
      toast.error('Failed to update like status');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [artbookSlug, fetchComments]);

  const totalComments = comments.reduce((total, comment) => 
    total + 1 + (comment._count?.replies || 0), 0
  );

  // Notify parent of comment count changes
  useEffect(() => {
    if (onCommentCountChange && !isLoading) {
      onCommentCountChange(totalComments);
    }
  }, [totalComments, onCommentCountChange, isLoading]);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
          <MessageCircle className="h-5 w-5 text-orange-500" />
          Comments
          <Badge variant="secondary" className="ml-2">
            {totalComments}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <div>
          <CommentForm
            onSubmit={(content) => handleSubmitComment(content)}
            isSubmitting={isSubmitting}
            placeholder="Share your thoughts about this artbook..."
            isAuthenticated={isAuthenticated}
          />
        </div>

        <Separator />

        {/* Comments List */}
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <CommentList
              comments={comments}
              currentUserId={user?.id}
              onReply={handleSubmitComment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onLike={handleLikeComment}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}