import MultiVenueHomepage from '../components/MultiVenueHomepage';

export default function VenuesPage() {
  return <MultiVenueHomepage />;
}

export const metadata = {
  title: 'Discover Iraq & Kurdistan - Events, Hotels, Restaurants & Activities',
  description: 'Complete platform for discovering events, booking hotels, finding restaurants, and exploring activities in Iraq and Kurdistan Region.',
  keywords: 'Iraq, Kurdistan, events, hotels, restaurants, activities, travel, booking',
  openGraph: {
    title: 'Discover Iraq & Kurdistan - Complete Travel Platform',
    description: 'Events, Hotels, Restaurants & Activities all in one place',
    images: ['/og-venues.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Iraq & Kurdistan - Complete Travel Platform',
    description: 'Events, Hotels, Restaurants & Activities all in one place',
  },
};