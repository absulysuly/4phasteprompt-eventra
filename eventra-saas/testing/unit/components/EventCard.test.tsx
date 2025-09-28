// Unit tests for EventCard component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventCard } from '@/components/EventCard';

// Mock dependencies
jest.mock('next/router');
jest.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [],
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    isFavorite: jest.fn(() => false),
  }),
}));

describe('EventCard Component', () => {
  const mockEvent = createMockEvent({
    title: 'Baghdad Music Festival',
    description: 'Traditional and modern music performances',
    date: new Date('2024-12-25T18:00:00Z'),
    location: 'Al-Zawraa Park, Baghdad',
    price: 15000,
    currency: 'IQD',
    image: '/festival.jpg',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders event information correctly', () => {
      render(<EventCard event={mockEvent} />);
      
      expect(screen.getByText('Baghdad Music Festival')).toBeInTheDocument();
      expect(screen.getByText('Traditional and modern music performances')).toBeInTheDocument();
      expect(screen.getByText('Al-Zawraa Park, Baghdad')).toBeInTheDocument();
      expect(screen.getByText('15,000 IQD')).toBeInTheDocument();
    });

    it('renders event image with correct alt text', () => {
      render(<EventCard event={mockEvent} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', '/festival.jpg');
      expect(image).toHaveAttribute('alt', 'Baghdad Music Festival');
    });

    it('displays formatted date', () => {
      render(<EventCard event={mockEvent} />);
      
      // Should display formatted date (depends on locale)
      expect(screen.getByText(/Dec.*25.*2024/)).toBeInTheDocument();
    });
  });

  describe('Localization', () => {
    it('renders correctly in Arabic RTL layout', () => {
      const { container } = render(
        <EventCard event={mockEvent} locale="ar" />
      );
      
      const cardElement = container.querySelector('[data-testid="event-card"]');
      expect(cardElement).toHaveAttribute('dir', 'rtl');
    });

    it('formats currency correctly for different locales', () => {
      render(<EventCard event={mockEvent} locale="ar" />);
      
      // Arabic number formatting
      expect(screen.getByText('١٥٬٠٠٠ IQD')).toBeInTheDocument();
    });

    it('displays Kurdish text correctly', () => {
      const kurdishEvent = createMockEvent({
        title: 'فێستیڤاڵی مۆسیقای هەولێر',
        location: 'پارکی شەڕی گەرگەران، هەولێر',
      });

      render(<EventCard event={kurdishEvent} locale="ku" />);
      
      expect(screen.getByText('فێستیڤاڵی مۆسیقای هەولێر')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles favorite button click', async () => {
      const mockAddFavorite = jest.fn();
      jest.mocked(require('@/hooks/useFavorites').useFavorites).mockReturnValue({
        favorites: [],
        addFavorite: mockAddFavorite,
        removeFavorite: jest.fn(),
        isFavorite: jest.fn(() => false),
      });

      render(<EventCard event={mockEvent} />);
      
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.click(favoriteButton);
      
      await waitFor(() => {
        expect(mockAddFavorite).toHaveBeenCalledWith(mockEvent.id);
      });
    });

    it('shows share dialog when share button is clicked', async () => {
      render(<EventCard event={mockEvent} />);
      
      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(screen.getByText(/share event/i)).toBeInTheDocument();
      });
    });

    it('navigates to event details on card click', () => {
      const mockPush = jest.fn();
      jest.mocked(require('next/router').useRouter).mockReturnValue({
        push: mockPush,
        pathname: '/',
        query: {},
      });

      render(<EventCard event={mockEvent} />);
      
      const card = screen.getByTestId('event-card');
      fireEvent.click(card);
      
      expect(mockPush).toHaveBeenCalledWith(`/events/${mockEvent.id}`);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<EventCard event={mockEvent} />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-labelledby');
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveAttribute('id');
    });

    it('supports keyboard navigation', () => {
      render(<EventCard event={mockEvent} />);
      
      const card = screen.getByTestId('event-card');
      expect(card).toHaveAttribute('tabIndex', '0');
      
      // Test Enter key navigation
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      // Should navigate to event details
    });

    it('provides proper focus management', () => {
      render(<EventCard event={mockEvent} />);
      
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      favoriteButton.focus();
      
      expect(favoriteButton).toHaveFocus();
      expect(favoriteButton).toHaveAttribute('aria-pressed');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing event image gracefully', () => {
      const eventWithoutImage = createMockEvent({ image: null });
      
      render(<EventCard event={eventWithoutImage} />);
      
      const placeholder = screen.getByTestId('image-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('handles very long event titles', () => {
      const longTitleEvent = createMockEvent({
        title: 'This is an extremely long event title that should be truncated properly to maintain the card layout without breaking the design',
      });

      const { container } = render(<EventCard event={longTitleEvent} />);
      
      const titleElement = container.querySelector('h3');
      expect(titleElement).toHaveClass('truncate');
    });

    it('displays sold out state correctly', () => {
      const soldOutEvent = createMockEvent({ 
        availableTickets: 0,
        status: 'sold_out' 
      });

      render(<EventCard event={soldOutEvent} />);
      
      expect(screen.getByText(/sold out/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /book now/i })).toBeDisabled();
    });

    it('handles different price formats', () => {
      const freeEvent = createMockEvent({ price: 0 });
      render(<EventCard event={freeEvent} />);
      expect(screen.getByText(/free/i)).toBeInTheDocument();

      const { rerender } = render(<EventCard event={mockEvent} />);
      
      const premiumEvent = createMockEvent({ price: 250000 });
      rerender(<EventCard event={premiumEvent} />);
      expect(screen.getByText('250,000 IQD')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with minimal re-renders', () => {
      const renderSpy = jest.fn();
      
      function TestWrapper({ event }) {
        renderSpy();
        return <EventCard event={event} />;
      }

      const { rerender } = render(<TestWrapper event={mockEvent} />);
      
      // Same props should not cause re-render
      rerender(<TestWrapper event={mockEvent} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('lazy loads images', () => {
      render(<EventCard event={mockEvent} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Integration with Theme', () => {
    it('applies dark theme styles correctly', () => {
      const { container } = render(
        <div className="dark">
          <EventCard event={mockEvent} />
        </div>
      );
      
      const card = container.querySelector('[data-testid="event-card"]');
      expect(card).toHaveClass('dark:bg-gray-800');
    });

    it('supports high contrast mode', () => {
      // Mock high contrast preference
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { container } = render(<EventCard event={mockEvent} />);
      
      const card = container.querySelector('[data-testid="event-card"]');
      expect(card).toHaveClass('high-contrast:border-2');
    });
  });
});