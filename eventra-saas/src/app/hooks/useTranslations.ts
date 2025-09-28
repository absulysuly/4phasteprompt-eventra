import { useContext } from 'react'
import { LanguageContext } from '../components/LanguageProvider' // Import the context directly

export function useTranslations() {
  const context = useContext(LanguageContext as any)
  if (!context) {
    // Provide fallback for SSR and missing provider
    return {
      t: (key: string) => key,
      locale: 'en' as const,
      setLocale: () => {}
    }
  }

  const t = context.t ?? ((key: string) => key)
  const locale = context.locale ?? 'en'
  const setLocale = context.setLocale ?? (() => {})

  return { t, locale, setLocale }
}
