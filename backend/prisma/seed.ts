import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Administrator dengan akses penuh',
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'User biasa dengan akses terbatas',
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      isActive: true,
      verifiedAt: new Date(),
      updatedBy: 'System',
    },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Administrator',
      roleId: adminRole.id,
      isActive: true,
      verifiedAt: new Date(),
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // Create menus
  const dashboardMenu = await prisma.menu.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      order: 1,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  const masterMenu = await prisma.menu.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Master Data',
      icon: 'Database',
      order: 2,
      createdBy: 'System',
      updatedBy: 'System',
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
      createdBy: 'System',
      updatedBy: 'System',
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
      createdBy: 'System',
      updatedBy: 'System',
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
      createdBy: 'System',
      updatedBy: 'System',
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
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // Create menu access for admin
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
        createdBy: 'System',
        updatedBy: 'System',
      },
    });
  }

  // Create limited menu access for user role (only dashboard)
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
      createdBy: 'System',
      updatedBy: 'System',
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
