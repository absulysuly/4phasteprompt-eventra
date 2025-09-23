#!/usr/bin/env node

/**
 * 🚨 WATER PROGRAM - STEP 4: STRICT TRANSLATION ENFORCEMENT
 * 
 * This script validates all translation keys used in the codebase against
 * the translation files to ensure no missing translations exist.
 * 
 * Features:
 * - Finds all t('key') usage in source files
 * - Validates against all language files (en, ar, ku)
 * - Reports missing translations with exact file locations
 * - Can be run manually or as part of build process
 * - Color-coded output for easy identification
 * 
 * Usage:
 *   node scripts/validate-translations.js
 *   npm run validate:translations
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

class TranslationValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.localesDir = path.join(this.projectRoot, 'public', 'locales');
    this.supportedLanguages = ['en', 'ar', 'ku'];
    this.sourceExtensions = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
    this.excludePatterns = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'];
    
    // Statistics
    this.stats = {
      filesScanned: 0,
      keysFound: 0,
      missingKeys: 0,
      totalTranslations: 0
    };

    this.missingTranslations = [];
    this.foundKeys = new Set();
  }

  /**
   * 🎯 Main validation function
   */
  async validate() {
    console.log(`${colors.cyan}${colors.bold}🚨 WATER PROGRAM - TRANSLATION VALIDATOR${colors.reset}\n`);
    
    try {
      // Step 1: Load all translation files
      console.log(`${colors.blue}📁 Loading translation files...${colors.reset}`);
      const translations = await this.loadTranslations();
      
      // Step 2: Find all translation keys in source code
      console.log(`${colors.blue}🔍 Scanning source files for translation keys...${colors.reset}`);
      const usedKeys = await this.findUsedTranslationKeys();
      
      // Step 3: Validate keys against translation files
      console.log(`${colors.blue}✅ Validating translation keys...${colors.reset}`);
      await this.validateKeys(usedKeys, translations);
      
      // Step 4: Generate report
      this.generateReport();
      
      // Step 5: Exit with appropriate code
      process.exit(this.stats.missingKeys > 0 ? 1 : 0);
      
    } catch (error) {
      console.error(`${colors.red}❌ Validation failed: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * 📁 Load all translation files from locales directory
   */
  async loadTranslations() {
    const translations = {};
    
    for (const lang of this.supportedLanguages) {
      const langDir = path.join(this.localesDir, lang);
      
      if (!fs.existsSync(langDir)) {
        throw new Error(`Language directory not found: ${langDir}`);
      }
      
      // Load common.json (main translation file)
      const commonFile = path.join(langDir, 'common.json');
      if (!fs.existsSync(commonFile)) {
        throw new Error(`Translation file not found: ${commonFile}`);
      }
      
      try {
        const content = fs.readFileSync(commonFile, 'utf8');
        translations[lang] = JSON.parse(content);
        
        // Count total translations
        this.stats.totalTranslations += this.countNestedKeys(translations[lang]);
        
        console.log(`${colors.green}  ✅ Loaded ${lang}: ${this.countNestedKeys(translations[lang])} keys${colors.reset}`);
      } catch (error) {
        throw new Error(`Failed to parse ${commonFile}: ${error.message}`);
      }
    }
    
    return translations;
  }

  /**
   * 🔍 Find all translation keys used in source files
   */
  async findUsedTranslationKeys() {
    const usedKeys = new Map(); // key -> [file locations]
    
    // Get all source files
    const sourceFiles = await this.getSourceFiles();
    
    for (const filePath of sourceFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const keys = this.extractTranslationKeys(content, filePath);
        
        keys.forEach(keyData => {
          if (!usedKeys.has(keyData.key)) {
            usedKeys.set(keyData.key, []);
          }
          usedKeys.get(keyData.key).push({
            file: filePath,
            line: keyData.line,
            column: keyData.column
          });
          this.foundKeys.add(keyData.key);
        });
        
        this.stats.filesScanned++;
      } catch (error) {
        console.warn(`${colors.yellow}⚠️  Warning: Could not read ${filePath}: ${error.message}${colors.reset}`);
      }
    }
    
    this.stats.keysFound = usedKeys.size;
    console.log(`${colors.green}  ✅ Found ${this.stats.keysFound} unique translation keys in ${this.stats.filesScanned} files${colors.reset}`);
    
    return usedKeys;
  }

  /**
   * 📄 Get all source files to scan
   */
  async getSourceFiles() {
    const files = new Set();
    
    for (const pattern of this.sourceExtensions) {
      const matchedFiles = glob.sync(pattern, {
        cwd: this.projectRoot,
        ignore: this.excludePatterns,
        absolute: true
      });
      
      matchedFiles.forEach(file => files.add(file));
    }
    
    return Array.from(files);
  }

  /**
   * 🔍 Extract translation keys from file content
   */
  extractTranslationKeys(content, filePath) {
    const keys = [];
    
    // Regex patterns to match t('key') and t("key") calls
    const patterns = [
      /\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*[,)]/g,
      /\{t\s*\(\s*['"`]([^'"`]+)['"`]\s*[,)]/g,
      /useTranslations\(\)\.t\s*\(\s*['"`]([^'"`]+)['"`]\s*[,)]/g
    ];
    
    const lines = content.split('\n');
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const key = match[1];
        
        // Find line number
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;
        const line = lines[lineNumber - 1];
        const column = match.index - beforeMatch.lastIndexOf('\n');
        
        keys.push({
          key,
          line: lineNumber,
          column,
          context: line.trim()
        });
      }
    });
    
    return keys;
  }

  /**
   * ✅ Validate keys against translation files
   */
  async validateKeys(usedKeys, translations) {
    for (const [key, locations] of usedKeys.entries()) {
      for (const lang of this.supportedLanguages) {
        if (!this.hasNestedKey(translations[lang], key)) {
          this.missingTranslations.push({
            key,
            language: lang,
            locations
          });
          this.stats.missingKeys++;
        }
      }
    }
  }

  /**
   * 🔍 Check if nested key exists in object
   */
  hasNestedKey(obj, key) {
    return key.split('.').reduce((current, keyPart) => {
      return current && current[keyPart];
    }, obj) !== undefined;
  }

  /**
   * 📊 Count nested keys in translation object
   */
  countNestedKeys(obj, prefix = '') {
    let count = 0;
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += this.countNestedKeys(obj[key], fullKey);
      } else {
        count++;
      }
    }
    return count;
  }

  /**
   * 📊 Generate validation report
   */
  generateReport() {
    console.log(`\n${colors.bold}${colors.cyan}📊 TRANSLATION VALIDATION REPORT${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════${colors.reset}\n`);
    
    // Statistics
    console.log(`${colors.bold}📈 Statistics:${colors.reset}`);
    console.log(`  Files Scanned: ${colors.blue}${this.stats.filesScanned}${colors.reset}`);
    console.log(`  Translation Keys Found: ${colors.blue}${this.stats.keysFound}${colors.reset}`);
    console.log(`  Total Translations: ${colors.blue}${this.stats.totalTranslations}${colors.reset}`);
    console.log(`  Missing Translations: ${this.stats.missingKeys > 0 ? colors.red : colors.green}${this.stats.missingKeys}${colors.reset}\n`);
    
    if (this.stats.missingKeys === 0) {
      console.log(`${colors.green}${colors.bold}🎉 SUCCESS: All translation keys are properly defined!${colors.reset}`);
      console.log(`${colors.green}✅ Your application is fully internationalized.${colors.reset}\n`);
      return;
    }
    
    // Group missing translations by key
    const missingByKey = new Map();
    this.missingTranslations.forEach(missing => {
      if (!missingByKey.has(missing.key)) {
        missingByKey.set(missing.key, {
          languages: [],
          locations: missing.locations
        });
      }
      missingByKey.get(missing.key).languages.push(missing.language);
    });
    
    console.log(`${colors.red}${colors.bold}❌ MISSING TRANSLATIONS:${colors.reset}\n`);
    
    for (const [key, data] of missingByKey.entries()) {
      console.log(`${colors.red}🔑 Key: "${colors.bold}${key}${colors.reset}${colors.red}"${colors.reset}`);
      console.log(`${colors.red}   Missing in: ${colors.bold}${data.languages.join(', ')}${colors.reset}`);
      console.log(`${colors.yellow}   Used in:${colors.reset}`);
      
      data.locations.forEach(location => {
        const relativePath = path.relative(this.projectRoot, location.file);
        console.log(`${colors.yellow}     📄 ${relativePath}:${location.line}${colors.reset}`);
      });
      console.log('');
    }
    
    console.log(`${colors.red}${colors.bold}❌ VALIDATION FAILED${colors.reset}`);
    console.log(`${colors.red}Please add the missing translation keys to your language files.${colors.reset}\n`);
  }
}

// 🚀 Run validation if called directly
if (require.main === module) {
  const validator = new TranslationValidator();
  validator.validate();
}

module.exports = TranslationValidator;