-- CreateTable
CREATE TABLE "carousels" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "carousels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_categories" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "categoryId" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_us" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "about_us_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carousels_uuid_key" ON "carousels"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_uuid_key" ON "news_categories"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_name_key" ON "news_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_slug_key" ON "news_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_uuid_key" ON "news"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_categoryId_idx" ON "news"("categoryId");

-- CreateIndex
CREATE INDEX "news_isPublished_idx" ON "news"("isPublished");

-- CreateIndex
CREATE INDEX "news_slug_idx" ON "news"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "about_us_uuid_key" ON "about_us"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "about_us_section_key" ON "about_us"("section");

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "news_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
