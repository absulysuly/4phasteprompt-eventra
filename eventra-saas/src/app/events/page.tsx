import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function EventsRedirectPage() {
  // Get user's preferred language from headers
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // Determine the best locale
  let locale = 'en'; // default
  
  if (acceptLanguage.includes('ar')) {
    locale = 'ar';
  } else if (acceptLanguage.includes('ku')) {
    locale = 'ku';
  }
  
  // Redirect to the localized events page
  redirect(`/${locale}/events`);
}