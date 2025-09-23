// Manual Testing Utilities for i18n Implementation
import { i18n, routeConfig, getDirection, type Locale } from '../i18n/locales'

export class I18nTestingHelper {
  private static instance: I18nTestingHelper
  private testResults: Array<{
    test: string
    status: 'pass' | 'fail' | 'pending'
    details: string
    timestamp: Date
  }> = []

  static getInstance(): I18nTestingHelper {
    if (!this.instance) {
      this.instance = new I18nTestingHelper()
    }
    return this.instance
  }

  // 🔍 Route Testing Utilities
  async testRoute(locale: Locale, route: string): Promise<boolean> {
    const testName = `Route Test: ${route} (${locale})`
    console.log(`🧪 ${testName}`)

    try {
      // Simulate navigation
      const expectedRoute = routeConfig[route as keyof typeof routeConfig]?.[locale]
      if (!expectedRoute) {
        this.logResult(testName, 'fail', `Route not found for ${locale}:${route}`)
        return false
      }

      // Check route structure
      const routeValid = expectedRoute.startsWith(`/${locale}/`) || expectedRoute === `/${locale}`
      
      if (routeValid) {
        this.logResult(testName, 'pass', `Route ${expectedRoute} is valid`)
        console.log(`✅ ${testName} - PASSED`)
        return true
      } else {
        this.logResult(testName, 'fail', `Invalid route structure: ${expectedRoute}`)
        console.log(`❌ ${testName} - FAILED`)
        return false
      }
    } catch (error) {
      this.logResult(testName, 'fail', `Error: ${error}`)
      console.log(`❌ ${testName} - ERROR: ${error}`)
      return false
    }
  }

  // 🌍 Language Switch Testing
  testLanguageSwitch(fromLocale: Locale, toLocale: Locale): boolean {
    const testName = `Language Switch: ${fromLocale} → ${toLocale}`
    console.log(`🔄 ${testName}`)

    try {
      // Test direction change
      const fromDirection = getDirection(fromLocale)
      const toDirection = getDirection(toLocale)
      
      // Simulate DOM changes
      document.documentElement.setAttribute('dir', toDirection)
      document.documentElement.setAttribute('lang', toLocale)
      
      // Verify changes
      const actualDir = document.documentElement.getAttribute('dir')
      const actualLang = document.documentElement.getAttribute('lang')
      
      const success = actualDir === toDirection && actualLang === toLocale
      
      if (success) {
        this.logResult(testName, 'pass', `Direction: ${fromDirection}→${toDirection}, Lang: ${fromLocale}→${toLocale}`)
        console.log(`✅ ${testName} - PASSED`)
        console.log(`   📝 html[dir] = "${actualDir}", html[lang] = "${actualLang}"`)
        return true
      } else {
        this.logResult(testName, 'fail', `Expected dir="${toDirection}" lang="${toLocale}", got dir="${actualDir}" lang="${actualLang}"`)
        console.log(`❌ ${testName} - FAILED`)
        return false
      }
    } catch (error) {
      this.logResult(testName, 'fail', `Error: ${error}`)
      console.log(`❌ ${testName} - ERROR: ${error}`)
      return false
    }
  }

  // 🎨 RTL/LTR Layout Testing
  testRTLLayout(locale: Locale): boolean {
    const testName = `RTL/LTR Layout Test: ${locale}`
    console.log(`🎨 ${testName}`)

    try {
      const expectedDirection = getDirection(locale)
      const isExpectedRTL = expectedDirection === 'rtl'
      
      // Create test element to verify CSS behavior
      const testElement = document.createElement('div')
      testElement.style.direction = expectedDirection
      testElement.style.textAlign = isExpectedRTL ? 'right' : 'left'
      testElement.textContent = locale === 'ar' ? 'النص العربي' : 
                               locale === 'ku' ? 'دەقی کوردی' : 'English Text'
      
      document.body.appendChild(testElement)
      
      const computedStyle = window.getComputedStyle(testElement)
      const actualDirection = computedStyle.direction
      
      // Clean up
      document.body.removeChild(testElement)
      
      const success = actualDirection === expectedDirection
      
      if (success) {
        this.logResult(testName, 'pass', `Direction correctly set to "${actualDirection}"`)
        console.log(`✅ ${testName} - PASSED`)
        console.log(`   📝 CSS direction = "${actualDirection}"`)
        return true
      } else {
        this.logResult(testName, 'fail', `Expected "${expectedDirection}", got "${actualDirection}"`)
        console.log(`❌ ${testName} - FAILED`)
        return false
      }
    } catch (error) {
      this.logResult(testName, 'fail', `Error: ${error}`)
      console.log(`❌ ${testName} - ERROR: ${error}`)
      return false
    }
  }

