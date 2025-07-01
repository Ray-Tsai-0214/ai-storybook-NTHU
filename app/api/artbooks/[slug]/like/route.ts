import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


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

    const { slug } = await params;

    // Find the artbook's post by slug
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

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
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

      return NextResponse.json({
        message: "Post unliked successfully",
        liked: false,
      });
    } else {
      // Like: Add a new like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: artbook.post.id,
        },
      });

      return NextResponse.json({
        message: "Post liked successfully",
        liked: true,
      });
    }

  } catch (error) {
    console.error("Like/unlike error:", error);
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

    // Get the artbook's post with like count by slug
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
      return NextResponse.json(
        { error: "Artbook or post not found" },
        { status: 404 }
      );
    }

    // Check if current user liked this post
    let userLiked = false;
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });

    if (session) {
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: artbook.post.id,
          },
        },
      });
      userLiked = !!existingLike;
    }

    return NextResponse.json({
      likeCount: artbook.post._count.likes,
      userLiked,
    });

  } catch (error) {
    console.error("Get likes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}