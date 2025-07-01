import { prisma } from "@/lib/prisma";
import type { Artbook, Page, Post, Category } from "@/types";

// Types for function parameters
export interface CreateArtbookData {
  title: string;
  description?: string;
  coverPhoto?: string;
  category: Category;
  isPublic?: boolean;
  pages: {
    pageNumber: number;
    content: string;
    picture?: string;
    audio?: string;
  }[];
}

export interface UpdateArtbookData {
  title?: string;
  description?: string;
  coverPhoto?: string;
  category?: Category;
  isPublic?: boolean;
}

export interface GetArtbooksFilters {
  category?: string;
  authorId?: string;
  isPublic?: boolean;
}

export interface ArtbookWithDetails extends Artbook {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  pages: Page[];
  post: (Post & {
    _count: {
      likes: number;
      comments: number;
    };
  }) | null;
}

// Generate URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Ensure slug uniqueness
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.artbook.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    
    if (!existing) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// Create artbook with pages and post
export async function createArtbook(data: CreateArtbookData, authorId: string) {
  const baseSlug = generateSlug(data.title);
  const slug = await ensureUniqueSlug(baseSlug);

  return await prisma.$transaction(async (tx) => {
    // Create the artbook
    const newArtbook = await tx.artbook.create({
      data: {
        title: data.title,
        slug: slug,
        description: data.description,
        coverPhoto: data.coverPhoto,
        category: data.category,
        isPublic: data.isPublic ?? true,
        authorId: authorId,
      },
    });

    // Create pages
    const pages = await Promise.all(
      data.pages.map((page) =>
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
}

// Get artbooks with filters
export async function getArtbooks(filters: GetArtbooksFilters = {}): Promise<ArtbookWithDetails[]> {
  const where: Record<string, unknown> = {};
  
  if (filters.category && ['ADVENTURE', 'HORROR', 'ACTION', 'ROMANTIC', 'FIGURE'].includes(filters.category.toUpperCase())) {
    where.category = filters.category.toUpperCase();
  }
  
  if (filters.authorId) {
    where.authorId = filters.authorId;
  }
  
  if (filters.isPublic !== undefined) {
    where.isPublic = filters.isPublic;
  }

  return await prisma.artbook.findMany({
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
}

// Get artbook by slug
export async function getArtbookBySlug(slug: string): Promise<ArtbookWithDetails | null> {
  return await prisma.artbook.findUnique({
    where: { slug },
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
  });
}

// Get artbook ownership info
export async function getArtbookOwnership(slug: string): Promise<{ id: string; authorId: string; slug: string; title: string } | null> {
  return await prisma.artbook.findUnique({
    where: { slug },
    select: { id: true, authorId: true, slug: true, title: true }
  });
}

// Update artbook
export async function updateArtbook(slug: string, data: UpdateArtbookData): Promise<ArtbookWithDetails> {
  const existingArtbook = await getArtbookOwnership(slug);
  if (!existingArtbook) {
    throw new Error("Artbook not found");
  }

  // If title is being updated, check if we need to update slug
  let newSlug = existingArtbook.slug;
  if (data.title && data.title !== existingArtbook.title) {
    const baseSlug = generateSlug(data.title);
    newSlug = await ensureUniqueSlug(baseSlug, existingArtbook.id);
  }

  return await prisma.artbook.update({
    where: { id: existingArtbook.id },
    data: {
      ...data,
      slug: newSlug,
    },
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
  });
}

// Delete artbook and all related data
export async function deleteArtbook(slug: string): Promise<void> {
  const existingArtbook = await getArtbookOwnership(slug);
  if (!existingArtbook) {
    throw new Error("Artbook not found");
  }

  await prisma.$transaction(async (tx) => {
    // Delete likes
    await tx.like.deleteMany({
      where: {
        post: {
          artbookId: existingArtbook.id
        }
      }
    });

    // Delete comment likes first
    await tx.commentLike.deleteMany({
      where: {
        comment: {
          post: {
            artbookId: existingArtbook.id
          }
        }
      }
    });

    // Delete comments
    await tx.comment.deleteMany({
      where: {
        post: {
          artbookId: existingArtbook.id
        }
      }
    });

    // Delete post
    await tx.post.deleteMany({
      where: {
        artbookId: existingArtbook.id
      }
    });

    // Delete pages
    await tx.page.deleteMany({
      where: {
        artbookId: existingArtbook.id
      }
    });

    // Delete artbook
    await tx.artbook.delete({
      where: {
        id: existingArtbook.id
      }
    });
  });
}