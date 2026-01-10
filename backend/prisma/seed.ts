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
    update: {
      path: '/master-data/users',
    },
    create: {
      name: 'Users',
      path: '/master-data/users',
      icon: 'Users',
      parentId: masterMenu.id,
      order: 1,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  const rolesMenu = await prisma.menu.upsert({
    where: { id: 4 },
    update: {
      path: '/master-data/roles',
    },
    create: {
      name: 'Roles',
      path: '/master-data/roles',
      icon: 'Shield',
      parentId: masterMenu.id,
      order: 2,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  const menusMenu = await prisma.menu.upsert({
    where: { id: 5 },
    update: {
      path: '/master-data/menus',
    },
    create: {
      name: 'Menus',
      path: '/master-data/menus',
      icon: 'Menu',
      parentId: masterMenu.id,
      order: 3,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // Create CMS parent menu
  const cmsMenu = await prisma.menu.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name: 'CMS',
      icon: 'FileText',
      order: 3,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  const carouselMenu = await prisma.menu.upsert({
    where: { id: 7 },
    update: {
      path: '/cms/carousel',
    },
    create: {
      name: 'Carousel',
      path: '/cms/carousel',
      icon: 'Image',
      parentId: cmsMenu.id,
      order: 1,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  const newsCategoryMenu = await prisma.menu.upsert({
    where: { id: 8 },
    update: {
      path: '/cms/news-category',
    },
    create: {
      name: 'News Categories',
      path: '/cms/news-category',
      icon: 'FolderOpen',
      parentId: cmsMenu.id,
      order: 2,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  const newsMenu = await prisma.menu.upsert({
    where: { id: 9 },
    update: {
      path: '/cms/news',
    },
    create: {
      name: 'News',
      path: '/cms/news',
      icon: 'Newspaper',
      parentId: cmsMenu.id,
      order: 3,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  const aboutUsMenu = await prisma.menu.upsert({
    where: { id: 10 },
    update: {
      path: '/cms/about-us',
    },
    create: {
      name: 'About Us',
      path: '/cms/about-us',
      icon: 'Info',
      parentId: cmsMenu.id,
      order: 4,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // Create menu access for admin (including CMS menus)
  const menus = [
    dashboardMenu,
    masterMenu,
    usersMenu,
    rolesMenu,
    menusMenu,
    cmsMenu,
    carouselMenu,
    newsCategoryMenu,
    newsMenu,
    aboutUsMenu,
  ];
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

