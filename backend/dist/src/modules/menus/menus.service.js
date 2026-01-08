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
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const sanitize_util_1 = require("../../common/utils/sanitize.util");
const sanitizeMenu = (menu) => (0, sanitize_util_1.excludeFieldsDeep)(menu, ['id', 'parentId', 'deletedAt'], ['children', 'parent']);
let MenusService = class MenusService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const menus = await this.prisma.menu.findMany({
            where: { parentId: null, deletedAt: null },
            include: {
                children: {
                    where: { deletedAt: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            where: { deletedAt: null },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
            orderBy: { order: 'asc' },
        });
        return { message: 'Success', data: menus.map(sanitizeMenu) };
    }
    async findOne(uuid) {
        const menu = await this.prisma.menu.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                children: { where: { deletedAt: null } },
                parent: true,
            },
        });
        if (!menu) {
            throw new common_1.NotFoundException('Menu tidak ditemukan.');
        }
        return { message: 'Success', data: sanitizeMenu(menu) };
    }
    async create(createMenuDto) {
        if (createMenuDto.parentUuid) {
            const parent = await this.prisma.menu.findFirst({
                where: { uuid: createMenuDto.parentUuid, deletedAt: null },
            });
            if (!parent) {
                throw new common_1.BadRequestException('Parent menu tidak ditemukan.');
            }
            const { parentUuid, ...dataWithoutParentUuid } = createMenuDto;
            const menu = await this.prisma.menu.create({
                data: { ...dataWithoutParentUuid, parentId: parent.id },
                include: { parent: true },
            });
            return { message: 'Menu berhasil dibuat.', data: sanitizeMenu(menu) };
        }
        const { parentUuid, ...data } = createMenuDto;
        const menu = await this.prisma.menu.create({
            data,
            include: { parent: true },
        });
        return { message: 'Menu berhasil dibuat.', data: sanitizeMenu(menu) };
    }
    async update(uuid, updateMenuDto) {
        const existing = await this.prisma.menu.findFirst({
            where: { uuid, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Menu tidak ditemukan.');
        }
        let parentId = undefined;
        if (updateMenuDto.parentUuid !== undefined) {
            if (updateMenuDto.parentUuid === null) {
                parentId = null;
            }
            else if (updateMenuDto.parentUuid === uuid) {
                throw new common_1.BadRequestException('Menu tidak bisa menjadi parent sendiri.');
            }
            else {
                const parent = await this.prisma.menu.findFirst({
                    where: { uuid: updateMenuDto.parentUuid, deletedAt: null },
                });
                if (!parent) {
                    throw new common_1.BadRequestException('Parent menu tidak ditemukan.');
                }
                parentId = parent.id;
            }
        }
        const { parentUuid, ...dataWithoutParentUuid } = updateMenuDto;
        const menu = await this.prisma.menu.update({
            where: { id: existing.id },
            data: {
                ...dataWithoutParentUuid,
                ...(parentId !== undefined && { parentId }),
            },
            include: { parent: true },
        });
        return { message: 'Menu berhasil diupdate.', data: sanitizeMenu(menu) };
    }
    async remove(uuid) {
        const existing = await this.prisma.menu.findFirst({
            where: { uuid, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Menu tidak ditemukan.');
        }
        const children = await this.prisma.menu.count({
            where: { parentId: existing.id, deletedAt: null },
        });
        if (children > 0) {
            throw new common_1.BadRequestException('Menu masih memiliki child menu.');
        }
        await this.prisma.menu.update({
            where: { id: existing.id },
            data: { deletedAt: new Date() },
        });
        return { message: 'Menu berhasil dihapus.', data: {} };
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusService);
//# sourceMappingURL=menus.service.js.map