/*
  Warnings:

  - You are about to drop the column `description` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Event` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "EventTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "EventTranslation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "category" TEXT,
    "imageUrl" TEXT,
    "whatsappGroup" TEXT,
    "whatsappPhone" TEXT,
    "contactMethod" TEXT,
    "sourceUrl" TEXT,
    "publicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("category", "contactMethod", "createdAt", "date", "id", "publicId", "updatedAt", "userId", "whatsappGroup") SELECT "category", "contactMethod", "createdAt", "date", "id", "publicId", "updatedAt", "userId", "whatsappGroup" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_publicId_key" ON "Event"("publicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EventTranslation_eventId_locale_key" ON "EventTranslation"("eventId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Content_key_locale_key" ON "Content"("key", "locale");
