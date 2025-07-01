import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createArtbook, getArtbooks } from "@/lib/api/artbooks";



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

    // Create artbook using centralized API function
    const artbook = await createArtbook(validatedData, session.user.id);

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

    // Build filters object
    const filters = {
      ...(category && { category }),
      ...(authorId && { authorId }),
      ...(isPublic !== null && { isPublic: isPublic === 'true' }),
    };

    // Get artbooks using centralized API function
    const artbooks = await getArtbooks(filters);

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