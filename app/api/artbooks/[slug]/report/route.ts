import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


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

// Map frontend categories to database enum values
const categoryMap: Record<string, string> = {
  "inappropriate-content": "INAPPROPRIATE_CONTENT",
  "copyright-violation": "COPYRIGHT_VIOLATION",
  "spam-misleading": "SPAM_MISLEADING", 
  "harassment-bullying": "HARASSMENT_BULLYING",
  "violence-gore": "VIOLENCE_GORE",
  "adult-content": "ADULT_CONTENT",
  "other": "OTHER"
};

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

    // Find the artbook by slug
    const artbook = await prisma.artbook.findUnique({
      where: { slug },
      select: { id: true, title: true, authorId: true }
    });

    if (!artbook) {
      return NextResponse.json(
        { error: "Artbook not found" },
        { status: 404 }
      );
    }

    // Prevent self-reporting
    if (artbook.authorId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot report your own artbook" },
        { status: 400 }
      );
    }

    // Check if user has already reported this artbook
    const existingReport = await prisma.report.findFirst({
      where: {
        artbookId: artbook.id,
        reporterId: session.user.id,
      }
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this artbook" },
        { status: 400 }
      );
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        artbookId: artbook.id,
        reporterId: session.user.id,
        category: categoryMap[validatedData.category] as "INAPPROPRIATE_CONTENT" | "COPYRIGHT_VIOLATION" | "SPAM_MISLEADING" | "HARASSMENT_BULLYING" | "VIOLENCE_GORE" | "ADULT_CONTENT" | "OTHER",
        description: validatedData.description,
        status: "PENDING",
      },
      include: {
        artbook: {
          select: { title: true, slug: true }
        },
        reporter: {
          select: { name: true, email: true }
        }
      }
    });

    // TODO: Add notification system for moderators
    // TODO: Add email notification to admin team
    // TODO: Add automatic moderation checks for high-priority reports

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully",
      reportId: report.id,
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

    const artbook = await prisma.artbook.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!artbook) {
      return NextResponse.json(
        { error: "Artbook not found" },
        { status: 404 }
      );
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        artbookId: artbook.id,
        reporterId: session.user.id,
      },
      select: { id: true, status: true, createdAt: true }
    });

    return NextResponse.json({
      hasReported: !!existingReport,
      report: existingReport || null,
    });

  } catch (error) {
    console.error("Error checking report status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}