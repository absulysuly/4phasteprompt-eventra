import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import { loadMessages } from './messages';

// Can be imported from a shared config
export const locales = ['ar', 'ku'] as const;

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !(locales as readonly string[]).includes(locale)) {
    // default to Arabic if not provided
    locale = 'ar' as any;
  }

  const messages = await loadMessages(locale as typeof locales[number]);
  return {
    locale: locale as string,
    messages
  };
});
