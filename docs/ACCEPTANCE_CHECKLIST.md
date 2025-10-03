# Iraq Discovery Dataset — Batch Acceptance Checklist

Use this checklist to verify each data delivery batch before integration into the front-end.

---

## Batch Info

- **Batch Number:** _____ (e.g., Batch 1 — Erbil)
- **Date Delivered:** _____
- **Delivered By:** _____
- **Governorate(s) Covered:** _____
- **Categories Included:** [ ] All 8  [ ] Partial (list: _______)

---

## Data Quality Checks

### 1. File Deliverables
- [ ] **JSON files provided** for each category (or consolidated JSON)
- [ ] **CSV exports provided** (optional but preferred)
- [ ] **README/changelog** included or updated
- [ ] **Source URLs and licenses** documented

### 2. Schema Compliance
- [ ] All records include **required universal fields** (`id`, `name`, `canonical_category`, `address`, `latitude`, `longitude`, `source_url`, `last_updated`)
- [ ] Category-specific fields present where applicable (e.g., `star_rating` for Accommodation)
- [ ] **JSON validates** against `data/schemas/iraq_discovery.schema.json` (use a JSON schema validator tool)

### 3. Geocoding & Address Validation
- [ ] **Latitude/longitude values** are within valid ranges (lat: -90 to 90, lng: -180 to 180)
- [ ] **Geocode source** is specified (`geocode_source` field populated)
- [ ] Addresses are **normalized** (consistent city/governorate names, no typos)
- [ ] Spot-check: 5 random records have **accurate coordinates** (verify on a map)

### 4. Deduplication
- [ ] **No duplicate records** within the same category (check by name + address + coords)
- [ ] If duplicates found from different sources, they are **merged** with combined metadata (e.g., aggregated ratings)
- [ ] Duplicate handling is **documented** in changelog

### 5. Data Completeness
- [ ] **Phone numbers** formatted consistently (include country code `+964` for Iraq)
- [ ] **Opening hours** are structured correctly (`{monday: {open, close}, ...}` or `{closed: true}`)
- [ ] **Price ranges** standardized (`low`, `medium`, `high`, `very_high`)
- [ ] **Images**: URLs are valid and reachable (spot-check 10 random records)
- [ ] **Ratings**: `rating` between 0–5, `rating_count` ≥ 0
- [ ] **Missing critical fields** flagged with placeholders or noted in changelog

### 6. Normalization & Consistency
- [ ] **Names** are properly cased (e.g., "Erbil Rotana Hotel" not "ERBIL ROTANA HOTEL")
- [ ] **Cuisine types, amenities, tags** use **standardized vocabulary** from schema enums
- [ ] **Languages** listed in consistent format (e.g., "Arabic", "Kurdish", "English")
- [ ] **Governorate names** match standard Iraqi governorate names (Erbil, Baghdad, Basra, etc.)

### 7. Source & Licensing
- [ ] **`source_url`** populated for every record
- [ ] **`source_license`** specified (`proprietary`, `public`, `CC-BY`, etc.)
- [ ] Licensing conflicts or unclear rights are **flagged for review**

### 8. Data Count & Coverage
- [ ] Minimum record count per category met (target: 10–25 per category for Erbil/Baghdad)
  - Accommodation: _____ records
  - Cafe & Restaurants: _____ records
  - Events: _____ records
  - Tourism: _____ records
  - Government Offices: _____ records
  - Services: _____ records
  - Companies: _____ records
  - Shopping: _____ records
- [ ] Coverage is **representative** (mix of price ranges, neighborhoods, types)

### 9. Metadata & Pagination
- [ ] JSON responses include **`meta` object** with `total_count`, `city`, `category`, `last_updated`
- [ ] If paginated, `meta` includes `page`, `per_page`, `total_pages`
- [ ] **Applied filters** optionally listed in `meta.applied_filters`

### 10. Sample API Testing
- [ ] **Postman collection** updated with new endpoints (if applicable)
- [ ] Sample GET requests return **valid JSON** with correct structure
- [ ] Filters work correctly (test at least 3 filter combinations per category)
- [ ] Sorting works (test by rating, distance, price)

---

## Front-End Integration Readiness

- [ ] **Filter metadata** provided (or can be derived from schema enums)
- [ ] **UI component hints** documented (chips, toggles, dropdowns) — see `DATASET_README.md`
- [ ] **Sample fetch code** tested and works with mock data
- [ ] **Image URLs** accessible (no 404s or broken links in spot-check)

---

## Changelog & Documentation

- [ ] **CHANGELOG.md** or equivalent updated with:
  - Batch number & date
  - Number of records added/updated/removed per category
  - Major changes or corrections
- [ ] **DATASET_README.md** updated if schema or structure changed
- [ ] **Known issues** or gaps documented (e.g., "No events data available for this batch")

---

## Sign-Off

**Reviewed By:** _____________________  
**Date:** _____________________  
**Status:** [ ] **Accepted**  [ ] **Needs Revision** (see notes below)

### Revision Notes (if applicable):
_________________________________________________
_________________________________________________
_________________________________________________

---

**End of Checklist**
