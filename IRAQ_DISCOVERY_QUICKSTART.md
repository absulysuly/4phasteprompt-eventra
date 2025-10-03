# Iraq Discovery — Data Collection & Front-End Integration Starter Kit

**Welcome!** This directory contains everything you need to begin collecting, structuring, and integrating the Iraq Discovery dataset for your mobile application.

---

## 🚀 Quick Start

### For Data Collection Agents
1. **Read the assignment brief:** `docs/briefs/short_assignment_brief.txt`
2. **Review the schema:** `data/schemas/iraq_discovery.schema.json`
3. **Check the README:** `docs/DATASET_README.md` for full field definitions and requirements
4. **Use the acceptance checklist:** `docs/ACCEPTANCE_CHECKLIST.md` before submitting each batch

### For Front-End Developers
1. **Import Postman collection:** `docs/postman/IraqDiscovery.postman_collection.json`
2. **Review sample data:** `mock-api/categories/` folder contains Erbil-focused mock JSON
3. **Integrate filter UI:** See filter mappings in `docs/DATASET_README.md`
4. **Test with mock data:** Point your API calls to the JSON files or set up a simple mock server

### For Project Managers
1. **Assignment brief:** `docs/briefs/short_assignment_brief.txt` — send this to data collection agents
2. **Acceptance checklist:** `docs/ACCEPTANCE_CHECKLIST.md` — use for batch reviews
3. **Track progress:** Current status is **Batch 1 (Erbil Sample)** — expand to full Erbil → Baghdad → Other cities

---

## 📂 Project Structure

```
4phasteprompt-eventra/
├── IRAQ_DISCOVERY_QUICKSTART.md        ← You are here
├── data/
│   ├── schemas/
│   │   └── iraq_discovery.schema.json  ← JSON Schema (all 8 categories)
│   └── csv/                            ← CSV exports (run script to generate)
├── mock-api/
│   └── categories/
│       ├── accommodation.json          ← Sample Erbil hotels (3 records)
│       ├── cafes-restaurants.json      ← Sample cafes/restaurants (3 records)
│       └── _all_categories_sample.json ← Other 6 categories (2–3 records each)
├── docs/
│   ├── DATASET_README.md               ← Complete schema & filter mappings
│   ├── ACCEPTANCE_CHECKLIST.md         ← Quality checklist for batches
│   ├── postman/
│   │   └── IraqDiscovery.postman_collection.json  ← API test requests
│   └── briefs/
│       └── short_assignment_brief.txt  ← One-paragraph task brief
└── scripts/
    └── export_sample_csv.ps1           ← PowerShell: JSON → CSV
```

---

## 🗂️ The 8 Categories

1. **Accommodation** — Hotels, hostels, apartments, villas
2. **Cafe & Restaurants** — Cafes, restaurants, fast food
3. **Events** — Concerts, festivals, exhibitions, workshops
4. **Tourism** — Landmarks, museums, parks, cultural sites
5. **Government Offices** — Passport offices, municipalities, ministries
6. **Services** — Health, professional, education, IT, repair services
7. **Companies** — Local businesses across all industries
8. **Shopping** — Malls, bazaars, boutiques, supermarkets

Each category has:
- **Universal fields** (name, address, coords, phone, website, rating, images, etc.)
- **Category-specific fields** (e.g., `star_rating` for hotels, `cuisine_types` for restaurants)

---

## 🎯 Current Status: Batch 1 (Erbil Sample)

✅ **Completed:**
- JSON Schema defined for all 8 categories
- Sample Erbil data created (3 accommodation, 3 cafes/restaurants, 2–3 per other category)
- Postman collection with test endpoints
- README with filter mappings and UI component hints
- Acceptance checklist for quality control
- PowerShell CSV export script

⏳ **Next Steps:**
- Expand Erbil dataset to 10–25 records per category
- Run CSV export: `.\scripts\export_sample_csv.ps1`
- Move to **Batch 2: Baghdad**
- Expand to other cities

---

## 🧪 Testing the Data

### Option 1: Use Postman
1. Import `docs/postman/IraqDiscovery.postman_collection.json`
2. Set `base_url` variable to your mock server or use file paths
3. Run GET requests to test filters

### Option 2: Direct JSON Access
- Read JSON files directly from `mock-api/categories/`
- Example (JavaScript):
  ```javascript
  const data = await fetch('mock-api/categories/accommodation.json').then(r => r.json());
  console.log(data.data); // Array of accommodation records
  ```

### Option 3: Export to CSV
Run the PowerShell script:
```powershell
.\scripts\export_sample_csv.ps1
```
CSVs will be created in `data/csv/` for analysis in Excel/Google Sheets.

---

## 📊 Filter UI Examples (Front-End)

### Accommodation Filters
- **Star rating:** Slider (0–5) or chips
- **Price range:** Chips (low, medium, high, very_high)
- **Amenities:** Multi-select chips (wifi, pool, parking, gym, ac, breakfast, etc.)
- **Accessibility:** Toggle (wheelchair_accessible)

### Cafes & Restaurants Filters
- **Cuisine types:** Multi-select chips (Iraqi, Kurdish, Turkish, Vegetarian, etc.)
- **Price range:** Chips
- **Features:** Toggles (halal, outdoor_seating, delivery)

### Events Filters
- **Event type:** Dropdown (Concert, Festival, Exhibition, etc.)
- **Date range:** Date picker
- **Price:** Toggle (free/paid)

### Tourism Filters
- **Attraction type:** Multi-select chips (Landmark, Museum, Park, etc.)
- **Entry fee:** Toggle (free/paid)
- **Features:** Toggles (family_friendly, guided_tours_available)

*Full filter mappings in `docs/DATASET_README.md`*

---

## 📧 Contact & Support

- **Data Questions:** [your-email]
- **Front-End Integration:** [your-email]
- **GitHub Repository:** https://github.com/absulysuly/Iraq-descovery-

---

## 📝 License & Data Sources

- Schema & structure: Open for project use
- Sample data: Placeholder values for testing; replace with real data
- Real data sources must be documented (see `source_url` and `source_license` fields in schema)

---

**Ready to get started?** Read `docs/DATASET_README.md` for complete documentation! 🚀
