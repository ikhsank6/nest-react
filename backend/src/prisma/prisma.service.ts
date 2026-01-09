import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getRequestContext } from '../common/context/request-context.storage';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly extendedClient: any;

  constructor() {
    super();
    this.extendedClient = this.$extends({
      query: {
        $allModels: {
          async create({ args, query }) {
            const context = getRequestContext();
            const userName = context?.userName || 'System';
            args.data = {
              ...args.data,
              createdBy: (args.data as any).createdBy || userName,
              updatedBy: (args.data as any).updatedBy || userName,
            };
            return query(args);
          },
          async createMany({ args, query }) {
            const context = getRequestContext();
            const userName = context?.userName || 'System';
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({
                ...item,
                createdBy: item.createdBy || userName,
                updatedBy: item.updatedBy || userName,
              }));
            }
            return query(args);
          },
          async update({ args, query }) {
            const context = getRequestContext();
            const userName = context?.userName || 'System';
            if ((args.data as any).deletedAt) {
              (args.data as any).deletedBy = userName;
            } else {
              (args.data as any).updatedBy = userName;
            }
            return query(args);
          },
          async updateMany({ args, query }) {
            const context = getRequestContext();
            const userName = context?.userName || 'System';
            if ((args.data as any).deletedAt) {
              (args.data as any).deletedBy = userName;
            } else {
              (args.data as any).updatedBy = userName;
            }
            return query(args);
          },
          async upsert({ args, query }) {
            const context = getRequestContext();
            const userName = context?.userName || 'System';
            args.create = {
              ...args.create,
              createdBy: (args.create as any).createdBy || userName,
              updatedBy: (args.create as any).updatedBy || userName,
            };
            args.update = {
              ...args.update,
              updatedBy: (args.update as any).updatedBy || userName,
            };
            return query(args);
          },
        },
      },
    });

    // Proxy calls to the extended client to maintain compatibility with existing services
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target.extendedClient) {
          return target.extendedClient[prop];
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as any;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
