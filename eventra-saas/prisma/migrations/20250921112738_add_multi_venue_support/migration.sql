-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "publicId" TEXT NOT NULL,
    "priceRange" TEXT,
    "availability" TEXT,
    "businessEmail" TEXT,
    "businessPhone" TEXT,
    "website" TEXT,
    "socialLinks" TEXT,
    "address" TEXT,
    "city" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "imageUrl" TEXT,
    "galleryUrls" TEXT,
    "videoUrl" TEXT,
    "bookingUrl" TEXT,
    "whatsappPhone" TEXT,
    "contactMethod" TEXT,
    "eventDate" DATETIME,
    "amenities" TEXT,
    "features" TEXT,
    "cuisineType" TEXT,
    "dietaryOptions" TEXT,
    "tags" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Venue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VenueTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "amenities" TEXT,
    "features" TEXT,
    "venueId" TEXT NOT NULL,
    CONSTRAINT "VenueTranslation_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Venue_publicId_key" ON "Venue"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueTranslation_venueId_locale_key" ON "VenueTranslation"("venueId", "locale");
