import { prisma } from "@/lib/prisma";
import type { ReportRequest, ReportResponse, ReportCategory } from "@/types/api";

// Database enum values mapped from frontend categories
const categoryMap: Record<string, string> = {
  "inappropriate": "INAPPROPRIATE_CONTENT",
  "copyright": "COPYRIGHT_VIOLATION",
  "spam": "SPAM_MISLEADING", 
  "harassment": "HARASSMENT_BULLYING",
  "violence": "VIOLENCE_GORE",
  "adult": "ADULT_CONTENT",
  "other": "OTHER"
};

// Extended category map for frontend variations
const extendedCategoryMap: Record<string, string> = {
  ...categoryMap,
  "inappropriate-content": "INAPPROPRIATE_CONTENT",
  "copyright-violation": "COPYRIGHT_VIOLATION",
  "spam-misleading": "SPAM_MISLEADING", 
  "harassment-bullying": "HARASSMENT_BULLYING",
  "violence-gore": "VIOLENCE_GORE",
  "adult-content": "ADULT_CONTENT",
};

export interface ReportExistence {
  hasReported: boolean;
  report: {
    id: string;
    status: string;
    createdAt: Date;
  } | null;
}

// Get artbook by slug for reporting
export async function getArtbookForReport(slug: string) {
  return await prisma.artbook.findUnique({
    where: { slug },
    select: { id: true, title: true, authorId: true }
  });
}

// Check if user has already reported an artbook
export async function checkExistingReport(artbookId: string, reporterId: string) {
  return await prisma.report.findFirst({
    where: {
      artbookId: artbookId,
      reporterId: reporterId,
    }
  });
}

// Create a new report
export async function createReport(
  slug: string,
  reportData: ReportRequest,
  reporterId: string
): Promise<ReportResponse> {
  // Find the artbook
  const artbook = await getArtbookForReport(slug);
  if (!artbook) {
    throw new Error("Artbook not found");
  }

  // Prevent self-reporting
  if (artbook.authorId === reporterId) {
    throw new Error("You cannot report your own artbook");
  }

  // Check if user has already reported this artbook
  const existingReport = await checkExistingReport(artbook.id, reporterId);
  if (existingReport) {
    throw new Error("You have already reported this artbook");
  }

  // Map category to database enum
  const dbCategory = extendedCategoryMap[reportData.category];
  if (!dbCategory) {
    throw new Error("Invalid report category");
  }

  // Create the report
  const report = await prisma.report.create({
    data: {
      artbookId: artbook.id,
      reporterId: reporterId,
      category: dbCategory as "INAPPROPRIATE_CONTENT" | "COPYRIGHT_VIOLATION" | "SPAM_MISLEADING" | "HARASSMENT_BULLYING" | "VIOLENCE_GORE" | "ADULT_CONTENT" | "OTHER",
      description: reportData.description || "",
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

  return {
    message: "Report submitted successfully",
    reportId: report.id,
  };
}

// Check if user has reported an artbook
export async function getReportStatus(slug: string, userId: string): Promise<ReportExistence> {
  const artbook = await getArtbookForReport(slug);
  if (!artbook) {
    throw new Error("Artbook not found");
  }

  const existingReport = await prisma.report.findFirst({
    where: {
      artbookId: artbook.id,
      reporterId: userId,
    },
    select: { id: true, status: true, createdAt: true }
  });

  return {
    hasReported: !!existingReport,
    report: existingReport || null,
  };
}

// Validate report data
export function validateReportData(data: ReportRequest): void {
  if (!data.category) {
    throw new Error("Report category is required");
  }

  if (!extendedCategoryMap[data.category]) {
    throw new Error("Invalid report category");
  }

  if (data.description) {
    if (data.description.length < 10) {
      throw new Error("Description must be at least 10 characters");
    }
    
    if (data.description.length > 500) {
      throw new Error("Description must be less than 500 characters");
    }
  }
}

// Get all reports for moderation (admin function)
export async function getAllReports(
  status?: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED",
  page: number = 1,
  limit: number = 20
) {
  const where = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        artbook: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        reporter: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.report.count({ where })
  ]);

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  };
}

// Update report status (admin function)
export async function updateReportStatus(
  reportId: string,
  status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED",
  resolution?: string
) {
  return await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolution,
      resolvedAt: status === "RESOLVED" || status === "DISMISSED" ? new Date() : null,
      updatedAt: new Date(),
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
}