// Centralized translation loaders for HMR-friendly dynamic imports
// and a single source for loading messages.

export const SUPPORTED_LOCALES = ['en', 'ar', 'ku'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export const loaders = {
  en: () => import('./en.json'),
  ar: () => import('./ar.json'),
  ku: () => import('./ku.json')
} as const;

export async function loadMessages(locale: Locale) {
  const mod = await loaders[locale]();
  return mod.default;
}
