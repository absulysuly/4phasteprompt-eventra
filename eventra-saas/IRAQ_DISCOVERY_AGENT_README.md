# 🇮🇶 Iraq Discovery Data Collection Agent

**Comprehensive, Continuous Data Collection Pipeline for Iraq Discovery Front-End**

## 📋 Overview

This automated agent collects, normalizes, and exports a complete dataset of places/services across Iraq, organized into 8 main categories. It delivers incremental batches in JSON and CSV formats with complete documentation for front-end integration.

---

## 🎯 Scope & Goals

- ✅ Build a single, clean, API-ready dataset for 8 categories
- ✅ Provide standardized filters and sorting metadata for UI
- ✅ Remove duplicates and normalize all data
- ✅ Geocode all locations with validation
- ✅ Track data provenance and licensing
- ✅ Deliver in incremental batches (JSON + CSV + Documentation)

---

## 🏙️ Priority Locations

1. **Erbil** (first priority)
2. **Baghdad** (second priority)
3. Basra
4. Sulaymaniyah
5. Nineveh (Mosul)
6. Najaf
7. Karbala
8. Duhok
9. Kirkuk

---

## 📂 8 Categories

### 1. **Accommodation**
- Subcategories: Hotels, Hostels, Apartments, Villas, Guesthouses
- Key fields: star_rating, amenities, price_range, check-in/out times
- Filters: star rating, price, amenities, room type

### 2. **Cafe & Restaurants**
- Subcategories: Cafes, Restaurants, Fast Food, Local eateries
- Key fields: cuisine_types, dietary_options, delivery, reservations
- Filters: cuisine, price, dietary options, outdoor seating

### 3. **Events**
- Types: Concerts, Festivals, Exhibitions, Workshops, Sports, Markets
- Key fields: start_datetime, end_datetime, ticket_info, organizer
- Filters: date range, event type, price (free/paid)

### 4. **Tourism**
- Types: Landmark, Picnic Area, Cultural Site, Museum, Park, Hidden Gem
- Key fields: tourism_type, entry_fee, best_visit_time, guided tours
- Filters: type, entry fee, family-friendly

### 5. **Government Offices**
- Types: Passport Office, Municipality, Ministry, Court, Police Station
- Key fields: office_type, services_offered, required_documents
- Filters: service type, appointment required

### 6. **Services**
- Types: Health, Professional, Education, Transport, Telecom, Repair, Financial
- Key fields: primary_service_type, subcategory, online_booking
- Filters: service type, online booking, language

### 7. **Companies**
- Industries: Architecture, Tourism, Trading, Technology, Manufacturing
- Key fields: industry, company_size, services_products
- Filters: industry, company size

### 8. **Shopping**
- Types: Shopping Mall, Retail Store, Bazaar, Boutique, Supermarket
- Key fields: store_type, main_products, payment_methods
- Filters: store type, product categories, payment methods

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required
Node.js >= 18
npm or yarn

