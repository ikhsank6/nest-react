-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "toRoleId" INTEGER NOT NULL,
    "fromUserId" INTEGER,
    "message" TEXT NOT NULL,
    "detailUrl" TEXT,
    "referenceId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notifications_uuid_key" ON "notifications"("uuid");

-- CreateIndex
CREATE INDEX "notifications_toRoleId_idx" ON "notifications"("toRoleId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
