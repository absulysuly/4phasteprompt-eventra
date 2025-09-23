import { useContext } from 'react'
import * as ProviderModule from '../components/LanguageProvider' // relative to src/app/hooks

const LanguageContext = (ProviderModule as any).LanguageContext ?? (ProviderModule as any).default?.LanguageContext

export function useTranslations() {
  const context = useContext(LanguageContext as any)
  if (!context) {
    throw new Error('useTranslations must be used within LanguageProvider')
  }

  const t = context.t ?? ((key: string) => key)
  const locale = context.locale
  const setLocale = context.setLocale

  return { t, locale, setLocale }
}
