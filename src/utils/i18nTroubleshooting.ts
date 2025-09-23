// 🔧 i18n Troubleshooting Guide & Solutions
// Implementation of fixes for common i18n issues mentioned in the checklist

import { i18n, routeConfig, getDirection, type Locale } from '../i18n/locales'

// 🔧 Issue #1: Language switch doesn't update existing content
export class I18nContentManager {
  private static instance: I18nContentManager
  private contentObservers: Map<string, MutationObserver> = new Map()

  static getInstance(): I18nContentManager {
    if (!this.instance) {
      this.instance = new I18nContentManager()
    }
    return this.instance
  }

  // Solution: Ensure all content is properly bound to i18n context
  ensureContentBinding(locale: Locale): void {
    // Force content update for dynamic content
    const dynamicElements = document.querySelectorAll('[data-i18n], [data-translate]')
    
    dynamicElements.forEach((element) => {
      const key = element.getAttribute('data-i18n') || element.getAttribute('data-translate')
      if (key) {
        // Update content based on locale
        this.updateElementContent(element as HTMLElement, key, locale)
      }
    })

    // Trigger content refresh events
    window.dispatchEvent(new CustomEvent('i18n:content-refresh', { detail: { locale } }))
  }

  private updateElementContent(element: HTMLElement, key: string, locale: Locale): void {
    // This would integrate with your translation system
    // For now, we'll add debugging info
    element.setAttribute('data-current-locale', locale)
    element.classList.add('i18n-updated')
    
    console.log(`Updated content for key: ${key}, locale: ${locale}`)
  }

  // Monitor content changes and ensure i18n binding
  observeContentChanges(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            const i18nElements = element.querySelectorAll('[data-i18n], [data-translate]')
            
            if (i18nElements.length > 0) {
              // Re-apply current locale to new elements
              const currentLocale = document.documentElement.getAttribute('lang') as Locale
              if (currentLocale && i18n.locales.includes(currentLocale)) {
                this.ensureContentBinding(currentLocale)
              }
            }
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    this.contentObservers.set('content-watcher', observer)
  }
}

// 🔧 Issue #2: RTL/LTR transition breaks layout
export class RTLLayoutManager {
  private static instance: RTLLayoutManager
  private layoutObserver: ResizeObserver | null = null

  static getInstance(): RTLLayoutManager {
    if (!this.instance) {
      this.instance = new RTLLayoutManager()
    }
    return this.instance
  }

  // Solution: Ensure proper CSS transitions and layout management
  setupRTLTransitions(): void {
    // Add CSS for smooth RTL/LTR transitions
    const styleSheet = document.createElement('style')
    styleSheet.textContent = `
      /* Smooth direction transitions */
      html[dir] {
        transition: none !important; /* Disable transitions on html to prevent jarring effects */
      }
      
      /* Ensure proper text alignment */
      [dir="rtl"] {
        text-align: right;
      }
      
      [dir="ltr"] {
        text-align: left;
      }
      
      /* Fix common layout issues */
      [dir="rtl"] .flex {
        flex-direction: row-reverse;
      }
      
      [dir="rtl"] .justify-start {
        justify-content: flex-end;
      }
      
      [dir="rtl"] .justify-end {
        justify-content: flex-start;
      }
      
      /* Padding and margin fixes */
      [dir="rtl"] .ml-4 {
        margin-left: 0;
        margin-right: 1rem;
      }
      
      [dir="rtl"] .mr-4 {
        margin-right: 0;
        margin-left: 1rem;
      }
      
      [dir="rtl"] .pl-4 {
        padding-left: 0;
        padding-right: 1rem;
      }
      
      [dir="rtl"] .pr-4 {
        padding-right: 0;
        padding-left: 1rem;
      }
      
      /* Form element fixes */
      [dir="rtl"] input,
      [dir="rtl"] textarea,
      [dir="rtl"] select {
        text-align: right;
        direction: rtl;
      }
      
      [dir="ltr"] input,
      [dir="ltr"] textarea,
      [dir="ltr"] select {
        text-align: left;
        direction: ltr;
      }
      
      /* Icon positioning fixes */
      [dir="rtl"] .icon-left {
        left: auto;
        right: 0.5rem;
      }
      
      [dir="rtl"] .icon-right {
        right: auto;
        left: 0.5rem;
      }
      
      /* Border radius fixes for RTL */
      [dir="rtl"] .rounded-l {
        border-radius: 0 0.375rem 0.375rem 0;
      }
      
      [dir="rtl"] .rounded-r {
        border-radius: 0.375rem 0 0 0.375rem;
      }
    `
    
    document.head.appendChild(styleSheet)
    console.log('✅ RTL/LTR CSS transitions configured')
  }

