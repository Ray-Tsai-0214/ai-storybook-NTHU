import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

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

// Helper function to check comment nesting depth
async function getCommentDepth(commentId: string): Promise<number> {
  let depth = 0;
  let currentId = commentId;
  
  while (currentId && depth < MAX_NESTING_DEPTH + 1) {
    const comment = await prisma.comment.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    
    if (!comment?.parentId) break;
    
    currentId = comment.parentId;
    depth++;
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
      headers: request.headers 
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);
    const { slug } = await params;

    // Sanitize the content
    const sanitizedContent = sanitizeContent(validatedData.content);

    // Find the artbook's post
    const artbook = await prisma.artbook.findUnique({
      where: { slug },
      include: { post: true },
    });

    if (!artbook || !artbook.post) {
      return NextResponse.json(
        { error: "Artbook or post not found" },
        { status: 404 }
      );
    }

    // If parentId is provided, verify the parent comment exists and check nesting depth
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentComment || parentComment.postId !== artbook.post.id) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      // Check nesting depth to prevent excessive nesting
      const currentDepth = await getCommentDepth(validatedData.parentId);
      if (currentDepth >= MAX_NESTING_DEPTH) {
        return NextResponse.json(
          { error: `Maximum nesting depth of ${MAX_NESTING_DEPTH} levels exceeded` },
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
        parentId: validatedData.parentId,
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

    // Find the artbook's post
    const artbook = await prisma.artbook.findUnique({
      where: { slug },
      include: { post: true },
    });

    if (!artbook || !artbook.post) {
      return NextResponse.json(
        { error: "Artbook or post not found" },
        { status: 404 }
      );
    }

    // Get current user session for like status
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });

    // Get total count for pagination
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
    const transformedComments = comments.map(comment => ({
      ...comment,
      likeCount: comment._count.likes,
      userLiked: session ? comment.likes.length > 0 : false,
      replies: comment.replies.map(reply => ({
        ...reply,
        likeCount: reply._count.likes,
        userLiked: session ? reply.likes.length > 0 : false,
        likes: undefined, // Remove the raw likes array from response
      })),
      likes: undefined, // Remove the raw likes array from response
    }));

    const totalPages = Math.ceil(totalComments / limit);

    return NextResponse.json({
      comments: transformedComments,
      pagination: {
        page,
        limit,
        total: totalComments,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
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