import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { 
  getArtbookBySlug, 
  getArtbookOwnership, 
  updateArtbook, 
  deleteArtbook 
} from "@/lib/api/artbooks";
import { autoIncrementView } from "@/lib/api/views";


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

    // Get artbook using centralized API function
    const artbook = await getArtbookBySlug(slug);

    if (!artbook) {
      return NextResponse.json(
        { error: "Artbook not found" },
        { status: 404 }
      );
    }

    // Increment view count using centralized API function
    const newViewCount = await autoIncrementView(slug);

    return NextResponse.json({
      artbook: {
        ...artbook,
        post: artbook.post ? {
          ...artbook.post,
          views: newViewCount,
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
    const existingArtbook = await getArtbookOwnership(slug);

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

    // Update artbook using centralized API function
    const updatedArtbook = await updateArtbook(slug, validatedData);

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
    const existingArtbook = await getArtbookOwnership(slug);

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

    // Delete artbook using centralized API function
    await deleteArtbook(slug);

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