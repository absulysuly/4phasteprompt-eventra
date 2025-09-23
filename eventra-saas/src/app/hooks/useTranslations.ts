// In src/app/hooks/useTranslations.ts - Temporary fix
import { useSimpleLanguage } from '../components/SimpleLanguageProvider';

export function useTranslations() {
  const { t } = useSimpleLanguage();
  return { t };
}
