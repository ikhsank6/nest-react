"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const error_id_util_1 = require("../utils/error-id.util");
const logger_service_1 = require("../../logger/logger.service");
let HttpExceptionFilter = class HttpExceptionFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const errorId = (0, error_id_util_1.generateErrorId)();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Terjadi kesalahan pada server';
        let file = '';
        let line = '';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (Array.isArray(exceptionResponse.message)) {
                message = exceptionResponse.message[0];
            }
            else {
                message = exceptionResponse.message || exception.message;
            }
        }
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
        this.logger.error(`[${errorId}] ${request.method} ${request.url} - ${message}`, exception instanceof Error ? exception.stack : String(exception));
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
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map