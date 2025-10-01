import { useLanguage } from '../components/LanguageProvider'
import { useSimpleLanguage } from '../components/SimpleLanguageProvider'

// Unified translations hook that adapts to the available language provider.
export function useTranslations() {
  try {
    const lang = useLanguage() as any
    const t = (lang.t as any) || ((key: string) => key)
    return {
      t,
      locale: lang.language,
      setLocale: lang.setLanguage,
      isRTL: lang.isRTL,
    }
  } catch {
    // Fallback to simple provider if the advanced one is not in tree
    const simple = useSimpleLanguage()
    return {
      t: simple.t,
      locale: simple.language,
      setLocale: simple.setLanguage,
      isRTL: simple.isRTL,
    }
  }
}
