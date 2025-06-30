import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Check if user liked a comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; commentId: string }> }
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

    const { slug, commentId } = await params;

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

    // Find the comment and verify it belongs to this post
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.postId !== artbook.post.id) {
      return NextResponse.json(
        { error: "Comment does not belong to this artbook" },
        { status: 400 }
      );
    }

    // Check if user liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: commentId,
        },
      },
    });

    // Get total like count
    const likeCount = await prisma.commentLike.count({
      where: { commentId: commentId },
    });

    return NextResponse.json({
      userLiked: !!existingLike,
      likeCount,
    });

  } catch (error) {
    console.error("Check comment like error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Toggle comment like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; commentId: string }> }
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

    const { slug, commentId } = await params;

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

    // Find the comment and verify it belongs to this post
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.postId !== artbook.post.id) {
      return NextResponse.json(
        { error: "Comment does not belong to this artbook" },
        { status: 400 }
      );
    }

    // Check if user already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
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
          userId: session.user.id,
          commentId: commentId,
        },
      });
      liked = true;
    }

    // Get updated like count
    const likeCount = await prisma.commentLike.count({
      where: { commentId: commentId },
    });

    return NextResponse.json({
      liked,
      likeCount,
      message: liked ? "Comment liked" : "Comment unliked",
    });

  } catch (error) {
    console.error("Toggle comment like error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}