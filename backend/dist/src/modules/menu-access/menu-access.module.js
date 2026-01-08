"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuAccessModule = void 0;
const common_1 = require("@nestjs/common");
const menu_access_controller_1 = require("./menu-access.controller");
const menu_access_service_1 = require("./menu-access.service");
let MenuAccessModule = class MenuAccessModule {
};
exports.MenuAccessModule = MenuAccessModule;
exports.MenuAccessModule = MenuAccessModule = __decorate([
    (0, common_1.Module)({
        controllers: [menu_access_controller_1.MenuAccessController],
        providers: [menu_access_service_1.MenuAccessService],
        exports: [menu_access_service_1.MenuAccessService],
    })
], MenuAccessModule);
//# sourceMappingURL=menu-access.module.js.map