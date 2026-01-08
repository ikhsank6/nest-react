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
exports.MenuAccessItemDto = exports.BulkMenuAccessDto = exports.UpdateMenuAccessDto = exports.CreateMenuAccessDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateMenuAccessDto {
    roleId;
    menuId;
    canView;
    canCreate;
    canEdit;
    canDelete;
}
exports.CreateMenuAccessDto = CreateMenuAccessDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'roleId harus diisi.' }),
    (0, class_validator_1.IsInt)({ message: 'roleId harus berupa angka.' }),
    __metadata("design:type", Number)
], CreateMenuAccessDto.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'menuId harus diisi.' }),
    (0, class_validator_1.IsInt)({ message: 'menuId harus berupa angka.' }),
    __metadata("design:type", Number)
], CreateMenuAccessDto.prototype, "menuId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'canView harus boolean.' }),
    __metadata("design:type", Boolean)
], CreateMenuAccessDto.prototype, "canView", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'canCreate harus boolean.' }),
    __metadata("design:type", Boolean)
], CreateMenuAccessDto.prototype, "canCreate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'canEdit harus boolean.' }),
    __metadata("design:type", Boolean)
], CreateMenuAccessDto.prototype, "canEdit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'canDelete harus boolean.' }),
    __metadata("design:type", Boolean)
], CreateMenuAccessDto.prototype, "canDelete", void 0);
class UpdateMenuAccessDto {
    canView;
    canCreate;
    canEdit;
    canDelete;
}
exports.UpdateMenuAccessDto = UpdateMenuAccessDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'canView harus boolean.' }),
    __metadata("design:type", Boolean)
], UpdateMenuAccessDto.prototype, "canView", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'canCreate harus boolean.' }),
    __metadata("design:type", Boolean)
], UpdateMenuAccessDto.prototype, "canCreate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'canEdit harus boolean.' }),
    __metadata("design:type", Boolean)
], UpdateMenuAccessDto.prototype, "canEdit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'canDelete harus boolean.' }),
    __metadata("design:type", Boolean)
], UpdateMenuAccessDto.prototype, "canDelete", void 0);
class BulkMenuAccessDto {
    roleId;
    menuAccess;
}
exports.BulkMenuAccessDto = BulkMenuAccessDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'roleId harus diisi.' }),
    (0, class_validator_1.IsInt)({ message: 'roleId harus berupa angka.' }),
    __metadata("design:type", Number)
], BulkMenuAccessDto.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'menuAccess harus array.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MenuAccessItemDto),
    __metadata("design:type", Array)
], BulkMenuAccessDto.prototype, "menuAccess", void 0);
class MenuAccessItemDto {
    menuId;
    canView;
    canCreate;
    canEdit;
    canDelete;
}
exports.MenuAccessItemDto = MenuAccessItemDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'menuId harus diisi.' }),
    (0, class_validator_1.IsInt)({ message: 'menuId harus berupa angka.' }),
    __metadata("design:type", Number)
], MenuAccessItemDto.prototype, "menuId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MenuAccessItemDto.prototype, "canView", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MenuAccessItemDto.prototype, "canCreate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MenuAccessItemDto.prototype, "canEdit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MenuAccessItemDto.prototype, "canDelete", void 0);
//# sourceMappingURL=menu-access.dto.js.map