# Iraq Discovery Dataset — README

**Version:** 1.0.0 (Batch 1 — Erbil Sample)  
**Last Updated:** October 2, 2025  
**Contact:** [Your data collection team]

---

## Overview

This is the normalized, API-ready dataset for **Iraq Discovery**, covering 8 main categories:

1. **Accommodation** — Hotels, hostels, apartments
2. **Cafe & Restaurants** — Cafes, restaurants, fast food
3. **Events** — Festivals, concerts, exhibitions, workshops
4. **Tourism** — Landmarks, museums, parks, cultural sites
5. **Government Offices** — Passport offices, municipalities, ministries
6. **Services** — Health, professional, education, IT, repair
7. **Companies** — Local businesses across industries
8. **Shopping** — Malls, bazaars, boutiques, supermarkets

All records conform to the JSON schema defined in `data/schemas/iraq_discovery.schema.json`.

---

## Directory Structure

```
4phasteprompt-eventra/
├── data/
│   ├── schemas/
│   │   └── iraq_discovery.schema.json     # JSON Schema for all categories
│   └── csv/                                # CSV exports (generated via script)
├── mock-api/
│   └── categories/
│       ├── accommodation.json              # Sample Erbil accommodation data
│       ├── cafes-restaurants.json          # Sample cafes/restaurants
│       └── _all_categories_sample.json     # Consolidated samples for other 6 categories
├── docs/
│   ├── postman/
│   │   └── IraqDiscovery.postman_collection.json  # Postman API test collection
│   ├── briefs/
│   │   └── short_assignment_brief.txt      # One-paragraph task brief
│   ├── DATASET_README.md                   # This file
│   └── ACCEPTANCE_CHECKLIST.md             # Batch acceptance checklist
└── scripts/
    └── export_sample_csv.ps1               # PowerShell script to export JSON → CSV
```

---

## Schema Summary

### Universal Fields (all records)

- **id** — Unique identifier (e.g., `acc-erbil-001`)
- **name** — Display name
- **canonical_category** — One of 8 top-level categories
- **subcategory** — Array of category-specific tags
- **tags** — Additional keywords
- **address** — Structured: `{street, neighborhood, city, governorate, postal_code}`
- **latitude, longitude** — Geocoordinates
- **geocode_source** — Source for coords (e.g., OpenStreetMap, Google)
- **phone, website, email** — Contact info
- **opening_hours** — Object keyed by weekday, values: `{open, close, closed}`
- **price_range** — `low | medium | high | very_high`
- **price_numeric** — Optional: `{min, max, currency}` in IQD
- **rating** — Average 0–5 rating
- **rating_count** — Number of reviews
- **images** — Array of `{url, caption, thumbnail_url}`
- **languages_supported** — Array (e.g., `["Arabic", "Kurdish", "English"]`)
- **accessibility** — `{wheelchair_accessible, family_friendly, parking_available}` (booleans)
- **description** — Short 1–2 sentence summary
- **source_url** — Original data source
- **source_license** — License/rights (`CC-BY`, `proprietary`, `public`)
- **last_updated** — ISO 8601 timestamp

### Category-Specific Extensions

#### 1. Accommodation
- `star_rating`: 0–5 integer
- `amenities`: array (`wifi`, `pool`, `parking`, `gym`, `ac`, `breakfast`, `laundry`, `concierge`, `restaurant`, `bar`)
- `room_types`: array (e.g., `["Standard Room", "Deluxe Suite"]`)
- `checkin_time`, `checkout_time`: HH:MM format

#### 2. Cafe & Restaurants
- `cuisine_types`: array (`Arabic`, `Iraqi`, `Kurdish`, `Mediterranean`, `Turkish`, `International`, `Vegetarian`, `Vegan`, `Fast Food`, `Seafood`)
- `delivery`: boolean
- `accepts_reservations`: boolean
- `outdoor_seating`: boolean
- `halal`: boolean
- `dietary_options`: array (e.g., `["Vegetarian", "Vegan options"]`)

#### 3. Events
- `event_type`: enum (`Concert`, `Festival`, `Exhibition`, `Workshop`, `Sports`, `Market`, `Theater`, `Conference`, `Other`)
- `start_datetime`, `end_datetime`: ISO 8601
- `venue_name`: string
- `organizer`: string
- `ticket_url`: URL
- `is_free`: boolean

#### 4. Tourism
- `attraction_type`: array (`Landmark`, `Picnic Area`, `Cultural Site`, `Must See`, `Hidden Gem`, `Natural Area`, `Museum`, `Park`)
- `entry_fee`: `free | paid`
- `best_visit_time`: string
- `guided_tours_available`: boolean

#### 5. Government Offices
- `office_type`: enum (`Passport Office`, `Municipality`, `Ministry`, `Court`, `Social Services`, `Police Station`, `Municipal Services`)
- `services_offered`: array
- `required_documents`: array
- `appointment_required`: boolean
- `working_hours_notes`: string

#### 6. Services
- `primary_service_type`: enum (`Health Services`, `Professional Services`, `Education`, `Banking`, `Telecom`, `Repair Services`, `Financial Services`, `Legal Services`)
- `service_subcategory`: string
- `accepts_online_booking`: boolean
- `emergency_service`: boolean

#### 7. Companies
- `industry`: enum (`Architecture`, `Tourism`, `Trading`, `Technology`, `Manufacturing`, `Consulting`, `Retail`, `Oil & Gas`, `Construction`, `Finance`)
- `company_size`: `startup | SME | enterprise`
- `services_products`: array
- `is_hiring`: boolean
- `verified`: boolean

