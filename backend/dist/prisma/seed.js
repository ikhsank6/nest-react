"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
async function main() {
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Administrator dengan akses penuh',
        },
    });
    const userRole = await prisma.role.upsert({
        where: { name: 'User' },
        update: {},
        create: {
            name: 'User',
            description: 'User biasa dengan akses terbatas',
        },
    });
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Administrator',
            roleId: adminRole.id,
        },
    });
    const dashboardMenu = await prisma.menu.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Dashboard',
            path: '/dashboard',
            icon: 'LayoutDashboard',
            order: 1,
        },
    });
    const masterMenu = await prisma.menu.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Master Data',
            icon: 'Database',
            order: 2,
        },
    });
    const usersMenu = await prisma.menu.upsert({
        where: { id: 3 },
        update: {},
        create: {
            name: 'Users',
            path: '/users',
            icon: 'Users',
            parentId: masterMenu.id,
            order: 1,
        },
    });
    const rolesMenu = await prisma.menu.upsert({
        where: { id: 4 },
        update: {},
        create: {
            name: 'Roles',
            path: '/roles',
            icon: 'Shield',
            parentId: masterMenu.id,
            order: 2,
        },
    });
    const menusMenu = await prisma.menu.upsert({
        where: { id: 5 },
        update: {},
        create: {
            name: 'Menus',
            path: '/menus',
            icon: 'Menu',
            parentId: masterMenu.id,
            order: 3,
        },
    });
    const menuAccessMenu = await prisma.menu.upsert({
        where: { id: 6 },
        update: {},
        create: {
            name: 'Menu Access',
            path: '/menu-access',
            icon: 'Lock',
            parentId: masterMenu.id,
            order: 4,
        },
    });
    const menus = [dashboardMenu, masterMenu, usersMenu, rolesMenu, menusMenu, menuAccessMenu];
    for (const menu of menus) {
        await prisma.menuAccess.upsert({
            where: {
                roleId_menuId: {
                    roleId: adminRole.id,
                    menuId: menu.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                menuId: menu.id,
                canView: true,
                canCreate: true,
                canEdit: true,
                canDelete: true,
            },
        });
    }
    await prisma.menuAccess.upsert({
        where: {
            roleId_menuId: {
                roleId: userRole.id,
                menuId: dashboardMenu.id,
            },
        },
        update: {},
        create: {
            roleId: userRole.id,
            menuId: dashboardMenu.id,
            canView: true,
            canCreate: false,
            canEdit: false,
            canDelete: false,
        },
    });
    console.log('Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map