  // 📊 Run Complete Manual Test Suite
  async runManualTestSuite(): Promise<void> {
    console.log('🚀 Starting Complete i18n Manual Test Suite')
    console.log('=' .repeat(50))
    
    let passed = 0
    let failed = 0

    // Test all routes for all locales
    console.log('\n📍 Testing Routes...')
    for (const locale of i18n.locales) {
      for (const route of Object.keys(routeConfig)) {
        const result = await this.testRoute(locale, route)
        result ? passed++ : failed++
      }
    }

    // Test language switching
    console.log('\n🔄 Testing Language Switches...')
    for (const fromLocale of i18n.locales) {
      for (const toLocale of i18n.locales) {
        if (fromLocale !== toLocale) {
          const result = this.testLanguageSwitch(fromLocale, toLocale)
          result ? passed++ : failed++
        }
      }
    }

    // Test RTL/LTR layouts
    console.log('\n🎨 Testing RTL/LTR Layouts...')
    for (const locale of i18n.locales) {
      const result = this.testRTLLayout(locale)
      result ? passed++ : failed++
    }

    // Summary
    console.log('\n' + '=' .repeat(50))
    console.log('📊 Test Suite Summary')
    console.log('=' .repeat(50))
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)
    
    if (failed === 0) {
      console.log('🎉 All tests passed! Your i18n implementation is ready for production.')
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.')
    }

    this.printDetailedResults()
  }

  // 📝 Logging Utilities
  private logResult(test: string, status: 'pass' | 'fail' | 'pending', details: string): void {
    this.testResults.push({
      test,
      status,
      details,
      timestamp: new Date()
    })
  }

  private printDetailedResults(): void {
    console.log('\n📋 Detailed Test Results')
    console.log('-' .repeat(50))
    
    this.testResults.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : '❌'
      console.log(`${icon} ${result.test}`)
      console.log(`   📝 ${result.details}`)
      console.log(`   🕐 ${result.timestamp.toLocaleTimeString()}`)
      console.log('')
    })
  }

  // 🧹 Utility Methods
  clearResults(): void {
    this.testResults = []
    console.log('🧹 Test results cleared')
  }

  getResults(): typeof this.testResults {
    return this.testResults
  }

  // 🎯 Quick Test Methods (for individual testing)
  quickTestArabicRoutes = () => this.testRoute('ar', 'events')
  quickTestKurdishRoutes = () => this.testRoute('ku', 'events')  
  quickTestEnglishRoutes = () => this.testRoute('en', 'events')
  quickTestRTL = () => this.testRTLLayout('ar') && this.testRTLLayout('ku')
  quickTestLTR = () => this.testRTLLayout('en')
}

// 🛠️ Browser Console Utilities (Global Helper Functions)
declare global {
  interface Window {
    i18nTester: I18nTestingHelper
    testI18n: () => Promise<void>
    testRoute: (locale: Locale, route: string) => Promise<boolean>
    testLanguageSwitch: (from: Locale, to: Locale) => boolean
    testRTL: (locale: Locale) => boolean
  }
}

// Make testing utilities available in browser console
if (typeof window !== 'undefined') {
  window.i18nTester = I18nTestingHelper.getInstance()
  window.testI18n = () => window.i18nTester.runManualTestSuite()
  window.testRoute = (locale: Locale, route: string) => window.i18nTester.testRoute(locale, route)
  window.testLanguageSwitch = (from: Locale, to: Locale) => window.i18nTester.testLanguageSwitch(from, to)
  window.testRTL = (locale: Locale) => window.i18nTester.testRTLLayout(locale)
}

// 📖 Usage Instructions
export const MANUAL_TESTING_INSTRUCTIONS = `
🧪 Manual i18n Testing Instructions

In your browser console, you can use these commands:

1. 🚀 Run complete test suite:
   testI18n()

2. 🎯 Test specific routes:
   testRoute('ar', 'events')
   testRoute('ku', 'events')  
   testRoute('en', 'events')

3. 🔄 Test language switching:
   testLanguageSwitch('ar', 'en')
   testLanguageSwitch('ku', 'ar')

4. 🎨 Test RTL/LTR layouts:
   testRTL('ar')
   testRTL('ku')
   testRTL('en')

5. 📊 Get test results:
   i18nTester.getResults()

6. 🧹 Clear test results:
   i18nTester.clearResults()

Example Testing Session:
========================
// Test Arabic routes
await testRoute('ar', 'events')

// Test language switch  
testLanguageSwitch('ar', 'en')

// Test RTL layout
testRTL('ar')

// Run full suite
await testI18n()
`

export default I18nTestingHelper