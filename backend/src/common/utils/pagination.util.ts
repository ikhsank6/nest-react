// Pagination helper for consistent response format across all services

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success',
) {
  return {
    message,
    data: {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
}

export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function normalizePageParams(page?: string | number, limit?: string | number) {
  return {
    page: typeof page === 'string' ? parseInt(page, 10) || 1 : page || 1,
    limit: typeof limit === 'string' ? parseInt(limit, 10) || 10 : limit || 10,
  };
}
