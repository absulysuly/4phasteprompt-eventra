/**
 * Centralized Internationalization Configuration
 * 
 * This file provides a robust, scalable foundation for internationalization
 * that will handle future updates without breaking the application.
 */

export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
  dateFormat: string;
  numberFormat: string;
  currency: string;
}

export const SUPPORTED_LOCALES: Record<string, LocaleConfig> = {
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    flag: '🇮🇶',
    dateFormat: 'ar-IQ',
    numberFormat: 'ar-IQ',
    currency: 'IQD'
  },
  ku: {
    code: 'ku',
    name: 'Kurdish',
    nativeName: 'کوردی',
    direction: 'rtl',
    flag: '🏴',
    dateFormat: 'ckb-IQ',
    numberFormat: 'ckb-IQ',
    currency: 'IQD'
  }
} as const;

export const DEFAULT_LOCALE = 'ar';
export const LOCALE_CODES = Object.keys(SUPPORTED_LOCALES) as Array<keyof typeof SUPPORTED_LOCALES>;

/**
 * Validates if a locale code is supported
 */
export function isValidLocale(locale: string): locale is keyof typeof SUPPORTED_LOCALES {
  return locale in SUPPORTED_LOCALES;
}

/**
 * Gets locale configuration safely with fallback
 */
export function getLocaleConfig(locale: string): LocaleConfig {
  return SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES] || SUPPORTED_LOCALES[DEFAULT_LOCALE];
}

/**
 * Detects user's preferred locale from browser or URL
 */
