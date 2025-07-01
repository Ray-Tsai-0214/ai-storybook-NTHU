import { prisma } from "@/lib/prisma";

export interface ViewResponse {
  message: string;
  views: number;
}

// Get artbook post by slug
export async function getArtbookPost(slug: string) {
  return await prisma.artbook.findUnique({
    where: { slug },
    include: { post: true },
  });
}

// Increment view count for an artbook
export async function incrementArtbookView(slug: string): Promise<ViewResponse> {
  const artbook = await getArtbookPost(slug);
  
  if (!artbook || !artbook.post) {
    throw new Error("Artbook or post not found");
  }

  // Increment view count
  const updatedPost = await prisma.post.update({
    where: { id: artbook.post.id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return {
    message: "View recorded successfully",
    views: updatedPost.views,
  };
}

// Get view count for an artbook
export async function getArtbookViewCount(slug: string): Promise<number> {
  const artbook = await getArtbookPost(slug);
  
  if (!artbook || !artbook.post) {
    throw new Error("Artbook or post not found");
  }

  return artbook.post.views;
}

// Increment view count in artbook detail route (auto-increment on GET)
export async function autoIncrementView(slug: string): Promise<number> {
  const artbook = await getArtbookPost(slug);
  
  if (!artbook || !artbook.post) {
    throw new Error("Artbook or post not found");
  }

  // Increment view count
  await prisma.post.update({
    where: { id: artbook.post.id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  // Return the incremented view count
  return artbook.post.views + 1;
}

// Get analytics data for views (admin/author function)
export async function getViewAnalytics(artbookId?: string, authorId?: string) {
  const where: any = {};
  
  if (artbookId) {
    where.artbookId = artbookId;
  }
  
  if (authorId) {
    where.artbook = { authorId };
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      artbook: {
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          author: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: { views: 'desc' }
  });

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const averageViews = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;

  return {
    totalViews,
    averageViews,
    totalArtbooks: posts.length,
    artbooks: posts.map(post => ({
      id: post.artbook.id,
      title: post.artbook.title,
      slug: post.artbook.slug,
      views: post.views,
      createdAt: post.artbook.createdAt,
      author: post.artbook.author
    }))
  };
}