// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  status?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Like response types
export interface LikeResponse {
  liked: boolean;
  likeCount: number;
  message: string;
}

export interface LikeStatusResponse {
  userLiked: boolean;
  likeCount: number;
}

// Report types
export type ReportCategory = 
  | 'inappropriate'
  | 'copyright'
  | 'spam'
  | 'harassment'
  | 'violence'
  | 'adult'
  | 'other';

export interface ReportRequest {
  category: ReportCategory;
  description?: string;
}

export interface ReportResponse {
  message: string;
  reportId: string;
}