import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getRequestContext } from '../common/context/request-context.storage';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    // Global Audit Middleware
    (this as any).$use(async (params, next) => {
      const context = getRequestContext();
      const userName = context?.userName || 'System';

      if (params.action === 'create') {
        params.args.data = {
          ...params.args.data,
          createdBy: params.args.data.createdBy || userName,
          updatedBy: params.args.data.updatedBy || userName,
        };
      } else if (params.action === 'createMany') {
        if (Array.isArray(params.args.data)) {
          params.args.data = params.args.data.map((item) => ({
            ...item,
            createdBy: item.createdBy || userName,
            updatedBy: item.updatedBy || userName,
          }));
        }
      } else if (params.action === 'update' || params.action === 'updateMany') {
        if (params.args.data.deletedAt) {
          // Soft delete detection
          params.args.data.deletedBy = userName;
        } else {
          // Regular update
          params.args.data.updatedBy = userName;
        }
      } else if (params.action === 'upsert') {
        params.args.create = {
          ...params.args.create,
          createdBy: params.args.create.createdBy || userName,
          updatedBy: params.args.create.updatedBy || userName,
        };
        params.args.update = {
          ...params.args.update,
          updatedBy: params.args.update.updatedBy || userName,
        };
      }

      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