# Optional (for real data)
Google Places API Key
```

### Installation
```bash
cd eventra-saas
npm install
```

### Configuration
```bash
# Add to .env (optional, works without API key using mock data)
GOOGLE_PLACES_API_KEY=your_api_key_here
```

### Run Collection

#### Option 1: Collect Erbil (First Batch)
```bash
npm run collect:iraq:erbil
```

#### Option 2: Collect Baghdad (Second Batch)
```bash
npm run collect:iraq:baghdad
```

#### Option 3: Collect All Priority Cities
```bash
npm run collect:iraq:discovery
```

#### Option 4: Continuous Collection (Nonstop)
```bash
npm run collect:iraq:continuous
```

This will run continuously, collecting data for all cities in priority order, with delays between iterations to respect rate limits.

---

## 📊 Output Structure

### Directory Structure
```
data/iraq-discovery-exports/
├── batch-1-erbil/
│   ├── accommodation.json
│   ├── accommodation.csv
│   ├── cafe-restaurants.json
│   ├── cafe-restaurants.csv
│   ├── events.json
│   ├── events.csv
│   ├── tourism.json
│   ├── tourism.csv
│   ├── government-offices.json
│   ├── government-offices.csv
│   ├── services.json
│   ├── services.csv
│   ├── companies.json
│   ├── companies.csv
│   ├── shopping.json
│   ├── shopping.csv
│   ├── master-all-categories.json ← All categories combined
│   ├── MANIFEST.json ← Batch metadata
│   ├── README.md ← Documentation
│   └── mock-api/
│       ├── example-response.json
│       └── postman-collection.json
├── batch-2-baghdad/
│   └── ... (same structure)
└── ...
```

### File Formats

#### JSON Format
```json
{
  "version": "1.0.0",
  "exported_at": "2025-10-02T22:40:00.000Z",
  "count": 25,
  "data": [
    {
      "id": "erbil_accommodation_12345",
      "name": "Example Hotel",
      "canonical_category": "Accommodation",
      "subcategory": "Hotels",
      "tags": ["hotel", "lodging"],
      "address": {
        "street": "Main Street",
        "city": "Erbil",
        "governorate": "erbil"
      },
      "latitude": 36.1911,
      "longitude": 44.0091,
      "phone": "+9647901234567",
      "website": "https://example.com",
      "price_range": "medium",
      "rating": 4.5,
      "rating_count": 120,
      "images": ["https://example.com/photo1.jpg"],
      "description": "A nice hotel in Erbil...",
      "languages_supported": ["en", "ar", "ku"],
      "accessibility": {
        "wheelchair_accessible": true,
        "family_friendly": true
      },
      "source_type": "google_maps",
      "source_url": "https://maps.google.com/...",
      "last_updated": "2025-10-02T22:40:00.000Z",
      "category_data": {
        "star_rating": 4,
        "amenities": ["WiFi", "Pool", "AC", "Breakfast"]
      }
    }
  ]
}
```

#### CSV Format
All universal fields exported as comma-separated values with proper escaping.

---

## 📖 Data Schema

### Universal Fields (All Categories)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `name` | string | ✅ | Place name |
| `canonical_category` | Category | ✅ | One of 8 main categories |
| `subcategory` | string | - | Specific type within category |
| `tags` | string[] | ✅ | Descriptive tags |
| `address` | object | ✅ | Structured address (street, city, governorate) |
| `latitude` | number | ✅ | GPS latitude |
| `longitude` | number | ✅ | GPS longitude |
| `phone` | string | - | Contact phone (normalized to +964) |
| `website` | string | - | Website URL |
| `email` | string | - | Email address |
| `opening_hours` | object | - | Structured weekly hours |
| `price_range` | PriceRange | - | low, medium, high, very_high, free |
| `rating` | number | - | Rating (0-5) |
| `rating_count` | number | - | Number of ratings |
| `images` | string[] | ✅ | Array of image URLs |
| `description` | string | ✅ | Text description |
| `languages_supported` | string[] | ✅ | Supported language codes |
| `accessibility` | object | - | Accessibility flags |
| `source_type` | string | ✅ | Data source (google_maps, manual, etc.) |
| `source_url` | string | - | Original source URL |
| `license` | string | - | Data license |
| `last_updated` | string | ✅ | ISO timestamp |

### Category-Specific Fields

Each record has a `category_data` object containing fields specific to that category. See the schema file for details: `src/lib/dataCollection/iraqDiscoverySchema.ts`

---

## 🔍 Data Quality

### Normalization
- ✅ **Names**: Trimmed and normalized casing
- ✅ **Phones**: Converted to +964 format
- ✅ **Addresses**: Standardized structure
- ✅ **Coordinates**: Validated within Iraq bounds (29-38°N, 38-49°E)
- ✅ **Opening Hours**: Structured format

### Deduplication
- Fuzzy matching by name + coordinates
- Automatic merge of duplicate records
- Source provenance preserved

### Validation
- Required field checks
- Coordinate bounds verification
- Phone number format validation
- URL format validation

### Quality Metrics (per batch)
- Complete records (all required + 3+ optional fields)
- Partial records (only required fields)
- Geocoded records
- Records with images
- Verified records (with ratings)

---

## 🎯 Front-End Integration

### Loading Data

#### Option 1: Direct JSON Load
```javascript
// Load all categories
const response = await fetch('/data/batch-1-erbil/master-all-categories.json');
const data = await response.json();
console.log(`Loaded ${data.count} places`);
```

#### Option 2: Category-Specific
```javascript
const accommodations = await fetch('/data/batch-1-erbil/accommodation.json');
const data = await accommodations.json();
```

### Filtering Examples

```javascript
// Filter by category
const restaurants = data.data.filter(
  place => place.canonical_category === 'Cafe & Restaurants'
);

