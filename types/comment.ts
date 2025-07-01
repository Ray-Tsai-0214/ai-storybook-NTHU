import type { Prisma } from '@prisma/client';

// Use Prisma's generated types directly
export type { Comment, User, CommentLike } from '@prisma/client';

// Define Prisma query result types using GetPayload
export type CommentWithUser = Prisma.CommentGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
    _count: {
      select: {
        replies: true;
        likes: true;
      };
    };
  };
}>;

export type CommentWithReplies = Prisma.CommentGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
    replies: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            image: true;
          };
        };
        _count: {
          select: {
            likes: true;
          };
        };
        likes: {
          select: {
            id: true;
          };
        };
      };
    };
    _count: {
      select: {
        replies: true;
        likes: true;
      };
    };
    likes: {
      select: {
        id: true;
      };
    };
  };
}>;

export type CommentReply = CommentWithReplies['replies'][number];

// API response types
export interface CommentResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  postId: string;
  parentId: string | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
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

// Request types
export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}