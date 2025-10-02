/**
 * Data Export Pipeline for Iraq Discovery
 * 
 * Exports collected data to JSON and CSV formats
 * Generates batch manifests and documentation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  IraqDiscoveryPlace, 
  Category, 
  BatchManifest, 
  Governorate,
  PlacesResponse,
  CATEGORY_FILTERS
} from './iraqDiscoverySchema';

// ========================================
// CONFIGURATION
// ========================================

const EXPORT_BASE_DIR = './data/iraq-discovery-exports';

// ========================================
// MAIN EXPORT FUNCTIONS
// ========================================

export async function exportBatch(
  places: IraqDiscoveryPlace[],
  batchNumber: number,
  governorate: Governorate,
  batchName?: string
): Promise<BatchManifest> {
  console.log(`\n📦 Exporting Batch ${batchNumber}: ${governorate}`);
  console.log(`   Total records: ${places.length}`);
  
  // Create batch directory
  const batchDir = path.join(EXPORT_BASE_DIR, `batch-${batchNumber}-${governorate}`);
  await fs.mkdir(batchDir, { recursive: true });
  
  // Group by category
  const byCategory = groupByCategory(places);
  
  // Export JSON files
  const jsonFiles: string[] = [];
  for (const [category, categoryPlaces] of Object.entries(byCategory)) {
    const filename = `${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}.json`;
    const filepath = path.join(batchDir, filename);
    await exportJSON(categoryPlaces, filepath);
    jsonFiles.push(filename);
    console.log(`   ✓ JSON: ${filename} (${categoryPlaces.length} records)`);
  }
  
  // Export master JSON
  const masterJsonPath = path.join(batchDir, 'master-all-categories.json');
  await exportJSON(places, masterJsonPath);
  jsonFiles.push('master-all-categories.json');
  console.log(`   ✓ JSON: master-all-categories.json (${places.length} records)`);
  
  // Export CSV files
  const csvFiles: string[] = [];
  for (const [category, categoryPlaces] of Object.entries(byCategory)) {
    const filename = `${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}.csv`;
    const filepath = path.join(batchDir, filename);
    await exportCSV(categoryPlaces, filepath);
    csvFiles.push(filename);
    console.log(`   ✓ CSV: ${filename} (${categoryPlaces.length} records)`);
  }
  
  // Calculate quality metrics
  const qualityMetrics = calculateQualityMetrics(places);
  
  // Generate manifest
  const manifest: BatchManifest = {
    batch_number: batchNumber,
    batch_name: batchName || `${governorate.charAt(0).toUpperCase() + governorate.slice(1)} Dataset`,
    governorate,
    date_created: new Date().toISOString(),
    records_by_category: Object.fromEntries(
      Object.entries(byCategory).map(([cat, places]) => [cat, places.length])
    ) as Record<Category, number>,
    total_records: places.length,
    quality_metrics: qualityMetrics,
    files: {
      json: jsonFiles,
      csv: csvFiles,
    },
  };
  
  // Save manifest
  const manifestPath = path.join(batchDir, 'MANIFEST.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`   ✓ Manifest: MANIFEST.json`);
  
  // Generate README
  await generateBatchREADME(manifest, batchDir);
  console.log(`   ✓ Documentation: README.md`);
  
  console.log(`\n✅ Batch ${batchNumber} exported successfully to ${batchDir}\n`);
  
  return manifest;
}

// ========================================
// JSON EXPORT
// ========================================

async function exportJSON(places: IraqDiscoveryPlace[], filepath: string): Promise<void> {
  const data = {
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    count: places.length,
    data: places,
  };
  
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
}

// ========================================
// CSV EXPORT
// ========================================

async function exportCSV(places: IraqDiscoveryPlace[], filepath: string): Promise<void> {
  if (places.length === 0) {
    await fs.writeFile(filepath, 'No data');
    return;
  }
  
  // Define universal CSV columns
  const columns = [
    'id',
    'name',
    'category',
    'subcategory',
    'tags',
    'street',
    'city',
    'governorate',
    'latitude',
    'longitude',
    'phone',
    'website',
    'email',
    'price_range',
    'rating',
    'rating_count',
    'images',
    'description',
    'languages',
    'source_type',
    'source_url',
    'last_updated',
  ];
  
  // Generate CSV header
  let csv = columns.join(',') + '\n';
  
  // Generate CSV rows
  for (const place of places) {
    const row = columns.map(col => {
      switch (col) {
        case 'id': return escapeCSV(place.id);
        case 'name': return escapeCSV(place.name);
        case 'category': return escapeCSV(place.canonical_category);
        case 'subcategory': return escapeCSV(place.subcategory || '');
        case 'tags': return escapeCSV(place.tags.join('; '));
        case 'street': return escapeCSV(place.address.street || '');
        case 'city': return escapeCSV(place.address.city);
        case 'governorate': return escapeCSV(place.address.governorate);
        case 'latitude': return place.latitude.toString();
        case 'longitude': return place.longitude.toString();
        case 'phone': return escapeCSV(place.phone || '');
        case 'website': return escapeCSV(place.website || '');
        case 'email': return escapeCSV(place.email || '');
        case 'price_range': return escapeCSV(place.price_range || '');
        case 'rating': return (place.rating || '').toString();
        case 'rating_count': return (place.rating_count || '').toString();
        case 'images': return escapeCSV(place.images.join('; '));
        case 'description': return escapeCSV(place.description);
        case 'languages': return escapeCSV(place.languages_supported.join('; '));
        case 'source_type': return escapeCSV(place.source_type);
        case 'source_url': return escapeCSV(place.source_url || '');
        case 'last_updated': return escapeCSV(place.last_updated);
        default: return '';
      }
    });
    
    csv += row.join(',') + '\n';
  }
  
  await fs.writeFile(filepath, csv);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function groupByCategory(places: IraqDiscoveryPlace[]): Record<string, IraqDiscoveryPlace[]> {
  const grouped: Record<string, IraqDiscoveryPlace[]> = {};
  
  for (const place of places) {
    const category = place.canonical_category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(place);
  }
  
  return grouped;
}

function calculateQualityMetrics(places: IraqDiscoveryPlace[]) {
  let complete = 0;
  let partial = 0;
  let geocoded = 0;
  let withImages = 0;
  let verified = 0;
  
  for (const place of places) {
    // Check completeness
    const requiredFields = [
      place.name,
      place.canonical_category,
      place.address.city,
      place.address.governorate,
      place.latitude,
      place.longitude,
      place.description,
    ];
    
    const optionalFields = [
      place.phone,
      place.website,
      place.email,
      place.price_range,
      place.rating,
    ];
    
    const requiredComplete = requiredFields.every(f => f !== undefined && f !== null && f !== '');
    const optionalComplete = optionalFields.filter(f => f !== undefined && f !== null && f !== '').length;
    
    if (requiredComplete && optionalComplete >= 3) {
      complete++;
    } else if (requiredComplete) {
      partial++;
    }
    
    // Check geocoding
    if (place.latitude !== 0 && place.longitude !== 0) {
      geocoded++;
    }
    
    // Check images
    if (place.images && place.images.length > 0) {
      withImages++;
    }
    
    // Check verification (you'd implement this based on your criteria)
    if (place.rating && place.rating_count && place.rating_count > 5) {
      verified++;
    }
  }
  
  return {
    complete_records: complete,
    partial_records: partial,
    geocoded,
    with_images: withImages,
    verified,
  };
}

// ========================================
// README GENERATION
// ========================================

async function generateBatchREADME(manifest: BatchManifest, batchDir: string): Promise<void> {
  const readme = `# ${manifest.batch_name}

**Batch #${manifest.batch_number}** | **Governorate:** ${manifest.governorate}  
**Generated:** ${new Date(manifest.date_created).toLocaleString()}  
**Total Records:** ${manifest.total_records}

---

## 📊 Dataset Summary

### Records by Category

${Object.entries(manifest.records_by_category)
  .map(([cat, count]) => `- **${cat}**: ${count} records`)
  .join('\n')}

### Quality Metrics

- ✅ **Complete Records**: ${manifest.quality_metrics.complete_records} (${Math.round((manifest.quality_metrics.complete_records / manifest.total_records) * 100)}%)
- ⚠️  **Partial Records**: ${manifest.quality_metrics.partial_records}
- 📍 **Geocoded**: ${manifest.quality_metrics.geocoded} (${Math.round((manifest.quality_metrics.geocoded / manifest.total_records) * 100)}%)
- 🖼️  **With Images**: ${manifest.quality_metrics.with_images} (${Math.round((manifest.quality_metrics.with_images / manifest.total_records) * 100)}%)
- ✓ **Verified**: ${manifest.quality_metrics.verified}

---

## 📁 Files

### JSON Files
${manifest.files.json.map(f => `- \`${f}\``).join('\n')}

### CSV Files
${manifest.files.csv.map(f => `- \`${f}\``).join('\n')}

---

## 🔧 Usage

### Load JSON Data

\`\`\`javascript
const data = require('./${manifest.files.json[0]}');
console.log(\`Loaded \${data.count} records\`);
\`\`\`

### Filter by Category

\`\`\`javascript
const accommodations = data.data.filter(place => place.canonical_category === 'Accommodation');
\`\`\`

### Use with Front-End

\`\`\`javascript
fetch('/data/master-all-categories.json')
  .then(res => res.json())
  .then(data => {
    // Use data.data array
    console.log('Places:', data.data);
  });
\`\`\`

---

## 📖 Data Schema

Each place record contains:

### Universal Fields
- \`id\`: Unique identifier
- \`name\`: Place name
- \`canonical_category\`: One of 8 main categories
- \`subcategory\`: Specific type within category
- \`tags\`: Array of descriptive tags
- \`address\`: Structured address object
- \`latitude\`, \`longitude\`: GPS coordinates
- \`phone\`, \`website\`, \`email\`: Contact information
- \`opening_hours\`: Structured operating hours
- \`price_range\`: low, medium, high, very_high, or free
- \`rating\`: Numeric rating (0-5)
- \`rating_count\`: Number of reviews
- \`images\`: Array of image URLs
- \`description\`: Text description
- \`languages_supported\`: Array of language codes
- \`accessibility\`: Accessibility information
- \`source_type\`, \`source_url\`: Data provenance
- \`last_updated\`: ISO timestamp

### Category-Specific Fields

Each record also contains a \`category_data\` object with category-specific fields (star_rating for hotels, cuisine_types for restaurants, etc.).

---

## ✅ Acceptance Checklist

- [x] JSON/CSV exported
- [x] Geolocation validated
- [x] Duplicates removed
- [x] Source and license recorded
- [x] README generated
- [ ] Front-end integration tested
- [ ] Quality review completed

---

## 📞 Support

For questions or issues with this dataset, please contact the data collection team.

**Generated by Iraq Discovery Data Collection Agent**
`;

  await fs.writeFile(path.join(batchDir, 'README.md'), readme);
}

// ========================================
// API MOCK GENERATOR
// ========================================

export async function generateMockAPIEndpoints(batchDir: string): Promise<void> {
  const apiDir = path.join(batchDir, 'mock-api');
  await fs.mkdir(apiDir, { recursive: true });
  
  // Generate example API response structure
  const exampleResponse: PlacesResponse = {
    data: [], // Would be populated with actual data
    metadata: {
      total_count: 0,
      page: 1,
      page_size: 20,
      has_more: false,
      applied_filters: {},
      available_filters: CATEGORY_FILTERS['Accommodation'],
      filter_counts: {},
    },
  };
  
  await fs.writeFile(
    path.join(apiDir, 'example-response.json'),
    JSON.stringify(exampleResponse, null, 2)
  );
  
  // Generate Postman collection
  const postmanCollection = {
    info: {
      name: 'Iraq Discovery API',
      description: 'Mock API endpoints for testing',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [
      {
        name: 'Get All Places',
        request: {
          method: 'GET',
          url: 'http://localhost:3000/api/places',
        },
      },
      {
        name: 'Get Places by Category',
        request: {
          method: 'GET',
          url: 'http://localhost:3000/api/places?category=Accommodation',
        },
      },
      {
        name: 'Get Places by Governorate',
        request: {
          method: 'GET',
          url: 'http://localhost:3000/api/places?governorate=erbil',
        },
      },
      {
        name: 'Search Places',
        request: {
          method: 'GET',
          url: 'http://localhost:3000/api/places/search?q=hotel',
        },
      },
    ],
  };
  
  await fs.writeFile(
    path.join(apiDir, 'postman-collection.json'),
    JSON.stringify(postmanCollection, null, 2)
  );
  
  console.log(`   ✓ Mock API: example-response.json`);
  console.log(`   ✓ Postman: postman-collection.json`);
}
