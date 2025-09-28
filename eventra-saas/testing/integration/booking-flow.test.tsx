// Integration tests for complete booking flow
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookingFlow } from '@/components/booking/BookingFlow';

// Mock server for API calls
const server = setupServer(
  // Event details endpoint
  rest.get('/api/events/:eventId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'event-123',
        title: 'Baghdad Cultural Night',
        date: '2024-12-25T18:00:00Z',
        location: 'National Theater, Baghdad',
        price: 25000,
        currency: 'IQD',
        availableTickets: 50,
        maxTicketsPerUser: 5,
      })
    );
  }),

  // Booking creation endpoint
  rest.post('/api/bookings', async (req, res, ctx) => {
    const body = await req.json();
    
    // Simulate validation
    if (!body.tickets || body.tickets <= 0) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Invalid ticket quantity' })
      );
    }

    if (body.tickets > 5) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Maximum 5 tickets per user' })
      );
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: 'booking-456',
        eventId: body.eventId,
        tickets: body.tickets,
        totalAmount: body.tickets * 25000,
        status: 'confirmed',
        qrCode: 'QR123456789',
      })
    );
  }),

  // Payment processing endpoint
  rest.post('/api/payments', async (req, res, ctx) => {
    const body = await req.json();
    
    // Simulate different payment scenarios
    if (body.paymentMethod === 'card' && body.cardNumber === '4000000000000002') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Card declined', code: 'CARD_DECLINED' })
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res(
      ctx.status(200),
      ctx.json({
        id: 'payment-789',
        status: 'succeeded',
        transactionId: 'TXN123456',
      })
    );
  }),

  // User session endpoint
  rest.get('/api/auth/session', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: 'user-123',
          name: 'Ahmed Hassan',
          email: 'ahmed@example.com',
          locale: 'ar',
        }
      })
    );
  })
);

