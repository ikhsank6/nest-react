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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const hash_util_1 = require("../../common/utils/hash.util");
const sanitize_util_1 = require("../../common/utils/sanitize.util");
const pagination_util_1 = require("../../common/utils/pagination.util");
function sanitizeUser(user) {
    const { id, password, roleId, role, ...rest } = user;
    return {
        ...rest,
        role: role ? (0, sanitize_util_1.excludeFields)(role, ['id', 'deletedAt']) : null,
    };
}
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 10) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: { deletedAt: null },
                skip,
                take: limit,
                include: { role: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where: { deletedAt: null } }),
        ]);
        return (0, pagination_util_1.buildPaginatedResponse)(users.map(sanitizeUser), total, page, limit);
    }
    async findOne(uuid) {
        const user = await this.prisma.user.findFirst({
            where: { uuid, deletedAt: null },
            include: { role: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User tidak ditemukan.');
        }
        return { message: 'Success', data: sanitizeUser(user) };
    }
    async findById(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: { role: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User tidak ditemukan.');
        }
        return { message: 'Success', data: sanitizeUser(user) };
    }
    async create(createUserDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: { email: createUserDto.email, deletedAt: null },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email sudah terdaftar.');
        }
        const hashedPassword = await (0, hash_util_1.hashPassword)(createUserDto.password);
        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
            include: { role: true },
        });
        return { message: 'User berhasil dibuat.', data: sanitizeUser(user) };
    }
    async update(uuid, updateUserDto) {
        const existing = await this.prisma.user.findFirst({
            where: { uuid, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException('User tidak ditemukan.');
        }
        if (updateUserDto.email) {
            const existingUser = await this.prisma.user.findFirst({
                where: { email: updateUserDto.email, id: { not: existing.id }, deletedAt: null },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('Email sudah digunakan.');
            }
        }
        const data = { ...updateUserDto };
        if (updateUserDto.password) {
            data.password = await (0, hash_util_1.hashPassword)(updateUserDto.password);
        }
        const user = await this.prisma.user.update({
            where: { id: existing.id },
            data,
            include: { role: true },
        });
        return { message: 'User berhasil diupdate.', data: sanitizeUser(user) };
    }
    async remove(uuid) {
        const existing = await this.prisma.user.findFirst({
            where: { uuid, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException('User tidak ditemukan.');
        }
        await this.prisma.user.update({
            where: { id: existing.id },
            data: { deletedAt: new Date() },
        });
        return { message: 'User berhasil dihapus.', data: {} };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map