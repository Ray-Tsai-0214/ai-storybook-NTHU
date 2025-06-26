import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artbookId = params.id;

    // Find the artbook's post
    const artbook = await prisma.artbook.findUnique({
      where: { id: artbookId },
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