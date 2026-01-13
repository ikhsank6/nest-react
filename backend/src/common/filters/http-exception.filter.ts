import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  private readonly isDebug: boolean;

  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.isDebug = this.configService.get<string>('APP_DEBUG', 'false') === 'true';
  }

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

    // Extract stack trace info (only used if debug mode is on)
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

    // Log the error (always log full details for debugging)
    this.logger.error(
      `[${errorId}] ${request.method} ${request.url} - ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // For production (APP_DEBUG=false): hide exception details and use generic message for 500 errors
    if (!this.isDebug) {
      // Hide stack trace info
      file = '';
      line = '';

      // Use generic message for internal server errors (500)
      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        message = 'Hubungi administrator, terjadi kendala pada sistem';
      }
    }

    response.status(status).json({
      meta: {
        error: errorId,
        message,
        status: false,
        // Only include exception details if debug mode is on
        ...(this.isDebug && {
          exception: {
            line,
            file,
          },
        }),
      },
      data: {},
    });
  }
}

