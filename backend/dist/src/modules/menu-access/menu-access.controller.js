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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuAccessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const menu_access_service_1 = require("./menu-access.service");
const menu_access_dto_1 = require("./dto/menu-access.dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let MenuAccessController = class MenuAccessController {
    menuAccessService;
    constructor(menuAccessService) {
        this.menuAccessService = menuAccessService;
    }
    async getMyMenus(req) {
        return this.menuAccessService.getAccessibleMenus(req.user.role.id);
    }
    async findByRole(roleId) {
        return this.menuAccessService.findByRole(roleId);
    }
    async create(createMenuAccessDto) {
        return this.menuAccessService.create(createMenuAccessDto);
    }
    async bulkUpdate(bulkDto) {
        return this.menuAccessService.bulkUpdate(bulkDto);
    }
    async update(id, updateMenuAccessDto) {
        return this.menuAccessService.update(id, updateMenuAccessDto);
    }
    async remove(id) {
        return this.menuAccessService.remove(id);
    }
};
exports.MenuAccessController = MenuAccessController;
__decorate([
    (0, common_1.Get)('my-menus'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenuAccessController.prototype, "getMyMenus", null);
__decorate([
    (0, common_1.Get)('role/:roleId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MenuAccessController.prototype, "findByRole", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [menu_access_dto_1.CreateMenuAccessDto]),
    __metadata("design:returntype", Promise)
], MenuAccessController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('bulk'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [menu_access_dto_1.BulkMenuAccessDto]),
    __metadata("design:returntype", Promise)
], MenuAccessController.prototype, "bulkUpdate", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, menu_access_dto_1.UpdateMenuAccessDto]),
    __metadata("design:returntype", Promise)
], MenuAccessController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MenuAccessController.prototype, "remove", null);
exports.MenuAccessController = MenuAccessController = __decorate([
    (0, swagger_1.ApiTags)('Menu Access'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('menu-access'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [menu_access_service_1.MenuAccessService])
], MenuAccessController);
//# sourceMappingURL=menu-access.controller.js.map