#!/usr/bin/env node

/**
 * i18n Translation Key Parity Checker
 * Validates that all translation keys exist across en.json, ar.json, and ku.json
 * Handles nested JSON objects by flattening them with dot notation
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Configuration
const TRANSLATION_FILES = {
  en: 'messages/en.json',
  ar: 'messages/ar.json', 
  ku: 'messages/ku.json'
};

const PRIMARY_LOCALE = 'en';

console.log('🌐 i18n Translation Key Parity Checker');
console.log('======================================');

/**
 * Recursively flatten a nested object into dot-notation keys
 * Example: { user: { name: "John" } } → { "user.name": "John" }
 */
function flattenObject(obj, prefix = '', result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      flattenObject(value, newKey, result);
    } else {
      // Add leaf values to result
      result[newKey] = value;
    }
  }
  return result;
}

/**
 * Load and parse a translation file
 */
function loadTranslationFile(filePath, locale) {
  try {
    console.log(`📖 Loading ${locale}: ${filePath}`);
    const content = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    const flattened = flattenObject(parsed);
    const keyCount = Object.keys(flattened).length;
    console.log(`   ✅ ${keyCount} translation keys found`);
    return flattened;
  } catch (error) {
    console.error(`❌ Failed to load ${locale} translations from ${filePath}:`);
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

/**
 * Find missing keys between two translation objects
 */
function findMissingKeys(sourceKeys, targetKeys, sourceLocale, targetLocale) {
  const missing = [];
  
  for (const key of sourceKeys) {
    if (!targetKeys.includes(key)) {
      missing.push(key);
    }
  }
  
  return missing;
}

/**
 * Main validation function
 */
function main() {
  // Load all translation files
  const translations = {};
  
  for (const [locale, filePath] of Object.entries(TRANSLATION_FILES)) {
    translations[locale] = loadTranslationFile(filePath, locale);
  }
  
  console.log('');
  
  // Get primary locale keys as the reference
  const primaryKeys = Object.keys(translations[PRIMARY_LOCALE]);
  console.log(`🔍 Using ${PRIMARY_LOCALE} as primary locale (${primaryKeys.length} keys)`);
  console.log('');
  
  // Track validation results
  let hasErrors = false;
  const results = {};
  
  // Validate each non-primary locale against primary
  for (const [locale, localeTranslations] of Object.entries(translations)) {
    if (locale === PRIMARY_LOCALE) continue;
    
    const localeKeys = Object.keys(localeTranslations);
    
    // Check for missing keys in target locale
    const missingInTarget = findMissingKeys(primaryKeys, localeKeys, PRIMARY_LOCALE, locale);
    
    // Check for extra keys in target locale (not in primary)
    const extraInTarget = findMissingKeys(localeKeys, primaryKeys, locale, PRIMARY_LOCALE);
    
    results[locale] = {
      total: localeKeys.length,
      missing: missingInTarget,
      extra: extraInTarget
    };
    
    // Report results for this locale
    console.log(`📋 Validation results for ${locale.toUpperCase()}:`);
    console.log(`   Total keys: ${localeKeys.length}`);
    
    if (missingInTarget.length === 0 && extraInTarget.length === 0) {
      console.log(`   ✅ Perfect parity with ${PRIMARY_LOCALE}`);
    } else {
      hasErrors = true;
      
      if (missingInTarget.length > 0) {
        console.log(`   ❌ ${missingInTarget.length} missing keys:`);
        const examples = missingInTarget.slice(0, 5); // Show first 5
        examples.forEach(key => console.log(`      - ${key}`));
        if (missingInTarget.length > 5) {
          console.log(`      ... and ${missingInTarget.length - 5} more`);
        }
      }
      
      if (extraInTarget.length > 0) {
        console.log(`   ⚠️  ${extraInTarget.length} extra keys (not in ${PRIMARY_LOCALE}):`);
        const examples = extraInTarget.slice(0, 3); // Show first 3
        examples.forEach(key => console.log(`      - ${key}`));
        if (extraInTarget.length > 3) {
          console.log(`      ... and ${extraInTarget.length - 3} more`);
        }
      }
    }
    console.log('');
  }
  
  // Final summary
  console.log('📊 SUMMARY:');
  console.log('============');
  
  if (!hasErrors) {
    console.log('✅ All translation files have perfect key parity!');
    console.log('🚀 i18n validation passed');
    process.exit(0);
  }
  
  console.log('❌ Translation key parity issues detected:');
  console.log('');
  
  for (const [locale, result] of Object.entries(results)) {
    if (result.missing.length > 0 || result.extra.length > 0) {
      console.log(`🔧 ${locale.toUpperCase()} fixes needed:`);
      if (result.missing.length > 0) {
        console.log(`   • Add ${result.missing.length} missing translation keys`);
      }
      if (result.extra.length > 0) {
        console.log(`   • Review ${result.extra.length} extra keys (may need to add to ${PRIMARY_LOCALE})`);
      }
    }
  }
  
  console.log('');
  console.log('💡 REMEDIATION STEPS:');
  console.log('   1. Review the missing/extra keys listed above');
  console.log('   2. Add missing translations to the appropriate JSON files');
  console.log('   3. Consider if extra keys should be added to the primary locale');
  console.log('   4. Run this script again to verify fixes');
  console.log('');
  console.log('📖 Translation files location:');
  for (const [locale, filePath] of Object.entries(TRANSLATION_FILES)) {
    console.log(`   ${locale}: ${filePath}`);
  }
  
  process.exit(1);
}

// Run the main function
main();