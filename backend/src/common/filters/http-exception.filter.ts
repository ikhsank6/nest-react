import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { generateErrorId } from '../utils/error-id.util';
import { LoggerService } from '../../logger/logger.service';

interface ExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorId = generateErrorId();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada server';
    let file = '';
    let line = '';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as ExceptionResponse;
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (Array.isArray(exceptionResponse.message)) {
        message = exceptionResponse.message[0];
      } else {
        message = exceptionResponse.message || exception.message;
      }
    }

    // Extract stack trace info
    if (exception instanceof Error && exception.stack) {
      const stackLines = exception.stack.split('\n');
      if (stackLines.length > 1) {
        const match = stackLines[1].match(/at .* \((.+):(\d+):\d+\)/);
        if (match) {
          file = match[1].split('/').pop() || '';
          line = match[2];
        }
      }
    }

    // Log the error
    this.logger.error(
      `[${errorId}] ${request.method} ${request.url} - ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      meta: {
        error: errorId,
        message,
        status: false,
        exception: {
          line,
          file,
        },
      },
      data: {},
    });
  }
}
