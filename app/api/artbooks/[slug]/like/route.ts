import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleArtbookLike, getArtbookLikeStatus } from "@/lib/api/likes";


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

    // Toggle like using centralized API function
    const result = await toggleArtbookLike(slug, session.user.id);

    return NextResponse.json(result);

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

    // Get session for user-specific like status
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });

    // Get like status using centralized API function
    const result = await getArtbookLikeStatus(slug, session?.user.id);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Get likes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}