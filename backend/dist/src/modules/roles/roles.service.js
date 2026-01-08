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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const sanitize_util_1 = require("../../common/utils/sanitize.util");
function sanitizeRole(role) {
    const { id, deletedAt, menuAccess, ...rest } = role;
    return {
        ...rest,
        ...(menuAccess && {
            menuAccess: menuAccess.map((access) => {
                const { id: accessId, roleId, menuId, menu, ...accessRest } = access;
                return {
                    ...accessRest,
                    menu: menu ? (0, sanitize_util_1.excludeFields)(menu, ['id', 'parentId', 'deletedAt']) : null,
                };
            }),
        }),
    };
}
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const roles = await this.prisma.role.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
        return { message: 'Success', data: roles.map((role) => (0, sanitize_util_1.excludeFields)(role, ['id', 'deletedAt'])) };
    }
    async findOne(uuid) {
        const role = await this.prisma.role.findFirst({
            where: { uuid, deletedAt: null },
            include: { menuAccess: { include: { menu: true } } },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role tidak ditemukan.');
        }
        return { message: 'Success', data: sanitizeRole(role) };
    }
    async create(createRoleDto) {
        const existingRole = await this.prisma.role.findFirst({
            where: { name: createRoleDto.name, deletedAt: null },
        });
        if (existingRole) {
            throw new common_1.BadRequestException('Nama role sudah ada.');
        }
        const role = await this.prisma.role.create({ data: createRoleDto });
        return { message: 'Role berhasil dibuat.', data: (0, sanitize_util_1.excludeFields)(role, ['id', 'deletedAt']) };
    }
    async update(uuid, updateRoleDto) {
        const existing = await this.prisma.role.findFirst({
            where: { uuid, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Role tidak ditemukan.');
        }
        if (updateRoleDto.name) {
            const existingRole = await this.prisma.role.findFirst({
                where: { name: updateRoleDto.name, id: { not: existing.id }, deletedAt: null },
            });
            if (existingRole) {
                throw new common_1.BadRequestException('Nama role sudah digunakan.');
            }
        }
        const role = await this.prisma.role.update({
            where: { id: existing.id },
            data: updateRoleDto,
        });
        return { message: 'Role berhasil diupdate.', data: (0, sanitize_util_1.excludeFields)(role, ['id', 'deletedAt']) };
    }
    async remove(uuid) {
        const existing = await this.prisma.role.findFirst({
            where: { uuid, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Role tidak ditemukan.');
        }
        const usersWithRole = await this.prisma.user.count({
            where: { roleId: existing.id, deletedAt: null },
        });
        if (usersWithRole > 0) {
            throw new common_1.BadRequestException('Role masih digunakan oleh user.');
        }
        await this.prisma.role.update({
            where: { id: existing.id },
            data: { deletedAt: new Date() },
        });
        return { message: 'Role berhasil dihapus.', data: {} };
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map