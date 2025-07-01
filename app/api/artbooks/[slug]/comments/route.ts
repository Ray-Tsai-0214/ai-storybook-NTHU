import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Constants for comment system
const MAX_COMMENT_LENGTH = 1000;
const MAX_NESTING_DEPTH = 2;

// Input validation schema
const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(MAX_COMMENT_LENGTH, `Comment must be less than ${MAX_COMMENT_LENGTH} characters`),
  parentId: z.string().optional(),
});

// Helper function to sanitize HTML content
function sanitizeContent(content: string): string {
  // Remove any potential HTML tags and dangerous characters
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/&lt;script&gt;.*?&lt;\/script&gt;/gi, '') // Remove script tags
    .trim();
}

// Helper function to calculate comment depth
async function getCommentDepth(parentId: string): Promise<number> {
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to post comments" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);
    const { slug } = await params;

    // Sanitize the content
    const sanitizedContent = sanitizeContent(validatedData.content);

    // Find the artbook and its associated post
    const artbook = await prisma.artbook.findUnique({
      where: { slug },
      include: { post: true },
    });

    if (!artbook || !artbook.post) {
      return NextResponse.json(
        { error: "Artbook or associated post not found" },
        { status: 404 }
      );
    }

    // If replying to a comment, validate parent comment and check depth
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
        select: { id: true, postId: true, parentId: true },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      if (parentComment.postId !== artbook.post.id) {
        return NextResponse.json(
          { error: "Parent comment does not belong to this artbook" },
          { status: 400 }
        );
      }

      // Check nesting depth
      const depth = await getCommentDepth(validatedData.parentId);
      if (depth >= MAX_NESTING_DEPTH) {
        return NextResponse.json(
          { error: `Maximum comment nesting depth (${MAX_NESTING_DEPTH}) exceeded` },
          { status: 400 }
        );
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        userId: session.user.id,
        postId: artbook.post.id,
        parentId: validatedData.parentId || null,
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

    // Transform the comment to include like information
    const transformedComment = {
      ...comment,
      likeCount: comment._count.likes,
      userLiked: false, // New comment, user hasn't liked it yet
    };

    return NextResponse.json({
      message: "Comment created successfully",
      comment: transformedComment,
    });

  } catch (error) {
    console.error("Create comment error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;

    // Get session for like status
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Find the artbook and its associated post
    const artbook = await prisma.artbook.findUnique({
      where: { slug },
      include: { post: true },
    });

    if (!artbook || !artbook.post) {
      return NextResponse.json(
        { error: "Artbook or associated post not found" },
        { status: 404 }
      );
    }

    // Count total comments for pagination
    const totalComments = await prisma.comment.count({
      where: {
        postId: artbook.post.id,
        parentId: null, // Only top-level comments
      },
    });

    // Get comments with replies and like information
    const comments = await prisma.comment.findMany({
      where: {
        postId: artbook.post.id,
        parentId: null, // Only top-level comments
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
            likes: session ? {
              where: {
                userId: session.user.id,
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
        likes: session ? {
          where: {
            userId: session.user.id,
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
      take: limit,
    });

    // Transform the data to include like information in a cleaner format
    const transformedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      userId: comment.userId,
      postId: comment.postId,
      parentId: comment.parentId,
      user: comment.user,
      likeCount: comment._count.likes,
      userLiked: session ? comment.likes.length > 0 : false,
      _count: {
        replies: comment._count.replies,
        likes: comment._count.likes,
      },
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        userId: reply.userId,
        postId: reply.postId,
        parentId: reply.parentId,
        user: reply.user,
        likeCount: reply._count.likes,
        userLiked: session ? reply.likes.length > 0 : false,
        _count: {
          likes: reply._count.likes,
        },
      })),
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalComments / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      comments: transformedComments,
      pagination: {
        page,
        limit,
        total: totalComments,
        totalPages,
        hasNext,
        hasPrev,
      },
    });

  } catch (error) {
    console.error("Get comments error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}