import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createReport, getReportStatus, validateReportData } from "@/lib/api/reports";


// Validation schema for report data
const reportSchema = z.object({
  category: z.enum([
    "inappropriate-content",
    "copyright-violation", 
    "spam-misleading",
    "harassment-bullying",
    "violence-gore",
    "adult-content",
    "other"
  ]),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = reportSchema.parse(body);

    const { slug } = await params;

    // Create report using centralized API function
    const result = await createReport(slug, validatedData, session.user.id);

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error("Error submitting report:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid report data", 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user has already reported this artbook
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Get report status using centralized API function
    const result = await getReportStatus(slug, session.user.id);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error checking report status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}