import { NextRequest, NextResponse } from "next/server";
import { incrementArtbookView } from "@/lib/api/views";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Increment view count using centralized API function
    const result = await incrementArtbookView(slug);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Record view error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}