  // Fix layout breaks during direction changes
  fixLayoutBreaks(newDirection: 'rtl' | 'ltr'): void {
    // Force layout recalculation
    document.body.style.display = 'none'
    document.body.offsetHeight // Trigger reflow
    document.body.style.display = ''

    // Update flexbox containers
    const flexContainers = document.querySelectorAll('.flex, .d-flex, [style*="display: flex"]')
    flexContainers.forEach((container) => {
      const element = container as HTMLElement
      element.style.direction = newDirection
    })

    // Fix absolutely positioned elements
    const absoluteElements = document.querySelectorAll('[style*="position: absolute"]')
    absoluteElements.forEach((element) => {
      const el = element as HTMLElement
      if (newDirection === 'rtl') {
        // Swap left/right positioning
        const left = el.style.left
        const right = el.style.right
        if (left && !right) {
          el.style.right = left
          el.style.left = 'auto'
        }
      } else {
        // Restore LTR positioning
        const right = el.style.right
        const left = el.style.left
        if (right && left === 'auto') {
          el.style.left = right
          el.style.right = 'auto'
        }
      }
    })

    console.log(`✅ Layout fixes applied for ${newDirection} direction`)
  }

  // Monitor layout during direction changes
  observeLayoutStability(): void {
    if (this.layoutObserver) {
      this.layoutObserver.disconnect()
    }

    this.layoutObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        // Detect layout shifts during direction changes
        if (entry.contentRect.width !== entry.target.clientWidth) {
          console.warn('⚠️ Layout shift detected, applying fixes...')
          const direction = document.documentElement.getAttribute('dir') as 'rtl' | 'ltr'
          if (direction) {
            this.fixLayoutBreaks(direction)
          }
        }
      })
    })

    this.layoutObserver.observe(document.body)
  }
}

// 🔧 Issue #3: Redirects create infinite loops
export class RedirectManager {
  private static instance: RedirectManager
  private redirectHistory: string[] = []
  private readonly maxRedirects = 5

  static getInstance(): RedirectManager {
    if (!this.instance) {
      this.instance = new RedirectManager()
    }
    return this.instance
  }

  // Solution: Proper redirect handling with loop detection
  handleLocaleRedirect(currentPath: string, targetLocale: Locale): string | null {
    // Check for infinite redirect loops
    if (this.redirectHistory.length >= this.maxRedirects) {
      console.error('🛑 Infinite redirect loop detected, stopping redirects')
      this.redirectHistory = []
      return null
    }

    // Parse current path
    const pathSegments = currentPath.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]

    // Check if first segment is a locale
    const isCurrentLocale = i18n.locales.includes(firstSegment as Locale)
    
    let targetPath: string

    if (isCurrentLocale) {
      // Replace existing locale
      pathSegments[0] = targetLocale
      targetPath = '/' + pathSegments.join('/')
    } else {
      // Add locale prefix to unprefixed route
      targetPath = `/${targetLocale}${currentPath}`
    }

    // Validate the target path exists in route config
    const route = this.extractRouteFromPath(targetPath)
    const validRoute = this.validateRoute(route, targetLocale)

    if (!validRoute) {
      console.warn(`⚠️ Invalid route: ${targetPath}, redirecting to home`)
      targetPath = routeConfig.home[targetLocale]
    }

    // Add to redirect history
    this.redirectHistory.push(currentPath)

    // Clean up old redirect history
    if (this.redirectHistory.length > this.maxRedirects) {
      this.redirectHistory = this.redirectHistory.slice(-this.maxRedirects)
    }

