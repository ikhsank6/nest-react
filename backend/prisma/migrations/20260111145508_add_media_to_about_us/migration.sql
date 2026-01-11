-- AlterTable
ALTER TABLE "about_us" ADD COLUMN     "mediaId" INTEGER;

-- AddForeignKey
ALTER TABLE "about_us" ADD CONSTRAINT "about_us_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
