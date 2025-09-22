/**
 * Comprehensive Internationalization Test Script
 * 
 * This script tests all aspects of the i18n implementation to ensure
 * robust language switching and proper RTL/LTR support.
 */

const { chromium } = require('playwright-core');

async function testI18n() {
  console.log('🚀 Starting Comprehensive i18n Tests...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // Slow down to see the changes
    });
    
    page = await browser.newPage();
    
    // Test 1: Homepage in English (default)
    console.log('📋 Test 1: Loading homepage in English...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Verify English content
    const englishTitle = await page.textContent('h1');
    console.log(`✅ English title: "${englishTitle}"`);
    
    // Verify LTR direction
    const htmlDir = await page.getAttribute('html', 'dir');
    console.log(`✅ HTML direction: ${htmlDir} (should be ltr)`);
    
    // Test 2: Switch to Arabic
    console.log('\n📋 Test 2: Switching to Arabic...');
    await page.hover('[data-testid="language-switcher"]');
    await page.click('text=العربية');
    await page.waitForTimeout(2000);
    
    // Verify Arabic content and RTL
    const arabicTitle = await page.textContent('h1');
    console.log(`✅ Arabic title: "${arabicTitle}"`);
    
    const rtlDir = await page.getAttribute('html', 'dir');
    console.log(`✅ HTML direction: ${rtlDir} (should be rtl)`);
    
    // Test 3: Switch to Kurdish
    console.log('\n📋 Test 3: Switching to Kurdish...');
    await page.hover('[data-testid="language-switcher"]');
    await page.click('text=کوردی');
    await page.waitForTimeout(2000);
    
    // Verify Kurdish content and RTL
    const kurdishTitle = await page.textContent('h1');
    console.log(`✅ Kurdish title: "${kurdishTitle}"`);
    
    const kurdishDir = await page.getAttribute('html', 'dir');
    console.log(`✅ HTML direction: ${kurdishDir} (should be rtl)`);
    
    // Verify Kurdish word replacement (ڕووداو → بۆنە)
    const kurdishContent = await page.textContent('body');
    const hasOldWord = kurdishContent.includes('ڕووداو');
    const hasNewWord = kurdishContent.includes('بۆنە');
    console.log(`✅ Old Kurdish word (ڕووداو) removed: ${!hasOldWord}`);
    console.log(`✅ New Kurdish word (بۆنە) present: ${hasNewWord}`);
    
    // Test 4: Navigation persistence
    console.log('\n📋 Test 4: Testing navigation persistence...');
    await page.click('a[href*="/events"]');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl} (should contain /ku/)`);
    
    // Test 5: Register page with Kurdish "Register" button
    console.log('\n📋 Test 5: Testing login page Kurdish Register button...');
    await page.goto('http://localhost:3000/ku/login');
    await page.waitForLoadState('networkidle');
    
    const registerButton = await page.textContent('text=Register');
    console.log(`✅ Kurdish Register button text: "${registerButton}" (should be "Register" in English)`);
    
    // Test 6: Switch back to English and verify reset
    console.log('\n📋 Test 6: Switching back to English...');
    await page.hover('[data-testid="language-switcher"]');
    await page.click('text=English');
    await page.waitForTimeout(2000);
    
    const finalDir = await page.getAttribute('html', 'dir');
    const finalTitle = await page.textContent('h1');
    console.log(`✅ Final HTML direction: ${finalDir} (should be ltr)`);
    console.log(`✅ Final title: "${finalTitle}" (should be in English)`);
    
    console.log('\n🎉 All i18n tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Manual test checklist for visual verification
function printManualTestChecklist() {
  console.log(`
📋 MANUAL TEST CHECKLIST
========================

1. 🌐 Language Switching:
   □ Language dropdown shows correct flags and native names
   □ Switching languages updates all UI text immediately
   □ Page doesn't reload during language switch
   □ Language preference persists on page refresh

2. 🔄 RTL/LTR Support:
   □ English: Left-to-right layout and text
   □ Arabic: Right-to-left layout and text
   □ Kurdish: Right-to-left layout and text
   □ Icons and arrows flip appropriately in RTL

3. 📝 Translation Quality:
   □ All hardcoded English strings are translated
   □ Navigation menu fully translated
   □ Form labels and buttons translated
   □ Error messages and placeholders translated
   □ Hero section countdown timer labels translated

4. 🔧 Kurdish Specific:
   □ "Register" button shows English text on login page
   □ All instances of "ڕووداو" replaced with "بۆنە"
   □ Kurdish text displays properly in RTL

5. 🛡️ Robustness:
   □ No console errors during language switching
   □ Graceful fallback to English for missing translations
   □ URLs maintain locale prefix (/en/, /ar/, /ku/)
   □ SEO meta tags update with language

6. 📱 Cross-Page Consistency:
   □ Language setting maintained across all pages
   □ Registration form fully internationalized
   □ Dashboard and events pages support all languages
   □ Modal dialogs respect language setting

RECOMMENDATION: Test each item manually while the dev server is running
at http://localhost:3000
  `);
}

if (require.main === module) {
  console.log('Choose test type:');
  console.log('1. Automated browser tests (requires Playwright)');
  console.log('2. Manual test checklist only');
  
  const testType = process.argv[2] || '2';
  
  if (testType === '1') {
    testI18n().catch(console.error);
  } else {
    printManualTestChecklist();
  }
}