"use client";

import { CommentItem } from "./comment-item";
import type { Comment } from "./comment-section";

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  onReply: (content: string, parentId?: string) => Promise<void>;
  onEdit: (commentId: string, newContent: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function CommentList({
  comments,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isSubmitting,
}: CommentListProps) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onLike={onLike}
          isSubmitting={isSubmitting}
          depth={0}
        />
      ))}
    </div>
  );
}