#### 8. Shopping
- `store_type`: enum (`Shopping Mall`, `Retail Store`, `Bazaar`, `Boutique`, `Supermarket`)
- `main_products`: array (`Clothing`, `Electronics`, `Food`, `Books`, `Souvenirs`, `Home Goods`, `Jewelry`, `Cosmetics`)
- `accepts_credit_cards`: boolean

---

## Filter Mappings (UI → Backend)

For each category, the front-end can display filters as follows:

### Accommodation
| Field | UI Type | Options |
|-------|---------|---------|
| `star_rating` | Slider or chips | 0–5 |
| `price_range` | Chips | low, medium, high, very_high |
| `amenities` | Multi-select chips | wifi, pool, parking, gym, ac, breakfast, etc. |
| `accessibility.wheelchair_accessible` | Toggle | true/false |

### Cafes & Restaurants
| Field | UI Type | Options |
|-------|---------|---------|
| `cuisine_types` | Multi-select chips | Arabic, Iraqi, Kurdish, Turkish, Vegetarian, etc. |
| `price_range` | Chips | low, medium, high |
| `halal` | Toggle | true/false |
| `outdoor_seating` | Toggle | true/false |
| `delivery` | Toggle | true/false |

### Events
| Field | UI Type | Options |
|-------|---------|---------|
| `event_type` | Dropdown/chips | Concert, Festival, Exhibition, Workshop, etc. |
| `start_datetime` | Date range picker | ISO dates |
| `is_free` | Toggle | true/false |

### Tourism
| Field | UI Type | Options |
|-------|---------|---------|
| `attraction_type` | Multi-select chips | Landmark, Museum, Park, Cultural Site, etc. |
| `entry_fee` | Toggle | free, paid |
| `accessibility.family_friendly` | Toggle | true/false |
| `guided_tours_available` | Toggle | true/false |

### Government Offices
| Field | UI Type | Options |
|-------|---------|---------|
| `office_type` | Dropdown | Passport Office, Municipality, Ministry, Court, etc. |
| `appointment_required` | Toggle | true/false |
| `working_hours` (computed from `opening_hours`) | Quick chip: "Open now" | derived |

### Services
| Field | UI Type | Options |
|-------|---------|---------|
| `primary_service_type` | Dropdown | Health Services, Professional Services, Repair, etc. |
| `accepts_online_booking` | Toggle | true/false |
| `emergency_service` | Toggle | true/false |

### Companies
| Field | UI Type | Options |
|-------|---------|---------|
| `industry` | Dropdown/chips | Technology, Construction, Finance, Tourism, etc. |
| `company_size` | Radio | startup, SME, enterprise |
| `is_hiring` | Toggle | true/false |
| `verified` | Toggle | true/false |

### Shopping
| Field | UI Type | Options |
|-------|---------|---------|
| `store_type` | Dropdown | Shopping Mall, Bazaar, Boutique, Supermarket |
| `main_products` | Multi-select chips | Clothing, Electronics, Food, Souvenirs, etc. |
| `accepts_credit_cards` | Toggle | true/false |

---

## Sorting & Pagination

### Recommended Sort Options
- **Relevance** (default): by rating * log(rating_count) or distance-weighted score
- **Distance**: nearest first (requires user location)
- **Rating**: highest `rating` first
- **Price**: lowest `price_range` or `price_numeric.min` first

### Pagination
- Return paginated results with metadata:
  ```json
  {
    "meta": {
      "total_count": 127,
      "page": 1,
      "per_page": 20,
      "total_pages": 7,
      "applied_filters": {
        "city": "Erbil",
        "price_range": "medium"
      }
    },
    "data": [ ... ]
  }
  ```

---

## Data Sources & Licensing

- **Proprietary sources** (e.g., hotel/restaurant websites): Marked `source_license: "proprietary"`. Use with permission or for editorial purposes.
- **Public sources** (e.g., government open data, Wikipedia): Marked `source_license: "public"` or `"CC-BY"`.
- **Geocoding**: Coordinates sourced from OpenStreetMap or Google Maps (noted in `geocode_source`).

**Important:** Always verify licensing before redistribution or commercial use.

---

## Next Steps (Data Collection Workflow)

### Current Status: Batch 1 (Erbil Sample)
- ✅ Schema defined
- ✅ Sample data created (3 accommodation, 3 cafes/restaurants, 2–3 per other category)
- ✅ Postman collection ready
- ⏳ CSV exports (run `scripts/export_sample_csv.ps1`)
- ⏳ Expand to full Erbil dataset (10–25 records per category)

### Batch 2: Baghdad
- Collect 10–25 records per category for Baghdad
- Deduplicate and merge with Erbil data
- Update changelog

### Batch 3+: Other Cities
- Expand to Sulaymaniyah, Dohuk, Basra, etc.
- Continuous updates and quality checks

---

## API Integration (Front-End)

### Sample Fetch (JavaScript)
```javascript
const response = await fetch('http://localhost:3000/api/accommodation?city=Erbil&star_rating=4');
const { meta, data } = await response.json();
console.log(`Found ${meta.total_count} results`, data);
```

### Postman Collection
Import `docs/postman/IraqDiscovery.postman_collection.json` into Postman and set the `base_url` variable to your mock API server.

---

## CSV Exports

Run the PowerShell script to generate CSVs:

```powershell
.\scripts\export_sample_csv.ps1
```

CSVs will be written to `data/csv/`.

---

## Questions & Support

For questions about the schema or data collection:
- Email: [your-email]
- GitHub: [repo-url]
- Slack: [channel]

---

**End of README**
