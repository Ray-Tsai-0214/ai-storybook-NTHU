// Use Prisma's generated types directly
export type { 
  Artbook, 
  Page, 
  Post, 
  User,
  Category 
} from '@prisma/client';

// Only define API response types when transformation is needed
export interface ArtbookResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  coverPhoto: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  stats?: {
    likes: number;
    views: number;
    comments: number;
  };
}