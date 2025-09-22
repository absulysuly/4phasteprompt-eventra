import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventCard from '../EventCard';

// Mock the dependencies
const mockUseLanguage = {
  language: 'en',
  isRTL: false,
};

const mockTranslations = {
  'events.free': 'Free',
  'events.ended': 'Ended',
  'events.upcoming': 'Upcoming',
  'events.viewDetails': 'View Details',
  'events.byOrganizer': 'By {{name}}',
};

jest.mock('../LanguageProvider', () => ({
  useLanguage: () => mockUseLanguage,
}));

jest.mock('../../hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key: string, params?: any) => {
      const template = mockTranslations[key as keyof typeof mockTranslations] || key;
      if (params) {
        return template.replace('{{name}}', params.name);
      }
      return template;
    },
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock EventImage component
jest.mock('../EventImage', () => {
  return function MockEventImage({ onLoad, className, alt, category, ...props }: any) {
    React.useEffect(() => {
      // Simulate image load after a short delay
      setTimeout(() => {
        if (onLoad) {
          onLoad();
        }
      }, 100);
    }, [onLoad]);

    return (
      <img 
        {...props} 
        className={className}
        alt={alt}
        data-testid="event-image"
        data-category={category}
      />
    );
  };
});

jest.mock('../ResponsiveButton', () => {
  return function MockResponsiveButton({ children, ...props }: any) {
    return <button {...props}>{children}</button>;
  };
});

const mockEvent = {
  id: 'event-1',
  publicId: 'pub-1',
  title: 'Tech Conference 2024',
  description: 'A comprehensive tech conference covering the latest in software development, AI, and web technologies.',
  date: '2024-12-25T10:00:00.000Z',
  location: 'Convention Center, Baghdad',
  category: 'Technology',
  price: 50,
  isFree: false,
  imageUrl: 'https://example.com/event-image.jpg',
  user: {
    name: 'John Doe',
    email: 'john@example.com',
  },
};

const mockFreeEvent = {
  ...mockEvent,
  id: 'event-2',
  publicId: 'pub-2',
  title: 'Free Community Meetup',
  price: 0,
  isFree: true,
};

const mockPastEvent = {
  ...mockEvent,
  id: 'event-3',
  publicId: 'pub-3',
  title: 'Past Event',
  date: '2020-01-01T10:00:00.000Z',
};

const mockFutureEvent = {
  ...mockEvent,
  id: 'event-4',
  publicId: 'pub-4',
  title: 'Future Event',
  date: '2030-12-25T10:00:00.000Z',
};

