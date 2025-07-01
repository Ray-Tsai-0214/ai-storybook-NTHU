import type { Comment, User } from '@prisma/client';

// Use Prisma's generated types directly
export type { Comment, User } from '@prisma/client';

// Only define transformed response types for API
export interface CommentResponse extends Omit<Comment, 'likes'> {
  user: Pick<User, 'id' | 'name' | 'image'>;
  likeCount: number;
  userLiked: boolean;
  _count: {
    likes: number;
  };
}

export interface CommentWithRepliesResponse extends CommentResponse {
  replies: CommentResponse[];
  _count: {
    replies: number;
    likes: number;
  };
}

export interface CommentsPaginationResponse {
  comments: CommentWithRepliesResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}