import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleCommentLike, getCommentLikeStatus } from "@/lib/api/likes";


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

    // Get comment like status using centralized API function
    const result = await getCommentLikeStatus(commentId, slug, session.user.id);

    return NextResponse.json(result);

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

    // Toggle comment like using centralized API function
    const result = await toggleCommentLike(commentId, slug, session.user.id);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Toggle comment like error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}