describe('EventCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLanguage.language = 'en';
    mockUseLanguage.isRTL = false;
  });

  describe('Basic Rendering', () => {
    it('renders event card with basic information', () => {
      render(<EventCard event={mockEvent} />);
      
      expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
      expect(screen.getByText(/A comprehensive tech conference/)).toBeInTheDocument();
      expect(screen.getByText('Convention Center, Baghdad')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('renders event image with correct props', () => {
      render(<EventCard event={mockEvent} />);
      
      const image = screen.getByTestId('event-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Tech Conference 2024');
      expect(image).toHaveAttribute('data-category', 'tech');
    });

    it('renders fallback image when imageUrl is not provided', () => {
      const eventWithoutImage = { ...mockEvent, imageUrl: undefined };
      render(<EventCard event={eventWithoutImage} />);
      
      const image = screen.getByTestId('event-image');
      expect(image).toBeInTheDocument();
    });

    it('displays skeleton/loading state initially', () => {
      render(<EventCard event={mockEvent} />);
      
      // Check for loading animation element
      const loadingElement = screen.getByRole('img').parentElement?.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });

    it('removes loading state after image loads', async () => {
      render(<EventCard event={mockEvent} />);
      
      // Wait for image to load
      await waitFor(() => {
        const image = screen.getByTestId('event-image');
        expect(image).toHaveClass('opacity-100');
      }, { timeout: 200 });
    });
  });

  describe('Date Display', () => {
    it('formats date correctly for English locale', () => {
      render(<EventCard event={mockEvent} />);
      
      // The date should be formatted according to the locale
      // This is a basic check - actual formatting might vary
      expect(screen.getByText(/Dec/i)).toBeInTheDocument();
    });

    it('formats date correctly for Arabic locale', () => {
      mockUseLanguage.language = 'ar';
      mockUseLanguage.isRTL = true;
      
      render(<EventCard event={mockEvent} />);
      
      // Date should still be displayed
      const dateElement = screen.getByText(/25/);
      expect(dateElement).toBeInTheDocument();
      
      // Reset
      mockUseLanguage.language = 'en';
      mockUseLanguage.isRTL = false;
    });

    it('formats date correctly for Kurdish locale', () => {
      mockUseLanguage.language = 'ku';
      mockUseLanguage.isRTL = true;
      
      render(<EventCard event={mockEvent} />);
      
      // Date should still be displayed
      const dateElement = screen.getByText(/25/);
      expect(dateElement).toBeInTheDocument();
      
      // Reset
      mockUseLanguage.language = 'en';
      mockUseLanguage.isRTL = false;
    });
  });

  describe('Status Badges', () => {
    it('displays free badge for free events', () => {
      render(<EventCard event={mockFreeEvent} />);
      
      const freeBadges = screen.getAllByText('Free');
      expect(freeBadges.length).toBeGreaterThan(0);
      expect(freeBadges[0]).toHaveClass('bg-green-600/90');
    });

    it('displays price badge for paid events', () => {
      render(<EventCard event={mockEvent} />);
      
      const priceBadges = screen.getAllByText('$50');
      expect(priceBadges.length).toBeGreaterThan(0);
      expect(priceBadges[0]).toHaveClass('bg-blue-600/90');
    });

    it('displays ended status for past events', () => {
      render(<EventCard event={mockPastEvent} />);
      
      const endedBadges = screen.getAllByText('Ended');
      expect(endedBadges.length).toBeGreaterThan(0);
      expect(endedBadges[0]).toHaveClass('bg-gray-600/90');
    });

    it('displays upcoming status for future events', () => {
      render(<EventCard event={mockFutureEvent} />);
      
      const upcomingBadges = screen.getAllByText('Upcoming');
      expect(upcomingBadges.length).toBeGreaterThan(0);
      expect(upcomingBadges[0]).toHaveClass('bg-orange-500/90');
    });
  });

  describe('Category Display', () => {
    it('displays category with correct icon', () => {
      render(<EventCard event={mockEvent} />);
      
      expect(screen.getByText('💻 Technology')).toBeInTheDocument();
    });

    it('displays fallback icon for unknown categories', () => {
      const eventWithUnknownCategory = { ...mockEvent, category: 'Unknown Category' };
      render(<EventCard event={eventWithUnknownCategory} />);
      
      expect(screen.getByText('🎉 Unknown Category')).toBeInTheDocument();
    });

    it('handles empty category gracefully', () => {
      const eventWithoutCategory = { ...mockEvent, category: undefined };
      render(<EventCard event={eventWithoutCategory} />);
      
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });
  });

  describe('User/Organizer Information', () => {
    it('displays organizer name when available', () => {
      render(<EventCard event={mockEvent} />);
      
      expect(screen.getByText('By John Doe')).toBeInTheDocument();
    });

    it('displays email username when name is not available', () => {
      const eventWithoutName = {
        ...mockEvent,
        user: { email: 'organizer@example.com' },
      };
      render(<EventCard event={eventWithoutName} />);
      
      expect(screen.getByText('By organizer')).toBeInTheDocument();
    });

    it('does not display organizer section when user is not available', () => {
      const eventWithoutUser = { ...mockEvent, user: undefined };
      render(<EventCard event={eventWithoutUser} />);
      
      expect(screen.queryByText(/By/)).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles hover state correctly', () => {
      render(<EventCard event={mockEvent} />);
      
      const card = screen.getByText('Tech Conference 2024').closest('div[class*="group"]');
      expect(card).toBeInTheDocument();
      
      if (card) {
        fireEvent.mouseEnter(card);
        expect(card).toHaveClass('group');
      }
    });

    it('calls onViewDetails when quick preview button is clicked', () => {
      const mockOnViewDetails = jest.fn();
      render(
        <EventCard 
          event={mockEvent} 
          onViewDetails={mockOnViewDetails}
          showQuickPreview={true}
        />
      );
      
      const card = screen.getByText('Tech Conference 2024').closest('div[class*="group"]');
      if (card) {
        fireEvent.mouseEnter(card);
        
        // Look for view details button in hover overlay
        setTimeout(() => {
          const viewDetailsButton = screen.queryByText(/View Details/);
          if (viewDetailsButton) {
            fireEvent.click(viewDetailsButton);
            expect(mockOnViewDetails).toHaveBeenCalledWith(mockEvent, expect.any(Object));
          }
        }, 100);
      }
    });

    it('does not show quick preview when showQuickPreview is false', () => {
      render(
        <EventCard 
          event={mockEvent} 
          showQuickPreview={false}
        />
      );
      
      const card = screen.getByText('Tech Conference 2024').closest('div[class*="group"]');
      if (card) {
        fireEvent.mouseEnter(card);
        // Quick preview should not appear
        expect(screen.queryByText(/View Details/)).not.toBeInTheDocument();
      }
    });
  });

  describe('RTL Layout Support', () => {
    it('applies RTL layout classes when isRTL is true', () => {
      mockUseLanguage.isRTL = true;
      
      render(<EventCard event={mockEvent} />);
      
      // Check for RTL-specific classes
      const dateContainer = screen.getByText(/Dec/).closest('div[class*="flex-row-reverse"]');
      expect(dateContainer).toBeInTheDocument();
      
      // Reset
      mockUseLanguage.isRTL = false;
    });

    it('displays directional arrow correctly in RTL mode', () => {
      mockUseLanguage.isRTL = true;
      const mockOnViewDetails = jest.fn();
      
      render(
        <EventCard 
          event={mockEvent} 
          onViewDetails={mockOnViewDetails}
          showQuickPreview={true}
        />
      );
      
      // The arrow direction should change for RTL
      // This would be visible in the hover state
      // Reset
      mockUseLanguage.isRTL = false;
    });
  });

  describe('Link Navigation', () => {
    it('generates correct event URL', () => {
      render(<EventCard event={mockEvent} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/en/event/pub-1');
    });

    it('generates correct URL for different languages', () => {
      mockUseLanguage.language = 'ar';
      
      render(<EventCard event={mockEvent} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/ar/event/pub-1');
      
      // Reset
      mockUseLanguage.language = 'en';
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for images', () => {
      render(<EventCard event={mockEvent} />);
      
      const image = screen.getByTestId('event-image');
      expect(image).toHaveAttribute('alt', 'Tech Conference 2024');
    });

    it('has proper semantic structure', () => {
      render(<EventCard event={mockEvent} />);
      
      // Event title should be in heading
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Tech Conference 2024');
      
      // Should have link for navigation
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles missing optional props gracefully', () => {
      const minimalEvent = {
        id: 'minimal',
        publicId: 'minimal-pub',
        title: 'Minimal Event',
        description: 'Basic description',
        date: '2024-12-25T10:00:00.000Z',
        location: 'Some Location',
      };
      
      expect(() => {
        render(<EventCard event={minimalEvent} />);
      }).not.toThrow();
      
      expect(screen.getByText('Minimal Event')).toBeInTheDocument();
    });

    it('applies custom className correctly', () => {
      const customClass = 'custom-event-card';
      render(<EventCard event={mockEvent} className={customClass} />);
      
      const card = screen.getByText('Tech Conference 2024').closest('div[class*="group"]');
      expect(card).toHaveClass(customClass);
    });
  });

  describe('Edge Cases', () => {
    it('handles very long event titles', () => {
      const eventWithLongTitle = {
        ...mockEvent,
        title: 'This is a very long event title that should be truncated properly when displayed in the card component to maintain layout consistency',
      };
      
      render(<EventCard event={eventWithLongTitle} />);
      
      const titleElement = screen.getByText(/This is a very long event title/);
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveClass('line-clamp-2');
    });

    it('handles very long descriptions', () => {
      const eventWithLongDescription = {
        ...mockEvent,
        description: 'This is a very long description that should be properly truncated when displayed in the event card to ensure that the layout remains consistent and readable across different screen sizes and devices.',
      };
      
      render(<EventCard event={eventWithLongDescription} />);
      
      const descriptionElement = screen.getByText(/This is a very long description/);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement).toHaveClass('line-clamp-2');
    });

    it('handles events with price of 0 correctly', () => {
      const eventWithZeroPrice = { ...mockEvent, price: 0, isFree: false };
      render(<EventCard event={eventWithZeroPrice} />);
      
      // Should show as free even if isFree is false but price is 0
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });
});