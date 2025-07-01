import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { 
  CreateCommentRequest,
  CommentsPaginationResponse 
} from "@/types/comment";
import { createComment, getComments, validateCommentContent } from "@/lib/api/comments";

// Input validation schema
const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
  parentId: z.string().optional(),
}) satisfies z.ZodType<CreateCommentRequest>;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to post comments" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);
    const { slug } = await params;

    // Create comment using centralized API function
    const comment = await createComment(slug, validatedData, session.user.id);

    return NextResponse.json({
      message: "Comment created successfully",
      comment,
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
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Get comments using centralized API function
    const response = await getComments(slug, page, limit, session?.user.id);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Get comments error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}