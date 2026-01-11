-- AlterTable
ALTER TABLE "carousels" ADD COLUMN     "mediaId" INTEGER,
ALTER COLUMN "image" DROP NOT NULL;

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_uuid_key" ON "media"("uuid");

-- AddForeignKey
ALTER TABLE "carousels" ADD CONSTRAINT "carousels_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
