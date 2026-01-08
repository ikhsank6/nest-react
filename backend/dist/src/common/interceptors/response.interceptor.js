"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
function isPaginatedResponse(data) {
    return data && typeof data === 'object' && 'pagination' in data;
}
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((result) => {
            const message = result?.message || null;
            let responseData = result?.data !== undefined ? result.data : result;
            let pageMeta;
            if (isPaginatedResponse(responseData)) {
                const { pagination, ...restData } = responseData;
                const dataKey = Object.keys(restData).find(key => Array.isArray(restData[key]));
                if (dataKey) {
                    responseData = restData[dataKey];
                    pageMeta = {
                        total: pagination.total,
                        current_page: pagination.page,
                        from: ((pagination.page - 1) * pagination.limit) + 1,
                        per_page: pagination.limit,
                    };
                }
            }
            const response = {
                meta: {
                    error: 0,
                    message,
                    status: true,
                },
                data: responseData,
            };
            if (pageMeta) {
                response.meta.page = pageMeta;
            }
            return response;
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map