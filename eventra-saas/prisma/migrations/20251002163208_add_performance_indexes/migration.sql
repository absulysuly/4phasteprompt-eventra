-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_city_idx" ON "Event"("city");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "Event"("createdAt");

-- CreateIndex
CREATE INDEX "EventTranslation_eventId_idx" ON "EventTranslation"("eventId");

-- CreateIndex
CREATE INDEX "EventTranslation_locale_idx" ON "EventTranslation"("locale");

-- CreateIndex
CREATE INDEX "Venue_type_idx" ON "Venue"("type");

-- CreateIndex
CREATE INDEX "Venue_status_idx" ON "Venue"("status");

-- CreateIndex
CREATE INDEX "Venue_category_idx" ON "Venue"("category");

-- CreateIndex
CREATE INDEX "Venue_city_idx" ON "Venue"("city");

-- CreateIndex
CREATE INDEX "Venue_userId_idx" ON "Venue"("userId");

-- CreateIndex
CREATE INDEX "Venue_featured_idx" ON "Venue"("featured");

-- CreateIndex
CREATE INDEX "Venue_verified_idx" ON "Venue"("verified");

-- CreateIndex
CREATE INDEX "Venue_createdAt_idx" ON "Venue"("createdAt");

-- CreateIndex
CREATE INDEX "Venue_type_status_idx" ON "Venue"("type", "status");

-- CreateIndex
CREATE INDEX "Venue_category_city_idx" ON "Venue"("category", "city");

-- CreateIndex
CREATE INDEX "Venue_latitude_longitude_idx" ON "Venue"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "VenueTranslation_venueId_idx" ON "VenueTranslation"("venueId");

-- CreateIndex
CREATE INDEX "VenueTranslation_locale_idx" ON "VenueTranslation"("locale");
