import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

// Helper to check if response has pagination
function isPaginatedResponse(data: any): boolean {
  return data && typeof data === 'object' && 'pagination' in data;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const expressResponse = http.getResponse();

    // Bypass ALL interceptor logic for binary streams
    if (request.url?.includes('/profile/avatar/') || request.originalUrl?.includes('/profile/avatar/')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((result) => {
        // If headers are already sent (e.g., by res.sendFile), stop processing entirely
        if (expressResponse.headersSent) {
          return result;
        }

        const contentType = expressResponse.getHeader('content-type');

        // Don't format StreamableFile, Buffer, or if Content-Type is already an image/file
        if (
          result instanceof StreamableFile || 
          result instanceof Buffer || 
          (contentType && (contentType.toString().includes('image/') || contentType.toString().includes('application/octet-stream'))) ||
          result?.constructor?.name === 'StreamableFile' ||
          (result && typeof result === 'object' && ('getStream' in result || 'stream' in result))
        ) {
          return result;
        }

        const message = result?.message || null;
        let responseData = result?.data !== undefined ? result.data : result;
        let pageMeta: PaginationMeta | undefined;

        // Handle paginated responses
        if (isPaginatedResponse(responseData)) {
          const { pagination, ...restData } = responseData;
          
          // Get the first key that's an array (the actual data)
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

        // Build response
        const response: ApiResponse<T> = {
          meta: {
            error: 0,
            message,
            status: true,
          },
          data: responseData,
        };

        // Add pagination if present
        if (pageMeta) {
          response.meta.page = pageMeta;
        }

        return response;
      }),
    );
  }
}