export function detectLocale(acceptLanguage?: string, urlLocale?: string): string {
  // Priority: URL locale > Accept-Language > Default
  if (urlLocale && isValidLocale(urlLocale)) {
    return urlLocale;
  }

  if (acceptLanguage) {
    for (const locale of LOCALE_CODES) {
      if (acceptLanguage.toLowerCase().includes(locale.toLowerCase())) {
        return locale;
      }
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Formats dates according to locale
 */
export function formatDate(date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions): string {
  const config = getLocaleConfig(locale);
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return dateObj.toLocaleDateString(config.dateFormat, { ...defaultOptions, ...options });
}

/**
 * Formats numbers according to locale
 */
export function formatNumber(number: number, locale: string, options?: Intl.NumberFormatOptions): string {
  const config = getLocaleConfig(locale);
  return number.toLocaleString(config.numberFormat, options);
}

/**
 * Formats currency according to locale
 */
export function formatCurrency(amount: number, locale: string): string {
  const config = getLocaleConfig(locale);
  return formatNumber(amount, locale, {
    style: 'currency',
    currency: config.currency
  });
}

/**
 * Gets the text direction for a locale
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return getLocaleConfig(locale).direction;
}

/**
 * Checks if a locale uses RTL text direction
 */
export function isRTL(locale: string): boolean {
  return getTextDirection(locale) === 'rtl';
}

/**
 * Type-safe translation key validation
 * This helps catch missing translation keys at compile time
 */
export type TranslationKey = 
  | 'navigation.home'
  | 'navigation.events'
  | 'navigation.categories'
  | 'navigation.about'
  | 'navigation.login'
  | 'navigation.logout'
  | 'navigation.dashboard'
  | 'navigation.createEvent'
  | 'navigation.eventPlatform'
  | 'navigation.aiRecommendations'
  | 'navigation.tryItFree'
  | 'navigation.language'
  | 'hero.liveEventPlatform'
  | 'hero.registerNow'
  | 'hero.getTickets'
  | 'hero.joinSummit'
  | 'hero.exploreArt'
  | 'hero.eventStartsIn'
  | 'hero.days'
  | 'hero.hours'
  | 'hero.minutes'
  | 'hero.seconds'
  | 'register.joinIraqEvents'
  | 'register.createAccountSubtitle'
  | 'register.continueWithGoogle'
  | 'register.orCreateAccount'
  | 'register.fullNameOptional'
  | 'register.enterFullName'
  | 'register.enterEmail'
  | 'register.createPassword'
  | 'register.creatingAccount'
  | 'register.createAccount'
  | 'register.alreadyHaveAccount'
  | 'register.signInHere'
  | 'homepage.heroTitle'
  | 'homepage.heroSubtitle'
  | 'homepage.getStarted'
  | 'homepage.exploreEvents'
  | 'homepage.featuredEvents'
  | 'homepage.upcomingEvents'
  | 'homepage.allEvents'
  | 'homepage.viewAllEvents'
  | 'homepage.noEventsFound'
  | 'homepage.loading'
  | 'homepage.exploreCities'
  | 'homepage.exploreCitiesSubtitle'
  | 'homepage.exploreCategories'
  | 'homepage.exploreCategoriesSubtitle'
  | 'homepage.findPerfectEvent'
  | 'homepage.featuredCarousel'
  | 'events.title'
  | 'events.subtitle'
  | 'events.searchPlaceholder'
  | 'events.foundEvents'
  | 'events.noEventsFound'
  | 'events.noEventsMessage'
  | 'events.clearAllFilters'
  | 'events.viewDetails'
  | 'events.free'
  | 'events.soldOut'
  | 'events.byOrganizer'
  | 'events.createEventCta'
  | 'events.createEventSubtitle'
  | 'events.createYourEvent'
  | 'events.viewPublicPage'
  | 'dashboard.welcomeBack'
  | 'dashboard.subtitle'
  | 'dashboard.browseEvents'
  | 'dashboard.createEvent'
  | 'dashboard.cancel'
  | 'dashboard.createNewEvent'
  | 'dashboard.myEvents'
  | 'dashboard.noEvents'
  | 'dashboard.loadingEvents'
  | 'eventForm.eventName'
  | 'eventForm.eventNameRequired'
  | 'eventForm.eventNamePlaceholder'
  | 'eventForm.dateTime'
  | 'eventForm.dateTimeRequired'
  | 'eventForm.category'
  | 'eventForm.selectCategory'
  | 'eventForm.location'
  | 'eventForm.locationPlaceholder'
  | 'eventForm.description'
  | 'eventForm.descriptionPlaceholder'
  | 'eventForm.eventImage'
  | 'eventForm.selectImage'
  | 'eventForm.whatsappGroup'
  | 'eventForm.whatsappPlaceholder'
  | 'eventForm.whatsappPhone'
  | 'eventForm.whatsappPhonePlaceholder'
  | 'eventForm.contactMethod'
  | 'eventForm.contactPlaceholder'
  | 'eventForm.creating'
  | 'eventForm.createEvent'
  | 'categories.tech'
  | 'categories.business'
  | 'categories.music'
  | 'categories.musicConcerts'
  | 'categories.art'
  | 'categories.artsCulture'
  | 'categories.sports'
  | 'categories.sportsFitness'
  | 'categories.food'
  | 'categories.foodDrink'
  | 'categories.health'
  | 'categories.healthWellness'
  | 'categories.community'
  | 'categories.communitySocial'
  | 'categories.technologyInnovation'
  | 'categories.other'
  | 'login.welcomeBack'
  | 'login.subtitle'
  | 'login.continueWithGoogle'
  | 'login.orContinueWith'
  | 'login.emailAddress'
  | 'login.emailPlaceholder'
  | 'login.password'
  | 'login.passwordPlaceholder'
  | 'login.signingIn'
  | 'login.signIn'
  | 'login.noAccount'
  | 'login.createAccount'
  | 'login.invalidCredentials'
  | 'login.googleSignInError'
  | 'about.title'
  | 'about.subtitle'
  | 'common.loading'
  | 'common.error'
  | 'common.tryAgain'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.view'
  | 'common.close'
  | 'common.next'
  | 'common.previous'
  | 'common.search'
  | 'common.filter'
  | 'common.allCategories'
  | 'common.allCities'
  | 'common.allMonths'
  | 'common.allPrices'
  | 'common.free'
  | 'common.paid'
  | 'common.under25'
  | 'common.price25to50'
  | 'common.price50to100'
  | 'common.over100'
  | 'common.notSpecified'
  | 'common.contactInformation'
  | 'common.joinWhatsAppGroup'
  | 'common.price'
  | 'common.imageUnavailable'
  | 'cities.baghdad'
  | 'cities.basra'
  | 'cities.mosul'
  | 'cities.erbil'
  | 'cities.sulaymaniyah'
  | 'cities.duhok'
  | 'cities.kirkuk'
  | 'cities.anbar'
  | 'cities.najaf'
  | 'cities.karbala'
  | 'months.january'
  | 'months.february'
  | 'months.march'
  | 'months.april'
  | 'months.may'
  | 'months.june'
  | 'months.july'
  | 'months.august'
  | 'months.september'
  | 'months.october'
  | 'months.november'
  | 'months.december';

/**
 * Runtime validation of translation keys
 */
export function validateTranslationKey(key: string): key is TranslationKey {
  // This would be expanded with actual validation logic
  // For now, we just check basic structure
  return key.includes('.') && key.split('.').length >= 2;
}