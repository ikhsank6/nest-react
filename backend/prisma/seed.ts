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

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      isActive: true,
      verifiedAt: new Date(),
    },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Administrator',
      roleId: adminRole.id,
      isActive: true,
      verifiedAt: new Date(),
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