    console.log(`📍 Redirecting: ${currentPath} → ${targetPath}`)
    return targetPath
  }

  private extractRouteFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean)
    if (segments.length < 2) return 'home'
    
    // Remove locale segment
    if (i18n.locales.includes(segments[0] as Locale)) {
      segments.shift()
    }
    
    return segments[0] || 'home'
  }

  private validateRoute(route: string, locale: Locale): boolean {
    const routeKey = route as keyof typeof routeConfig
    return routeKey in routeConfig && locale in routeConfig[routeKey]
  }

  // Clear redirect history (useful for testing)
  clearRedirectHistory(): void {
    this.redirectHistory = []
    console.log('🧹 Redirect history cleared')
  }

  // Get redirect statistics
  getRedirectStats(): { history: string[], count: number } {
    return {
      history: [...this.redirectHistory],
      count: this.redirectHistory.length
    }
  }
}

// 🔧 Issue #4: Route parameters get lost
export class RouteParameterManager {
  private static instance: RouteParameterManager

  static getInstance(): RouteParameterManager {
    if (!this.instance) {
      this.instance = new RouteParameterManager()
    }
    return this.instance
  }

  // Solution: Preserve route parameters during locale changes
  preserveRouteParameters(currentPath: string, targetLocale: Locale): string {
    // Parse current URL to extract parameters
    const url = new URL(currentPath, window.location.origin)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const searchParams = url.searchParams
    const hash = url.hash

    // Extract current locale
    const currentLocale = pathSegments[0] as Locale
    const isLocaleInPath = i18n.locales.includes(currentLocale)

    let newPathSegments: string[]

    if (isLocaleInPath) {
      // Replace locale but preserve all other segments
      newPathSegments = [targetLocale, ...pathSegments.slice(1)]
    } else {
      // Add locale prefix, preserve all segments
      newPathSegments = [targetLocale, ...pathSegments]
    }

    // Rebuild URL with preserved parameters
    let newPath = '/' + newPathSegments.join('/')
    
    // Add query parameters back
    if (searchParams.toString()) {
      newPath += '?' + searchParams.toString()
    }
    
    // Add hash back
    if (hash) {
      newPath += hash
    }

    console.log(`📍 Parameters preserved: ${currentPath} → ${newPath}`)
    return newPath
  }

  // Extract route parameters for use in components
  extractParameters(path: string): {
    locale: Locale | null,
    route: string,
    params: Record<string, string>,
    query: URLSearchParams,
    hash: string
  } {
    const url = new URL(path, window.location.origin)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    
    let locale: Locale | null = null
    let routeSegments = pathSegments

    // Check if first segment is locale
    if (pathSegments.length > 0 && i18n.locales.includes(pathSegments[0] as Locale)) {
      locale = pathSegments[0] as Locale
      routeSegments = pathSegments.slice(1)
    }

    // Extract route and parameters
    const route = routeSegments[0] || 'home'
    const params: Record<string, string> = {}

    // Extract dynamic route parameters (e.g., /event/123 → { id: '123' })
    if (routeSegments.length > 1) {
      // This is a simplified parameter extraction
      // In a real app, you'd have route definitions to match against
      for (let i = 1; i < routeSegments.length; i++) {
        params[`param${i}`] = routeSegments[i]
      }
      
      // Common parameter patterns
      if (route === 'event' && routeSegments[1]) {
        params.id = routeSegments[1]
      }
    }

    return {
      locale,
      route,
      params,
      query: url.searchParams,
      hash: url.hash
    }
  }
}

// 🧰 Master Troubleshooting Manager
export class I18nTroubleshooter {
  private static instance: I18nTroubleshooter
  private contentManager = I18nContentManager.getInstance()
  private layoutManager = RTLLayoutManager.getInstance()
  private redirectManager = RedirectManager.getInstance()
  private parameterManager = RouteParameterManager.getInstance()

  static getInstance(): I18nTroubleshooter {
    if (!this.instance) {
      this.instance = new I18nTroubleshooter()
    }
    return this.instance
  }

  // 🚀 Initialize all troubleshooting solutions
  initialize(): void {
    console.log('🔧 Initializing i18n troubleshooting solutions...')
    
    // Set up content management
    this.contentManager.observeContentChanges()
    
    // Set up layout management
    this.layoutManager.setupRTLTransitions()
    this.layoutManager.observeLayoutStability()
    
    // Clear any existing redirect loops
    this.redirectManager.clearRedirectHistory()
    
    console.log('✅ i18n troubleshooting solutions initialized')
  }

