import { prisma } from "@/lib/prisma";
import type { LikeResponse, LikeStatusResponse } from "@/types/api";

// Get artbook post by slug
export async function getArtbookPost(slug: string) {
  return await prisma.artbook.findUnique({
    where: { slug },
    include: { post: true },
  });
}

// Get comment with post verification
export async function getCommentForLike(commentId: string, slug: string) {
  const artbook = await getArtbookPost(slug);
  if (!artbook || !artbook.post) {
    throw new Error("Artbook or post not found");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.postId !== artbook.post.id) {
    throw new Error("Comment does not belong to this artbook");
  }

  return { comment, artbook };
}

// Toggle artbook like
export async function toggleArtbookLike(slug: string, userId: string): Promise<LikeResponse> {
  const artbook = await getArtbookPost(slug);
  if (!artbook || !artbook.post) {
    throw new Error("Artbook or post not found");
  }

  // Check if user already liked this post
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: userId,
        postId: artbook.post.id,
      },
    },
  });

  if (existingLike) {
    // Unlike: Remove the like
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { postId: artbook.post.id },
    });

    return {
      message: "Post unliked successfully",
      liked: false,
      likeCount,
    };
  } else {
    // Like: Add a new like
    await prisma.like.create({
      data: {
        userId: userId,
        postId: artbook.post.id,
      },
    });

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { postId: artbook.post.id },
    });

    return {
      message: "Post liked successfully",
      liked: true,
      likeCount,
    };
  }
}

// Get artbook like status
export async function getArtbookLikeStatus(slug: string, userId?: string): Promise<LikeStatusResponse> {
  const artbook = await prisma.artbook.findUnique({
    where: { slug },
    include: {
      post: {
        include: {
          _count: {
            select: {
              likes: true,
            },
          },
        },
      },
    },
  });

  if (!artbook || !artbook.post) {
    throw new Error("Artbook or post not found");
  }

  // Check if current user liked this post
  let userLiked = false;
  if (userId) {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: artbook.post.id,
        },
      },
    });
    userLiked = !!existingLike;
  }

  return {
    likeCount: artbook.post._count.likes,
    userLiked,
  };
}

// Toggle comment like
export async function toggleCommentLike(commentId: string, slug: string, userId: string): Promise<LikeResponse> {
  const { comment } = await getCommentForLike(commentId, slug);

  // Check if user already liked this comment
  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId: userId,
        commentId: commentId,
      },
    },
  });

  let liked = false;

  if (existingLike) {
    // Unlike: Remove the like
    await prisma.commentLike.delete({
      where: { id: existingLike.id },
    });
    liked = false;
  } else {
    // Like: Add the like
    await prisma.commentLike.create({
      data: {
        userId: userId,
        commentId: commentId,
      },
    });
    liked = true;
  }

  // Get updated like count
  const likeCount = await prisma.commentLike.count({
    where: { commentId: commentId },
  });

  return {
    liked,
    likeCount,
    message: liked ? "Comment liked" : "Comment unliked",
  };
}

// Get comment like status
export async function getCommentLikeStatus(commentId: string, slug: string, userId: string): Promise<LikeStatusResponse> {
  const { comment } = await getCommentForLike(commentId, slug);

  // Check if user liked this comment
  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId: userId,
        commentId: commentId,
      },
    },
  });

  // Get total like count
  const likeCount = await prisma.commentLike.count({
    where: { commentId: commentId },
  });

  return {
    userLiked: !!existingLike,
    likeCount,
  };
}