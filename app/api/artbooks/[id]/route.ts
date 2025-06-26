import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const artbook = await prisma.artbook.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        pages: {
          orderBy: {
            pageNumber: 'asc',
          },
        },
        post: {
          include: {
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    if (!artbook) {
      return NextResponse.json(
        { error: "Artbook not found" },
        { status: 404 }
      );
    }

    // Increment view count
    if (artbook.post) {
      await prisma.post.update({
        where: { id: artbook.post.id },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      artbook: {
        ...artbook,
        post: artbook.post ? {
          ...artbook.post,
          views: artbook.post.views + 1, // Return incremented view count
        } : null,
      },
    });

  } catch (error) {
    console.error("Get artbook by ID error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}