  // 🔧 Handle language switch with all fixes
  handleLanguageSwitch(newLocale: Locale): void {
    console.log(`🔄 Switching to ${newLocale} with troubleshooting fixes...`)
    
    const currentPath = window.location.pathname + window.location.search + window.location.hash
    
    // 1. Handle redirects properly
    const newPath = this.parameterManager.preserveRouteParameters(currentPath, newLocale)
    
    // 2. Update DOM attributes
    document.documentElement.setAttribute('lang', newLocale)
    document.documentElement.setAttribute('dir', getDirection(newLocale))
    
    // 3. Fix layout issues
    this.layoutManager.fixLayoutBreaks(getDirection(newLocale))
    
    // 4. Update content binding
    this.contentManager.ensureContentBinding(newLocale)
    
    // 5. Navigate to new URL (this would integrate with your router)
    console.log(`📍 Would navigate to: ${newPath}`)
    
    // 6. Verify the switch was successful
    this.verifyLanguageSwitch(newLocale)
  }

  // ✅ Verify that language switch was successful
  private verifyLanguageSwitch(expectedLocale: Locale): void {
    setTimeout(() => {
      const actualLang = document.documentElement.getAttribute('lang')
      const actualDir = document.documentElement.getAttribute('dir')
      const expectedDir = getDirection(expectedLocale)
      
      if (actualLang === expectedLocale && actualDir === expectedDir) {
        console.log('✅ Language switch verification passed')
      } else {
        console.error('❌ Language switch verification failed:', {
          expected: { lang: expectedLocale, dir: expectedDir },
          actual: { lang: actualLang, dir: actualDir }
        })
      }
    }, 100)
  }

  // 📊 Get diagnostics information
  getDiagnostics(): {
    currentLocale: string | null,
    direction: string | null,
    redirectHistory: string[],
    routeInfo: ReturnType<RouteParameterManager['extractParameters']>
  } {
    const currentPath = window.location.pathname + window.location.search + window.location.hash
    
    return {
      currentLocale: document.documentElement.getAttribute('lang'),
      direction: document.documentElement.getAttribute('dir'),
      redirectHistory: this.redirectManager.getRedirectStats().history,
      routeInfo: this.parameterManager.extractParameters(currentPath)
    }
  }

  // 🧪 Run self-diagnostics
  runDiagnostics(): boolean {
    console.log('🔍 Running i18n diagnostics...')
    
    const diagnostics = this.getDiagnostics()
    let hasIssues = false
    
    // Check if locale is valid
    if (!diagnostics.currentLocale || !i18n.locales.includes(diagnostics.currentLocale as Locale)) {
      console.error('❌ Invalid or missing locale')
      hasIssues = true
    }
    
    // Check if direction matches locale
    const expectedDirection = diagnostics.currentLocale ? getDirection(diagnostics.currentLocale as Locale) : null
    if (diagnostics.direction !== expectedDirection) {
      console.error('❌ Direction mismatch')
      hasIssues = true
    }
    
    // Check for redirect loops
    if (diagnostics.redirectHistory.length >= 3) {
      console.warn('⚠️ Multiple recent redirects detected')
    }
    
    if (!hasIssues) {
      console.log('✅ i18n diagnostics passed')
    }
    
    return !hasIssues
  }
}

// 🌐 Global troubleshooting utilities
declare global {
  interface Window {
    i18nTroubleshooter: I18nTroubleshooter
    fixI18n: () => void
    diagI18n: () => void
  }
}

// Make troubleshooting utilities available globally
if (typeof window !== 'undefined') {
  window.i18nTroubleshooter = I18nTroubleshooter.getInstance()
  window.fixI18n = () => {
    const troubleshooter = I18nTroubleshooter.getInstance()
    troubleshooter.initialize()
    console.log('🔧 i18n fixes applied')
  }
  window.diagI18n = () => {
    const troubleshooter = I18nTroubleshooter.getInstance()
    troubleshooter.runDiagnostics()
    console.log('📊 Diagnostics:', troubleshooter.getDiagnostics())
  }
}

export default I18nTroubleshooter