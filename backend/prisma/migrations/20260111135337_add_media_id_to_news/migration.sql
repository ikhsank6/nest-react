-- AlterTable
ALTER TABLE "news" ADD COLUMN     "mediaId" INTEGER;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
