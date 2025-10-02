/**
 * CSV Importer Test Suite
 * 
 * Comprehensive tests for the CSV venue importer functionality
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  importVenuesFromCSV,
  validateCSVFormat,
  generateCSVTemplate,
  exportVenuesToCSV,
  CSVImportResult
} from '../src/lib/dataCollection/csvImporter';
import {
  validateVenueData,
  isValidIraqiPhone,
  isValidUrl,
  normalizeCityName,
  isDuplicate,
  deduplicateVenues,
  VenueData
} from '../src/lib/dataCollection/venueUtils';

// Test results tracker
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const testResults: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string, details?: any) {
  testResults.push({ name, passed, error, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (error) console.log(`   Error: ${error}`);
  if (details) console.log(`   Details:`, details);
}

// ============================================================
// TEST 1: Load and Parse Sample CSV
// ============================================================
async function testLoadSampleCSV() {
  try {
    const csvPath = path.join(__dirname, '..', 'data', 'sample-venues.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    if (csvContent.length === 0) {
      throw new Error('Sample CSV is empty');
    }
    
    const lines = csvContent.split('\n').filter(l => l.trim());
    logTest('Load Sample CSV File', true, undefined, { 
      lines: lines.length, 
      size: csvContent.length 
    });
    
    return csvContent;
  } catch (error: any) {
    logTest('Load Sample CSV File', false, error.message);
    return null;
  }
}

// ============================================================
// TEST 2: Validate CSV Format
// ============================================================
function testValidateCSVFormat(csvContent: string) {
  try {
    const validation = validateCSVFormat(csvContent);
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    logTest('Validate CSV Format', true, undefined, {
      valid: validation.valid,
      errors: validation.errors
    });
    
    return true;
  } catch (error: any) {
    logTest('Validate CSV Format', false, error.message);
    return false;
  }
}

// ============================================================
// TEST 3: Import Venues from CSV
// ============================================================
async function testImportVenues(csvContent: string) {
  try {
    const result: CSVImportResult = await importVenuesFromCSV(csvContent);
    
    if (!result.success) {
      throw new Error('Import was not successful');
    }
    
    if (result.imported === 0) {
      throw new Error('No venues were imported');
    }
    
    logTest('Import Venues from CSV', true, undefined, {
      imported: result.imported,
      failed: result.failed,
      errors: result.errors.length,
      venues: result.venues.length
    });
    
    return result;
  } catch (error: any) {
    logTest('Import Venues from CSV', false, error.message);
    return null;
  }
}

// ============================================================
// TEST 4: Validate Imported Venue Data
// ============================================================
function testValidateImportedData(result: CSVImportResult) {
  try {
    let allValid = true;
    const invalidVenues: string[] = [];
    
    for (const venue of result.venues) {
      const validation = validateVenueData(venue);
      if (!validation.valid) {
        allValid = false;
        invalidVenues.push(`${venue.name}: ${validation.errors.join(', ')}`);
      }
    }
    
    if (!allValid) {
      throw new Error(`Some venues are invalid: ${invalidVenues.join('; ')}`);
    }
    
    logTest('Validate Imported Venue Data', true, undefined, {
      totalVenues: result.venues.length,
      allValid: true
    });
    
    return true;
  } catch (error: any) {
    logTest('Validate Imported Venue Data', false, error.message);
    return false;
  }
}

// ============================================================
// TEST 5: Check Venue Types Distribution
// ============================================================
function testVenueTypesDistribution(result: CSVImportResult) {
  try {
    const distribution: Record<string, number> = {};
    
    for (const venue of result.venues) {
      distribution[venue.type] = (distribution[venue.type] || 0) + 1;
    }
    
    const hasMultipleTypes = Object.keys(distribution).length > 1;
    
    logTest('Check Venue Types Distribution', hasMultipleTypes, undefined, distribution);
    
    return true;
  } catch (error: any) {
    logTest('Check Venue Types Distribution', false, error.message);
    return false;
  }
}

// ============================================================
// TEST 6: Validate City Names Normalization
// ============================================================
function testCityNormalization() {
  try {
    const testCases = [
      { input: 'Baghdad', expected: 'baghdad' },
      { input: 'بغداد', expected: 'baghdad' },
      { input: 'Erbil', expected: 'erbil' },
      { input: 'أربيل', expected: 'erbil' },
      { input: 'Basra', expected: 'basra' },
      { input: 'Mosul', expected: 'nineveh' }
    ];
    
    let allPassed = true;
    const results: any[] = [];
    
    for (const testCase of testCases) {
      const normalized = normalizeCityName(testCase.input);
      const passed = normalized === testCase.expected;
      
      if (!passed) allPassed = false;
      
      results.push({
        input: testCase.input,
        expected: testCase.expected,
        actual: normalized,
        passed
      });
    }
    
    if (!allPassed) {
      throw new Error('Some city normalizations failed');
    }
    
    logTest('City Name Normalization', true, undefined, results);
    
    return true;
  } catch (error: any) {
    logTest('City Name Normalization', false, error.message);
    return false;
  }
}

// ============================================================
// TEST 7: Validate Iraqi Phone Numbers
// ============================================================
function testPhoneValidation() {
  try {
    const validPhones = [
      '+9647901234567',
      '07901234567',
      '+964 790 123 4567',
      '0790-123-4567'
    ];
    
    const invalidPhones = [
      '1234567890',
      '+1234567890',
      '06901234567',
      'invalid'
    ];
    
    let allPassed = true;
    
    for (const phone of validPhones) {
      if (!isValidIraqiPhone(phone)) {
        allPassed = false;
        throw new Error(`Valid phone marked as invalid: ${phone}`);
      }
    }
    
    for (const phone of invalidPhones) {
      if (isValidIraqiPhone(phone)) {
        allPassed = false;
        throw new Error(`Invalid phone marked as valid: ${phone}`);
      }
    }
    
    logTest('Iraqi Phone Number Validation', allPassed, undefined, {
      validPhonesCount: validPhones.length,
      invalidPhonesCount: invalidPhones.length
    });
    
    return true;
  } catch (error: any) {
    logTest('Iraqi Phone Number Validation', false, error.message);
    return false;
  }
}

// ============================================================
// TEST 8: Validate URL Format
// ============================================================
function testUrlValidation() {
  try {
    const validUrls = [
      'https://example.com',
      'http://example.com',
      'https://www.example.com/path'
    ];
    
    const invalidUrls = [
      'not-a-url',
      'htp://invalid',
      'example.com'
    ];
    
    let allPassed = true;
    
    for (const url of validUrls) {
      if (!isValidUrl(url)) {
        allPassed = false;
        throw new Error(`Valid URL marked as invalid: ${url}`);
      }
    }
    
    for (const url of invalidUrls) {
      if (isValidUrl(url)) {
        allPassed = false;
        throw new Error(`Invalid URL marked as valid: ${url}`);
      }
    }
    
    logTest('URL Format Validation', allPassed);
    
    return true;
  } catch (error: any) {
    logTest('URL Format Validation', false, error.message);
    return false;
  }
}

// ============================================================
// TEST 9: Test Duplicate Detection
// ============================================================
function testDuplicateDetection() {
  try {
    const venue1: VenueData = {
      name: 'Baghdad Palace Hotel',
      description: 'Luxury hotel in Baghdad',
      type: 'HOTEL',
      city: 'Baghdad',
      latitude: 33.3152,
      longitude: 44.3661
    };
    
    const venue2: VenueData = {
      name: 'Baghdad Palace Hotel',
      description: 'Different description',
      type: 'HOTEL',
      city: 'Baghdad',
      latitude: 33.3152,
      longitude: 44.3661
    };
    
    const venue3: VenueData = {
      name: 'Completely Different Hotel',
      description: 'Different hotel',
      type: 'HOTEL',
      city: 'Erbil',
      latitude: 36.1911,
      longitude: 44.0091
    };
    
    const isDupe12 = isDuplicate(venue1, venue2);
    const isDupe13 = isDuplicate(venue1, venue3);
    
    if (!isDupe12) {
      throw new Error('Failed to detect duplicate venues');
    }
    
    if (isDupe13) {
      throw new Error('Incorrectly marked different venues as duplicates');
    }
    
    logTest('Duplicate Detection', true, undefined, {
      venue1vs2: isDupe12,
      venue1vs3: isDupe13
    });
    
    return true;
  } catch (error: any) {
    logTest('Duplicate Detection', false, error.message);
    return false;
  }
}

// ============================================================
// TEST 10: Test Deduplication Function
// ============================================================
function testDeduplication() {
  try {
    const venues: VenueData[] = [
      {
        name: 'Hotel A',
        description: 'Description A',
        type: 'HOTEL',
        city: 'Baghdad'
      },
      {
        name: 'Hotel A',
        description: 'Description A duplicate',
        type: 'HOTEL',
        city: 'Baghdad'
      },
      {
        name: 'Hotel B',
        description: 'Description B',
        type: 'HOTEL',
        city: 'Erbil'
      }
    ];
    
    const deduplicated = deduplicateVenues(venues);
    
    if (deduplicated.length !== 2) {
      throw new Error(`Expected 2 unique venues, got ${deduplicated.length}`);
    }
    
    logTest('Deduplication Function', true, undefined, {
      original: venues.length,
      deduplicated: deduplicated.length
    });
    
    return true;
  } catch (error: any) {
    logTest('Deduplication Function', false, error.message);
    return false;
  }
}

// ============================================================
// TEST 11: Generate CSV Template
// ============================================================
function testGenerateTemplate() {
  try {
    const template = generateCSVTemplate();
    
    if (!template || template.length === 0) {
      throw new Error('Template generation failed');
    }
    
    const lines = template.split('\n');
    if (lines.length < 2) {
      throw new Error('Template must have header and sample rows');
    }
    
    logTest('Generate CSV Template', true, undefined, {
      lines: lines.length,
      hasHeader: lines[0].includes('name,description,type,city')
    });
    
    return template;
  } catch (error: any) {
    logTest('Generate CSV Template', false, error.message);
    return null;
  }
}

// ============================================================
// TEST 12: Export Venues to CSV
// ============================================================
function testExportToCSV(result: CSVImportResult) {
  try {
    if (!result || result.venues.length === 0) {
      throw new Error('No venues to export');
    }
    
    const csv = exportVenuesToCSV(result.venues);
    
    if (!csv || csv.length === 0) {
      throw new Error('Export produced empty CSV');
    }
    
    const lines = csv.split('\n');
    // Header + data rows
    const expectedLines = result.venues.length + 1;
    
    logTest('Export Venues to CSV', true, undefined, {
      venues: result.venues.length,
      csvLines: lines.length,
      expectedLines
    });
    
    return csv;
  } catch (error: any) {
    logTest('Export Venues to CSV', false, error.message);
    return null;
  }
}

// ============================================================
// TEST 13: Round-trip Test (Import -> Export -> Import)
// ============================================================
async function testRoundTrip(exportedCSV: string) {
  try {
    if (!exportedCSV) {
      throw new Error('No exported CSV provided');
    }
    
    const result = await importVenuesFromCSV(exportedCSV);
    
    if (!result.success) {
      throw new Error('Re-import failed');
    }
    
    logTest('Round-trip Test (Export->Import)', true, undefined, {
      reimported: result.imported,
      failed: result.failed
    });
    
    return true;
  } catch (error: any) {
    logTest('Round-trip Test (Export->Import)', false, error.message);
    return false;
  }
}

// ============================================================
// TEST 14: Test Error Handling - Invalid CSV
// ============================================================
async function testInvalidCSV() {
  try {
    const invalidCSV = 'invalid,csv,without,proper,headers\ndata,data,data,data,data';
    const result = await importVenuesFromCSV(invalidCSV);
    
    // Should fail gracefully
    if (result.success) {
      throw new Error('Should have failed on invalid CSV');
    }
    
    logTest('Error Handling - Invalid CSV', true, undefined, {
      errorCount: result.errors.length
    });
    
    return true;
  } catch (error: any) {
    logTest('Error Handling - Invalid CSV', false, error.message);
    return false;
  }
}

// ============================================================
// TEST 15: Test Error Handling - Empty CSV
// ============================================================
async function testEmptyCSV() {
  try {
    const emptyCSV = '';
    const result = await importVenuesFromCSV(emptyCSV);
    
    // Should fail gracefully
    if (result.success) {
      throw new Error('Should have failed on empty CSV');
    }
    
    logTest('Error Handling - Empty CSV', true, undefined, {
      errorCount: result.errors.length
    });
    
    return true;
  } catch (error: any) {
    logTest('Error Handling - Empty CSV', false, error.message);
    return false;
  }
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================
async function runAllTests() {
  console.log('\n========================================');
  console.log('🧪 CSV IMPORTER TEST SUITE');
  console.log('========================================\n');
  
  // Load sample CSV
  const csvContent = await testLoadSampleCSV();
  if (!csvContent) {
    console.log('\n❌ Cannot continue without sample CSV');
    return;
  }
  
  // Run validation tests
  testValidateCSVFormat(csvContent);
  
  // Import venues
  const importResult = await testImportVenues(csvContent);
  if (!importResult) {
    console.log('\n❌ Cannot continue without successful import');
    return;
  }
  
  // Validate imported data
  testValidateImportedData(importResult);
  testVenueTypesDistribution(importResult);
  
  // Test utility functions
  testCityNormalization();
  testPhoneValidation();
  testUrlValidation();
  testDuplicateDetection();
  testDeduplication();
  
  // Test template and export
  const template = testGenerateTemplate();
  const exportedCSV = testExportToCSV(importResult);
  
  // Test round-trip
  if (exportedCSV) {
    await testRoundTrip(exportedCSV);
  }
  
  // Test error handling
  await testInvalidCSV();
  await testEmptyCSV();
  
  // Print summary
  console.log('\n========================================');
  console.log('📊 TEST SUMMARY');
  console.log('========================================\n');
  
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   - ${r.name}`);
        if (r.error) console.log(`     Error: ${r.error}`);
      });
  }
  
  console.log('\n========================================\n');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
