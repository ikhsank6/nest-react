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
exports.MenuAccessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MenuAccessService = class MenuAccessService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByRole(roleId) {
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            throw new common_1.NotFoundException('Role tidak ditemukan.');
        }
        const menuAccess = await this.prisma.menuAccess.findMany({
            where: { roleId },
            include: { menu: true },
            orderBy: { menu: { order: 'asc' } },
        });
        return { message: 'Success', data: menuAccess };
    }
    async getAccessibleMenus(roleId) {
        const menuAccess = await this.prisma.menuAccess.findMany({
            where: { roleId, canView: true },
            include: {
                menu: {
                    include: {
                        children: {
                            where: { isActive: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        const accessibleMenuIds = menuAccess.map((ma) => ma.menuId);
        const rootMenus = await this.prisma.menu.findMany({
            where: {
                parentId: null,
                isActive: true,
                id: { in: accessibleMenuIds },
            },
            include: {
                children: {
                    where: {
                        isActive: true,
                        id: { in: accessibleMenuIds },
                    },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        });
        return { message: 'Success', data: rootMenus };
    }
    async create(createMenuAccessDto) {
        const existing = await this.prisma.menuAccess.findUnique({
            where: {
                roleId_menuId: {
                    roleId: createMenuAccessDto.roleId,
                    menuId: createMenuAccessDto.menuId,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Menu access sudah ada.');
        }
        const menuAccess = await this.prisma.menuAccess.create({
            data: createMenuAccessDto,
            include: { menu: true, role: true },
        });
        return { message: 'Menu access berhasil dibuat.', data: menuAccess };
    }
    async update(id, updateMenuAccessDto) {
        const existing = await this.prisma.menuAccess.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Menu access tidak ditemukan.');
        }
        const menuAccess = await this.prisma.menuAccess.update({
            where: { id },
            data: updateMenuAccessDto,
            include: { menu: true, role: true },
        });
        return { message: 'Menu access berhasil diupdate.', data: menuAccess };
    }
    async bulkUpdate(bulkDto) {
        const { roleId, menuAccess } = bulkDto;
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            throw new common_1.NotFoundException('Role tidak ditemukan.');
        }
        await this.prisma.menuAccess.deleteMany({ where: { roleId } });
        const data = menuAccess.map((item) => ({
            roleId,
            menuId: item.menuId,
            canView: item.canView ?? true,
            canCreate: item.canCreate ?? false,
            canEdit: item.canEdit ?? false,
            canDelete: item.canDelete ?? false,
        }));
        await this.prisma.menuAccess.createMany({ data });
        return { message: 'Menu access berhasil diupdate.', data: {} };
    }
    async remove(id) {
        const existing = await this.prisma.menuAccess.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Menu access tidak ditemukan.');
        }
        await this.prisma.menuAccess.delete({ where: { id } });
        return { message: 'Menu access berhasil dihapus.', data: {} };
    }
};
exports.MenuAccessService = MenuAccessService;
exports.MenuAccessService = MenuAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuAccessService);
//# sourceMappingURL=menu-access.service.js.map