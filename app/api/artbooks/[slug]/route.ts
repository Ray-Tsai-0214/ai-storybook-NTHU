import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { z } from "zod";

const prisma = new PrismaClient();

// Input validation schema for updating artbook
const updateArtbookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
  description: z.string().optional(),
  coverPhoto: z.string().optional(),
  category: z.enum(["ADVENTURE", "HORROR", "ACTION", "ROMANTIC", "FIGURE"]).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const artbook = await prisma.artbook.findUnique({
      where: { slug },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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

    // Check if artbook exists and user owns it
    const existingArtbook = await prisma.artbook.findUnique({
      where: { slug },
      select: { id: true, authorId: true, slug: true, title: true }
    });

    if (!existingArtbook) {
      return NextResponse.json(
        { error: "Artbook not found" },
        { status: 404 }
      );
    }

    if (existingArtbook.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only edit your own artbooks" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = updateArtbookSchema.parse(body);

    // If title is being updated, check if we need to update slug
    let newSlug = existingArtbook.slug;
    if (validatedData.title && validatedData.title !== existingArtbook.title) {
      const baseSlug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      newSlug = baseSlug;
      let counter = 1;
      
      // Ensure slug is unique (excluding current artbook)
      while (await prisma.artbook.findFirst({ 
        where: { 
          slug: newSlug,
          id: { not: existingArtbook.id }
        } 
      })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Update artbook
    const updatedArtbook = await prisma.artbook.update({
      where: { id: existingArtbook.id },
      data: {
        ...validatedData,
        slug: newSlug,
      },
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

    return NextResponse.json({
      message: "Artbook updated successfully",
      artbook: updatedArtbook,
    });

  } catch (error) {
    console.error("Update artbook error:", error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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

    // Check if artbook exists and user owns it
    const existingArtbook = await prisma.artbook.findUnique({
      where: { slug },
      select: { id: true, authorId: true }
    });

    if (!existingArtbook) {
      return NextResponse.json(
        { error: "Artbook not found" },
        { status: 404 }
      );
    }

    if (existingArtbook.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only delete your own artbooks" },
        { status: 403 }
      );
    }

    // Delete artbook and related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete likes
      await tx.like.deleteMany({
        where: {
          post: {
            artbookId: existingArtbook.id
          }
        }
      });

      // Delete comments
      await tx.comment.deleteMany({
        where: {
          post: {
            artbookId: existingArtbook.id
          }
        }
      });

      // Delete post
      await tx.post.deleteMany({
        where: {
          artbookId: existingArtbook.id
        }
      });

      // Delete pages
      await tx.page.deleteMany({
        where: {
          artbookId: existingArtbook.id
        }
      });

      // Delete artbook
      await tx.artbook.delete({
        where: {
          id: existingArtbook.id
        }
      });
    });

    return NextResponse.json({
      message: "Artbook deleted successfully",
    });

  } catch (error) {
    console.error("Delete artbook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}