// Filter by subcategory
const cafes = restaurants.filter(
  place => place.subcategory === 'Cafes'
);

// Filter by price range
const budgetHotels = data.data.filter(
  place => place.canonical_category === 'Accommodation' && 
  place.price_range === 'low'
);

// Filter by rating
const topRated = data.data.filter(
  place => place.rating && place.rating >= 4.5
);
```

### Sorting Examples

```javascript
// Sort by rating (descending)
const sorted = [...data.data].sort((a, b) => 
  (b.rating || 0) - (a.rating || 0)
);

// Sort by name
const alphabetical = [...data.data].sort((a, b) => 
  a.name.localeCompare(b.name)
);
```

### Using Filter Metadata

```javascript
import { CATEGORY_FILTERS } from './iraqDiscoverySchema';

// Get available filters for a category
const accommodationFilters = CATEGORY_FILTERS['Accommodation'];

// Example: Render filters in UI
accommodationFilters.forEach(filter => {
  if (filter.ui_component === 'slider') {
    renderSlider(filter.field_name, filter.min, filter.max);
  } else if (filter.ui_component === 'chips') {
    renderChips(filter.field_name, filter.options);
  }
});
```

---

## 🔧 Configuration

### Adding New Cities

Edit `scripts/iraq-discovery-collector.ts`:

```typescript
const CITY_CONFIGS: Record<string, CollectorConfig> = {
  // ... existing cities ...
  your_city: {
    city: 'Your City Name',
    governorate: 'governorate_key',
    categories: ALL_CATEGORIES,
    radius: 30000, // meters
    coordinates: { lat: 00.0000, lng: 00.0000 },
  },
};
```

### Customizing Categories

Edit the collector to include/exclude categories:

```typescript
const config = {
  // ... other config ...
  categories: [
    'Accommodation',
    'Cafe & Restaurants',
    'Tourism',
    // Add or remove as needed
  ],
};
```

---

## 📦 Batch Delivery

### Batch Manifest

Each batch includes a `MANIFEST.json`:

```json
{
  "batch_number": 1,
  "batch_name": "Erbil Complete Dataset - Batch 1",
  "governorate": "erbil",
  "date_created": "2025-10-02T22:40:00.000Z",
  "records_by_category": {
    "Accommodation": 15,
    "Cafe & Restaurants": 25,
    "Tourism": 18,
    // ... etc
  },
  "total_records": 120,
  "quality_metrics": {
    "complete_records": 95,
    "partial_records": 20,
    "geocoded": 115,
    "with_images": 85,
    "verified": 60
  },
  "files": {
    "json": ["accommodation.json", "..."],
    "csv": ["accommodation.csv", "..."]
  }
}
```

### Changelog

Each batch README includes a changelog section documenting what was added/updated.

---

## 🧪 Testing

### Test with Mock Data

```bash
# No API key required - generates realistic mock data
npm run collect:iraq:erbil
```

### Test Specific City

```bash
npm run collect:iraq:discovery -- --city baghdad
```

### Validate Output

```bash
# Check the generated files
ls -la data/iraq-discovery-exports/batch-1-erbil/

