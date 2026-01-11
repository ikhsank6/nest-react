import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
    protected errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.';
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

        // Use IP + email combination as key for more precise rate limiting
        const ip = request.ip || request.connection?.remoteAddress || 'unknown';
        const email = request.body?.email || 'unknown';
        const key = `login_${ip}_${email}`;

        // Get limit and TTL from global configuration (set via environment variables)
        const config = Array.isArray(this.throttlerOptions)
            ? this.throttlerOptions.find(c => c.name === 'login') || this.throttlerOptions[0]
            : (this.throttlerOptions as any).throttlers?.[0] || { limit: 5, ttl: 60000 };

        const limit = config?.limit || 5;
        const ttl = config?.ttl || 60000;

        const { totalHits } = await this.storageService.increment(key, ttl, limit, ttl, 'login');

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
