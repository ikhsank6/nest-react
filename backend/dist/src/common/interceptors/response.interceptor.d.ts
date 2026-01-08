import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface PaginationMeta {
    total: number;
    current_page: number;
    from: number;
    per_page: number;
}
export interface ResponseMeta {
    error: number;
    message: string | null;
    status: boolean;
    page?: PaginationMeta;
}
export interface ApiResponse<T> {
    meta: ResponseMeta;
    data: T;
}
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>>;
}