# Validate JSON
cat data/iraq-discovery-exports/batch-1-erbil/master-all-categories.json | jq '.count'
```

---

## ✅ Acceptance Checklist (Per Batch)

- [x] JSON/CSV files exported
- [x] Geolocation validated (Iraq bounds)
- [x] Duplicates removed
- [x] Source and license recorded
- [x] README generated
- [x] MANIFEST.json created
- [x] Mock API examples provided
- [ ] Front-end integration tested *(manual step)*
- [ ] Quality review completed *(manual step)*

---

## 🔄 Continuous Collection Mode

### Start Nonstop Collection

```bash
npm run collect:iraq:continuous
```

This mode:
- Collects all priority cities in sequence
- Waits 5 minutes between cities (rate limiting)
- Waits 1 hour between full iterations
- Runs indefinitely until stopped (Ctrl+C)
- Increments batch numbers automatically

### Monitoring

The agent logs:
- Current city being collected
- Progress per category
- Deduplication results
- Quality metrics
- Export locations

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: No data collected?**  
A: This is expected without an API key. The system generates mock data for testing.

**Q: How to get real data?**  
A: Add `GOOGLE_PLACES_API_KEY` to `.env` file.

**Q: Rate limits exceeded?**  
A: Increase delay times in the collector script or reduce radius.

**Q: Missing categories?**  
A: Some categories may have no results in certain cities. This is normal.

### Logs

All output is logged to console with clear progress indicators:
- 🔍 = Collecting
- ✅ = Success
- ❌ = Error
- ⚠️  = Warning
- 📦 = Exporting
- 💾 = Saved

---

## 📄 Files Reference

| File | Purpose |
|------|---------|
| `src/lib/dataCollection/iraqDiscoverySchema.ts` | Complete TypeScript schema definitions |
| `src/lib/dataCollection/enhancedGoogleMapsCollector.ts` | Google Maps data collector |
| `src/lib/dataCollection/exportPipeline.ts` | JSON/CSV export logic |
| `scripts/iraq-discovery-collector.ts` | Main orchestrator script |
| `IRAQ_DISCOVERY_AGENT_README.md` | This file |

---

## 🎯 Next Steps

1. ✅ **Test Batch 1 (Erbil)**
   ```bash
   npm run collect:iraq:erbil
   ```

2. ✅ **Review Output**
   - Check `data/iraq-discovery-exports/batch-1-erbil/`
   - Read generated README.md
   - Validate JSON schema

3. ✅ **Test Batch 2 (Baghdad)**
   ```bash
   npm run collect:iraq:baghdad
   ```

4. ✅ **Integrate with Front-End**
   - Use provided Postman collection
   - Test filter/sort UI components
   - Validate data display

5. ✅ **Deploy Continuous Collection**
   ```bash
   npm run collect:iraq:continuous
   ```

---

## 📊 Expected Results

### Batch 1 (Erbil) - Sample Counts
- Accommodation: 10-25 records
- Cafe & Restaurants: 15-30 records
- Tourism: 10-20 records
- Shopping: 10-20 records
- Services: 15-25 records
- Government Offices: 5-15 records
- Companies: 10-20 records
- Events: 5-15 records

**Total: ~80-170 records per city (mock data)**  
**With real API: 200-500+ records per city**

---

## 🏆 Success Criteria

- ✅ All 8 categories covered
- ✅ Erbil and Baghdad prioritized
- ✅ JSON + CSV formats
- ✅ Complete documentation
- ✅ Filter metadata included
- ✅ Deduplication working
- ✅ Geocoding validated
- ✅ Source tracking enabled
- ✅ Continuous collection supported
- ✅ Front-end ready format

---

**Built with ❤️ for Iraq's Digital Discovery**

*Generated by the Iraq Discovery Data Collection Agent*  
*Last Updated: 2025-10-02*
