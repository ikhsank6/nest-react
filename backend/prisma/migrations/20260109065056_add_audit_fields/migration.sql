/*
  Warnings:

  - You are about to drop the column `canCreate` on the `menu_access` table. All the data in the column will be lost.
  - You are about to drop the column `canDelete` on the `menu_access` table. All the data in the column will be lost.
  - You are about to drop the column `canEdit` on the `menu_access` table. All the data in the column will be lost.
  - You are about to drop the column `canView` on the `menu_access` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menu_access" DROP COLUMN "canCreate",
DROP COLUMN "canDelete",
DROP COLUMN "canEdit",
DROP COLUMN "canView",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "menus" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;
