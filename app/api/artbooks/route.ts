import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

// Function to generate a URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

const prisma = new PrismaClient();

// Input validation schema
const createArtbookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  coverPhoto: z.string().optional(),
  category: z.enum(["ADVENTURE", "HORROR", "ACTION", "ROMANTIC", "FIGURE"]),
  isPublic: z.boolean().default(true),
  pages: z.array(z.object({
    pageNumber: z.number().min(1).max(10),
    content: z.string().min(1, "Page content is required"),
    picture: z.string().optional(),
    audio: z.string().optional(),
  })).min(1, "At least one page is required").max(10, "Maximum 10 pages allowed"),
});

export async function POST(request: NextRequest) {
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
    
    // Validate input
    const validatedData = createArtbookSchema.parse(body);

    // Generate a unique slug
    const baseSlug = generateSlug(validatedData.title);
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug is unique
    while (await prisma.artbook.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create artbook with pages in a transaction
    const artbook = await prisma.$transaction(async (tx) => {
      // Create the artbook
      const newArtbook = await tx.artbook.create({
        data: {
          title: validatedData.title,
          slug: slug,
          description: validatedData.description,
          coverPhoto: validatedData.coverPhoto,
          category: validatedData.category,
          isPublic: validatedData.isPublic,
          authorId: session.user.id,
        },
      });

      // Create pages
      const pages = await Promise.all(
        validatedData.pages.map((page) =>
          tx.page.create({
            data: {
              pageNumber: page.pageNumber,
              content: page.content,
              picture: page.picture,
              audio: page.audio,
              artbookId: newArtbook.id,
            },
          })
        )
      );

      // Create post for social features
      const post = await tx.post.create({
        data: {
          artbookId: newArtbook.id,
        },
      });

      return { ...newArtbook, pages, post };
    });

    return NextResponse.json({
      message: "Artbook created successfully",
      artbook,
    });

  } catch (error) {
    console.error("Create artbook error:", error);
    
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const authorId = searchParams.get('authorId');
    const isPublic = searchParams.get('isPublic');

    const where: Record<string, unknown> = {};
    
    if (category && ['ADVENTURE', 'HORROR', 'ACTION', 'ROMANTIC', 'FIGURE'].includes(category.toUpperCase())) {
      where.category = category.toUpperCase();
    }
    
    if (authorId) {
      where.authorId = authorId;
    }
    
    if (isPublic !== null) {
      where.isPublic = isPublic === 'true';
    }

    const artbooks = await prisma.artbook.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      artbooks,
    });

  } catch (error) {
    console.error("Get artbooks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}