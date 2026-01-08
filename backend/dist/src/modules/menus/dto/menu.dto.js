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
exports.UpdateMenuDto = exports.CreateMenuDto = void 0;
const class_validator_1 = require("class-validator");
class CreateMenuDto {
    name;
    path;
    icon;
    parentUuid;
    order;
    isActive;
}
exports.CreateMenuDto = CreateMenuDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'nama menu harus diisi.' }),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "path", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'parentUuid harus berupa string.' }),
    (0, class_validator_1.IsUUID)('4', { message: 'parentUuid harus berupa UUID yang valid.' }),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "parentUuid", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'order harus berupa angka.' }),
    __metadata("design:type", Number)
], CreateMenuDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isActive harus boolean.' }),
    __metadata("design:type", Boolean)
], CreateMenuDto.prototype, "isActive", void 0);
class UpdateMenuDto {
    name;
    path;
    icon;
    parentUuid;
    order;
    isActive;
}
exports.UpdateMenuDto = UpdateMenuDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'nama menu harus diisi.' }),
    __metadata("design:type", String)
], UpdateMenuDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMenuDto.prototype, "path", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMenuDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'parentUuid harus berupa string.' }),
    __metadata("design:type", Object)
], UpdateMenuDto.prototype, "parentUuid", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'order harus berupa angka.' }),
    __metadata("design:type", Number)
], UpdateMenuDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isActive harus boolean.' }),
    __metadata("design:type", Boolean)
], UpdateMenuDto.prototype, "isActive", void 0);
//# sourceMappingURL=menu.dto.js.map