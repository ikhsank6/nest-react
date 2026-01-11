import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
    protected errorMessage = 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.';
    private throttlerOptions: ThrottlerModuleOptions;

    constructor(
        options: ThrottlerModuleOptions,
        storageService: ThrottlerStorage,
        reflector: Reflector,
    ) {
        super(options, storageService, reflector);
        this.throttlerOptions = options;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Use IP address as key for rate limiting
        const ip = request.ip || request.connection?.remoteAddress || 'unknown';
        const key = `auth_${ip}`;

        // Get limit and TTL from global configuration (set via environment variables)
        // Use 'auth' config if available, otherwise fallback to 'login' config
        const config = Array.isArray(this.throttlerOptions)
            ? this.throttlerOptions.find(c => c.name === 'auth') || this.throttlerOptions.find(c => c.name === 'login') || this.throttlerOptions[0]
            : (this.throttlerOptions as any).throttlers?.[0] || { limit: 10, ttl: 60000 };

        const limit = config?.limit || 10;
        const ttl = config?.ttl || 60000;

        const { totalHits } = await this.storageService.increment(key, ttl, limit, ttl, 'auth');

        if (totalHits > limit) {
            throw new ThrottlerException(this.errorMessage);
        }

        return true;
    }

    protected getTracker(req: Record<string, any>): Promise<string> {
        // Use IP address as default tracker
        return Promise.resolve(req.ip || req.connection?.remoteAddress || 'unknown');
    }
}
