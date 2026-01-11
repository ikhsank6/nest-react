/*
  Warnings:

  - You are about to drop the column `content` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `about_us` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `about_us` table. All the data in the column will be lost.
  - Added the required column `company_name` to the `about_us` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `about_us` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `about_us` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "about_us_section_key";

-- AlterTable
ALTER TABLE "about_us" DROP COLUMN "content",
DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "deletedAt",
DROP COLUMN "deletedBy",
DROP COLUMN "image",
DROP COLUMN "isActive",
DROP COLUMN "order",
DROP COLUMN "section",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "company_name" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "latitude" DECIMAL(10,8),
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "longitude" DECIMAL(11,8),
ADD COLUMN     "map_embed" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "youtube" TEXT;
