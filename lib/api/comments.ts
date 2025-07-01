import { prisma } from "@/lib/prisma";
import type { 
  CommentWithReplies, 
  CommentReply, 
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentsPaginationResponse,
  CommentResponse
} from "@/types/comment";

// Constants for comment system
const MAX_COMMENT_LENGTH = 1000;
const MAX_NESTING_DEPTH = 2;

// Helper function to sanitize HTML content
function sanitizeContent(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/&lt;script&gt;.*?&lt;\/script&gt;/gi, '') // Remove script tags
    .trim();
}

// Helper function to calculate comment depth
export async function getCommentDepth(parentId: string): Promise<number> {
  let depth = 1;
  let currentParentId = parentId;
  
  while (currentParentId && depth < MAX_NESTING_DEPTH) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: currentParentId },
      select: { parentId: true },
    });
    
    if (!parentComment || !parentComment.parentId) {
      break;
    }
    
    depth++;
    currentParentId = parentComment.parentId;
  }
  
  return depth;
}

// Get artbook post by slug
export async function getArtbookPost(slug: string) {
  return await prisma.artbook.findUnique({
    where: { slug },
    include: { post: true },
  });
}

// Create a new comment
export async function createComment(
  slug: string, 
  data: CreateCommentRequest, 
  userId: string
) {
  const sanitizedContent = sanitizeContent(data.content);

  const artbook = await getArtbookPost(slug);
  if (!artbook || !artbook.post) {
    throw new Error("Artbook or associated post not found");
  }

  if (data.parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: data.parentId },
      select: { id: true, postId: true, parentId: true },
    });

    if (!parentComment) {
      throw new Error("Parent comment not found");
    }

    if (parentComment.postId !== artbook.post.id) {
      throw new Error("Parent comment does not belong to this artbook");
    }

    const depth = await getCommentDepth(data.parentId);
    if (depth >= MAX_NESTING_DEPTH) {
      throw new Error(`Maximum comment nesting depth (${MAX_NESTING_DEPTH}) exceeded`);
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: sanitizedContent,
      userId: userId,
      postId: artbook.post.id,
      parentId: data.parentId || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          replies: true,
          likes: true,
        },
      },
    },
  });

  return {
    ...comment,
    likeCount: comment._count.likes,
    userLiked: false,
  };
}

// Get paginated comments with replies
export async function getComments(
  slug: string,
  page: number = 1,
  limit: number = 10,
  userId?: string
): Promise<CommentsPaginationResponse> {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(50, Math.max(1, limit));
  const skip = (normalizedPage - 1) * normalizedLimit;

  const artbook = await getArtbookPost(slug);
  if (!artbook || !artbook.post) {
    throw new Error("Artbook or associated post not found");
  }

  const totalComments = await prisma.comment.count({
    where: {
      postId: artbook.post.id,
      parentId: null,
    },
  });

  const comments = await prisma.comment.findMany({
    where: {
      postId: artbook.post.id,
      parentId: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
          likes: userId ? {
            where: {
              userId: userId,
            },
            select: {
              id: true,
            },
          } : false,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      _count: {
        select: {
          replies: true,
          likes: true,
        },
      },
      likes: userId ? {
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      } : false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: normalizedLimit,
  });

  // Transform comments with proper typing
  const transformedComments = comments.map((comment: CommentWithReplies) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    userId: comment.userId,
    postId: comment.postId,
    parentId: comment.parentId,
    user: comment.user,
    likeCount: comment._count.likes,
    userLiked: userId ? comment.likes.length > 0 : false,
    _count: {
      replies: comment._count.replies,
      likes: comment._count.likes,
    },
    replies: comment.replies.map((reply: CommentReply) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      userId: reply.userId,
      postId: reply.postId,
      parentId: reply.parentId,
      user: reply.user,
      likeCount: reply._count.likes,
      userLiked: userId ? reply.likes.length > 0 : false,
      _count: {
        likes: reply._count.likes,
      },
    })),
  }));

  const totalPages = Math.ceil(totalComments / normalizedLimit);
  const hasNext = normalizedPage < totalPages;
  const hasPrev = normalizedPage > 1;

  return {
    comments: transformedComments,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total: totalComments,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

// Get comment by ID with ownership verification
export async function getCommentForModification(commentId: string, slug: string) {
  const artbook = await getArtbookPost(slug);
  if (!artbook || !artbook.post) {
    throw new Error("Artbook or post not found");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.postId !== artbook.post.id) {
    throw new Error("Comment does not belong to this artbook");
  }

  return comment;
}

// Update comment
export async function updateComment(
  commentId: string,
  slug: string,
  data: UpdateCommentRequest,
  userId: string
) {
  const existingComment = await getCommentForModification(commentId, slug);

  if (existingComment.userId !== userId) {
    throw new Error("Forbidden - You can only edit your own comments");
  }

  const sanitizedContent = sanitizeContent(data.content);

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: sanitizedContent,
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          replies: true,
          likes: true,
        },
      },
      likes: {
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  return {
    ...updatedComment,
    likeCount: updatedComment._count.likes,
    userLiked: updatedComment.likes.length > 0,
    likes: undefined, // Remove the raw likes array from response
  };
}

// Delete comment
export async function deleteComment(
  commentId: string,
  slug: string,
  userId: string
) {
  const existingComment = await getCommentForModification(commentId, slug);

  if (existingComment.userId !== userId) {
    throw new Error("Forbidden - You can only delete your own comments");
  }

  // Check if comment has replies
  if (existingComment._count.replies > 0) {
    throw new Error("Cannot delete comment with replies. Consider editing the content instead.");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });
}

// Validate comment content length
export function validateCommentContent(content: string): void {
  if (!content || content.trim().length === 0) {
    throw new Error("Comment content is required");
  }
  
  if (content.length > MAX_COMMENT_LENGTH) {
    throw new Error(`Comment must be less than ${MAX_COMMENT_LENGTH} characters`);
  }
}