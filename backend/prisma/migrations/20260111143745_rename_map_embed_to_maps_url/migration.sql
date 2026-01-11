/*
  Warnings:

  - You are about to drop the column `map_embed` on the `about_us` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "about_us" DROP COLUMN "map_embed",
ADD COLUMN     "maps_url" TEXT;
