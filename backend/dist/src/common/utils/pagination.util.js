"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginatedResponse = buildPaginatedResponse;
exports.calculateSkip = calculateSkip;
exports.normalizePageParams = normalizePageParams;
function buildPaginatedResponse(items, total, page, limit, message = 'Success') {
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
function calculateSkip(page, limit) {
    return (page - 1) * limit;
}
function normalizePageParams(page, limit) {
    return {
        page: typeof page === 'string' ? parseInt(page, 10) || 1 : page || 1,
        limit: typeof limit === 'string' ? parseInt(limit, 10) || 10 : limit || 10,
    };
}
//# sourceMappingURL=pagination.util.js.map