// Test wrapper with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('Booking Flow Integration', () => {
  const user = userEvent.setup();

  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Complete Booking Journey', () => {
    it('completes successful booking from event selection to confirmation', async () => {
      render(
        <TestWrapper>
          <BookingFlow eventId="event-123" />
        </TestWrapper>
      );

      // Step 1: Event information loads
      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
        expect(screen.getByText('25,000 IQD')).toBeInTheDocument();
      });

      // Step 2: Select number of tickets
      const ticketQuantity = screen.getByLabelText(/number of tickets/i);
      await user.clear(ticketQuantity);
      await user.type(ticketQuantity, '2');

      expect(screen.getByText('50,000 IQD')).toBeInTheDocument(); // Updated total

      // Step 3: Proceed to checkout
      const proceedButton = screen.getByRole('button', { name: /proceed to checkout/i });
      await user.click(proceedButton);

      // Step 4: Fill attendee information
      await waitFor(() => {
        expect(screen.getByText(/attendee information/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone number/i);

      await user.type(nameInput, 'Ahmed Hassan');
      await user.type(emailInput, 'ahmed@example.com');
      await user.type(phoneInput, '+964 770 123 4567');

      // Step 5: Select payment method
      const paymentMethodCard = screen.getByLabelText(/credit card/i);
      await user.click(paymentMethodCard);

      // Fill payment details
      const cardNumber = screen.getByLabelText(/card number/i);
      const expiryDate = screen.getByLabelText(/expiry date/i);
      const cvv = screen.getByLabelText(/cvv/i);

      await user.type(cardNumber, '4000000000000069'); // Valid test card
      await user.type(expiryDate, '12/26');
      await user.type(cvv, '123');

      // Step 6: Review and confirm booking
      const reviewButton = screen.getByRole('button', { name: /review booking/i });
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/booking summary/i)).toBeInTheDocument();
        expect(screen.getByText('2 tickets')).toBeInTheDocument();
        expect(screen.getByText('50,000 IQD')).toBeInTheDocument();
      });

      // Step 7: Complete booking
      const confirmButton = screen.getByRole('button', { name: /confirm booking/i });
      await user.click(confirmButton);

      // Step 8: Verify success confirmation
      await waitFor(() => {
        expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument();
        expect(screen.getByText(/booking-456/i)).toBeInTheDocument();
        expect(screen.getByTestId('qr-code')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify ticket download option
      expect(screen.getByRole('button', { name: /download tickets/i })).toBeInTheDocument();
    });

    it('handles payment failure gracefully', async () => {
      render(
        <TestWrapper>
          <BookingFlow eventId="event-123" />
        </TestWrapper>
      );

      // Complete booking flow until payment
      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
      });

      // Select tickets and proceed through checkout
      const ticketQuantity = screen.getByLabelText(/number of tickets/i);
      await user.type(ticketQuantity, '1');

      const proceedButton = screen.getByRole('button', { name: /proceed to checkout/i });
      await user.click(proceedButton);

      // Fill required information
      await user.type(screen.getByLabelText(/full name/i), 'Ahmed Hassan');
      await user.type(screen.getByLabelText(/email/i), 'ahmed@example.com');

      // Use declined card number
      await user.click(screen.getByLabelText(/credit card/i));
      await user.type(screen.getByLabelText(/card number/i), '4000000000000002');
      await user.type(screen.getByLabelText(/expiry date/i), '12/26');
      await user.type(screen.getByLabelText(/cvv/i), '123');

      // Attempt booking
      const confirmButton = screen.getByRole('button', { name: /confirm booking/i });
      await user.click(confirmButton);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/card declined/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });
  });

  describe('Validation and Error Handling', () => {
    it('validates ticket quantity limits', async () => {
      render(
        <TestWrapper>
          <BookingFlow eventId="event-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
      });

      // Try to select more than maximum allowed tickets
      const ticketQuantity = screen.getByLabelText(/number of tickets/i);
      await user.clear(ticketQuantity);
      await user.type(ticketQuantity, '10');

      const proceedButton = screen.getByRole('button', { name: /proceed to checkout/i });
      await user.click(proceedButton);

      await waitFor(() => {
        expect(screen.getByText(/maximum 5 tickets per user/i)).toBeInTheDocument();
      });
    });

    it('validates required fields', async () => {
      render(
        <TestWrapper>
          <BookingFlow eventId="event-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
      });

      // Select tickets and proceed
      const ticketQuantity = screen.getByLabelText(/number of tickets/i);
      await user.type(ticketQuantity, '1');

      const proceedButton = screen.getByRole('button', { name: /proceed to checkout/i });
      await user.click(proceedButton);

      // Try to proceed without filling required fields
      const reviewButton = screen.getByRole('button', { name: /review booking/i });
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('handles Arabic form validation correctly', async () => {
      // Mock Arabic locale
      jest.mocked(require('next-intl').useLocale).mockReturnValue('ar');

      render(
        <TestWrapper>
          <BookingFlow eventId="event-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
      });

      // Proceed through booking flow
      const ticketQuantity = screen.getByLabelText(/عدد التذاكر/);
      await user.type(ticketQuantity, '1');

      // Test Arabic name validation
      const nameInput = screen.getByLabelText(/الاسم الكامل/);
      await user.type(nameInput, 'أحمد حسن محمد'); // Arabic name

      // Should accept Arabic characters
      expect(nameInput).toHaveValue('أحمد حسن محمد');
    });
  });

  describe('Mobile-Specific Features', () => {
    it('adapts layout for mobile screens', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <TestWrapper>
          <BookingFlow eventId="event-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
      });

      // Check for mobile-specific classes
      const bookingContainer = container.querySelector('[data-testid="booking-container"]');
      expect(bookingContainer).toHaveClass('sm:max-w-sm');
    });

    it('supports mobile payment methods', async () => {
      render(
        <TestWrapper>
          <BookingFlow eventId="event-123" />
        </TestWrapper>
      );

      // Complete initial steps
      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
      });

      const ticketQuantity = screen.getByLabelText(/number of tickets/i);
      await user.type(ticketQuantity, '1');

      const proceedButton = screen.getByRole('button', { name: /proceed to checkout/i });
      await user.click(proceedButton);

      // Check for mobile payment options
      await waitFor(() => {
        expect(screen.getByLabelText(/mobile wallet/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cash on delivery/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Features', () => {
    it('supports screen reader navigation', async () => {
      render(
        <TestWrapper>
          <BookingFlow eventId="event-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
      });

      // Check for proper heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveAccessibleName(/event details/i);

      // Check for proper labels
      const ticketInput = screen.getByLabelText(/number of tickets/i);
      expect(ticketInput).toHaveAttribute('aria-describedby');

      // Check for status announcements
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
    });

    it('supports keyboard navigation through booking steps', async () => {
      render(
        <TestWrapper>
          <BookingFlow eventId="event-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
      });

      // Navigate using keyboard
      const ticketQuantity = screen.getByLabelText(/number of tickets/i);
      ticketQuantity.focus();
      
      fireEvent.keyDown(ticketQuantity, { key: 'ArrowUp' });
      expect(ticketQuantity).toHaveValue('1');

      fireEvent.keyDown(ticketQuantity, { key: 'ArrowUp' });
      expect(ticketQuantity).toHaveValue('2');
    });
  });

  describe('Performance Considerations', () => {
    it('lazy loads payment form components', async () => {
      const { container } = render(
        <TestWrapper>
          <BookingFlow eventId="event-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
      });

      // Payment form should not be loaded initially
      expect(container.querySelector('[data-testid="payment-form"]')).not.toBeInTheDocument();

      // Select tickets and proceed
      const ticketQuantity = screen.getByLabelText(/number of tickets/i);
      await user.type(ticketQuantity, '1');

      const proceedButton = screen.getByRole('button', { name: /proceed to checkout/i });
      await user.click(proceedButton);

      // Payment form should now be loaded
      await waitFor(() => {
        expect(container.querySelector('[data-testid="payment-form"]')).toBeInTheDocument();
      });
    });

    it('debounces ticket quantity changes', async () => {
      const mockUpdateTotal = jest.fn();
      
      render(
        <TestWrapper>
          <BookingFlow eventId="event-123" onTotalUpdate={mockUpdateTotal} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Baghdad Cultural Night')).toBeInTheDocument();
      });

      const ticketQuantity = screen.getByLabelText(/number of tickets/i);
      
      // Rapid changes should be debounced
      await user.clear(ticketQuantity);
      await user.type(ticketQuantity, '1');
      await user.type(ticketQuantity, '2');
      await user.type(ticketQuantity, '3');

      // Wait for debounce
      await waitFor(() => {
        expect(mockUpdateTotal).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });
  });
});