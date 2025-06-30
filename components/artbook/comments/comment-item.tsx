"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommentForm } from "./comment-form";
import { CommentActions } from "./comment-actions";
import { formatDistanceToNow } from "date-fns";
import { Reply, ChevronDown, ChevronUp, Heart } from "lucide-react";
import type { Comment } from "./comment-section";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (content: string, parentId?: string) => Promise<void>;
  onEdit: (commentId: string, newContent: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  isSubmitting: boolean;
  depth: number;
}

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isSubmitting,
  depth,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = currentUserId === comment.userId;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 2; // Maximum nesting depth
  const canReply = depth < maxDepth;

  const handleReply = async (content: string) => {
    await onReply(content, comment.id);
    setShowReplyForm(false);
  };

  const handleEdit = async (newContent: string) => {
    await onEdit(comment.id, newContent);
    setIsEditing(false);
  };

  const handleLike = async () => {
    if (!currentUserId) return;
    
    setIsLiking(true);
    try {
      await onLike(comment.id);
    } finally {
      setIsLiking(false);
    }
  };

  const getAvatarFallback = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  // Visual indentation based on depth
  const indentClass = depth === 0 ? '' : depth === 1 ? 'ml-8' : 'ml-12';
  const borderClass = depth > 0 ? 'border-l-2 border-orange-100 pl-4' : '';

  return (
    <div className={`${indentClass} ${borderClass}`}>
      {/* Main Comment */}
      <div className="flex space-x-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user.image || undefined} alt={comment.user.name} />
          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
            {getAvatarFallback(comment.user.name)}
          </AvatarFallback>
        </Avatar>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
              {comment.user.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(comment.createdAt)}
            </span>
            {comment.createdAt !== comment.updatedAt && (
              <Badge variant="outline" className="text-xs">
                edited
              </Badge>
            )}
          </div>

          {/* Comment Body */}
          <div className="mb-2">
            {isEditing ? (
              <CommentForm
                onSubmit={handleEdit}
                onCancel={() => setIsEditing(false)}
                initialValue={comment.content}
                isSubmitting={isSubmitting}
                placeholder="Edit your comment..."
                showCancel
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>

          {/* Comment Actions */}
          {!isEditing && (
            <div className="flex items-center space-x-4 text-xs">
              {/* Like Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`group h-auto p-1 px-2 rounded-full transition-all duration-200 ${
                  comment.userLiked 
                    ? "text-orange-600 bg-orange-50 hover:bg-orange-100" 
                    : "text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
                } ${isLiking ? "scale-95" : "hover:scale-105"}`}
                disabled={isSubmitting || !currentUserId || isLiking}
                aria-label={comment.userLiked ? "Unlike comment" : "Like comment"}
                title={comment.userLiked ? "Unlike comment" : "Like comment"}
              >
                <Heart 
                  className={`h-3 w-3 mr-1 transition-all duration-300 ${
                    comment.userLiked 
                      ? "fill-orange-500 text-orange-500 scale-110" 
                      : "text-muted-foreground"
                  } ${isLiking ? "animate-pulse" : ""}`} 
                />
                {comment._count.likes > 0 && (
                  <span className={`text-xs font-medium transition-colors ${
                    comment.userLiked ? "text-orange-600" : "text-muted-foreground"
                  }`}>
                    {comment._count.likes}
                  </span>
                )}
                {comment._count.likes === 0 && !comment.userLiked && currentUserId && (
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Like
                  </span>
                )}
                {!currentUserId && comment._count.likes === 0 && (
                  <span className="text-xs text-muted-foreground">
                    Like
                  </span>
                )}
              </Button>

              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-auto p-0 text-muted-foreground hover:text-orange-600"
                  disabled={isSubmitting}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}

              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="h-auto p-0 text-muted-foreground hover:text-orange-600"
                >
                  {showReplies ? (
                    <ChevronUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  )}
                  {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
                </Button>
              )}

              {isOwner && (
                <CommentActions
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => onDelete(comment.id)}
                />
              )}
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && canReply && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                isSubmitting={isSubmitting}
                placeholder={`Reply to ${comment.user.name}...`}
                showCancel
                compact
              />
            </div>
          )}

          {/* Nested Replies */}
          {hasReplies && showReplies && (
            <div className="mt-4 space-y-4">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onLike={onLike}
                  isSubmitting={isSubmitting}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}

          {/* Depth limit message */}
          {depth >= maxDepth && (
            <div className="mt-2 text-xs text-muted-foreground italic">
              Maximum reply depth reached
            </div>
          )}
        </div>
      </div>
    </div>
  );
}