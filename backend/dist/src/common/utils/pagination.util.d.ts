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
export declare function buildPaginatedResponse<T>(items: T[], total: number, page: number, limit: number, message?: string): {
    message: string;
    data: {
        items: T[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
};
export declare function calculateSkip(page: number, limit: number): number;
export declare function normalizePageParams(page?: string | number, limit?: string | number): {
    page: number;
    limit: number;
};
