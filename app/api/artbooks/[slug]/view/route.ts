import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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

    // Increment view count
    const updatedPost = await prisma.post.update({
      where: { id: artbook.post.id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      message: "View recorded successfully",
      views: updatedPost.views,
    });

  } catch (error) {
    console.error("Record view error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}