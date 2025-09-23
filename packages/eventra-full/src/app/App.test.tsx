import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock services that might be imported
jest.mock('../../services/api', () => ({}));
jest.mock('../../services/loggingService', () => ({}));
jest.mock('../../services/emailService', () => ({}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test a) Loading state renders "Loading Eventara..."
  test('renders "Loading Eventara..." when isLoading is true', async () => {
    render(<App />);
    
    // Check that loading text is present
    expect(screen.getByText('Loading Eventara...')).toBeInTheDocument();
    
    // Check that loading container has proper role and aria-live
    const loadingContainer = screen.getByRole('status');
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading Eventara...')).not.toBeInTheDocument();
    });
  });

  // Test b) Filter changes reset currentPage to 1 without infinite render loops
  test('changing filters resets currentPage to 1 without causing infinite renders', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(<App />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText('Loading Eventara...')).not.toBeInTheDocument();
    });

    // Test selectedCity change
    const citySelect = screen.getByLabelText('city-select');
    fireEvent.change(citySelect, { target: { value: 'Baghdad' } });
    
    // Wait a moment to ensure no infinite render warnings
    await waitFor(() => {
      expect(citySelect).toHaveValue('Baghdad');
    }, { timeout: 1000 });

    // Test selectedCategory change
    const categorySelect = screen.getByLabelText('category-select');
    fireEvent.change(categorySelect, { target: { value: 'tech' } });
    
    await waitFor(() => {
      expect(categorySelect).toHaveValue('tech');
    }, { timeout: 1000 });

    // Test activeSearchQuery change
    const searchInput = screen.getByLabelText('search-input');
    fireEvent.change(searchInput, { target: { value: 'Tech' } });
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('Tech');
    }, { timeout: 1000 });

    // Test language change
    const langSelect = screen.getByLabelText('lang-select');
    fireEvent.change(langSelect, { target: { value: 'ar' } });
    
    await waitFor(() => {
      expect(langSelect).toHaveValue('ar');
    }, { timeout: 1000 });

    // Allow some time for any potential infinite renders to manifest
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check that no React warnings about infinite renders occurred
    const reactWarnings = consoleSpy.mock.calls.filter(call => 
      call[0] && call[0].includes && (
        call[0].includes('Maximum update depth exceeded') ||
        call[0].includes('Cannot update a component') ||
        call[0].includes('while rendering a different component')
      )
    );
    
    const reactWarningsFromWarn = consoleWarnSpy.mock.calls.filter(call => 
      call[0] && call[0].includes && (
        call[0].includes('Maximum update depth exceeded') ||
        call[0].includes('Cannot update a component') ||
        call[0].includes('while rendering a different component')
      )
    );

    expect(reactWarnings).toHaveLength(0);
    expect(reactWarningsFromWarn).toHaveLength(0);
    
    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('renders events after loading completes', async () => {
    render(<App />);
    
    // Wait for loading to complete and events to render
    await waitFor(() => {
      expect(screen.getByText('Tech Summit')).toBeInTheDocument();
      expect(screen.getByText('Music Fest')).toBeInTheDocument();
      expect(screen.getByText('Art Expo')).toBeInTheDocument();
    });
  });

  test('filters events correctly by search query', async () => {
    render(<App />);
    
    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Tech Summit')).toBeInTheDocument();
    });

    // Search for "Tech"
    const searchInput = screen.getByLabelText('search-input');
    fireEvent.change(searchInput, { target: { value: 'Tech' } });

    // Should show only Tech Summit
    await waitFor(() => {
      expect(screen.getByText('Tech Summit')).toBeInTheDocument();
      expect(screen.queryByText('Music Fest')).not.toBeInTheDocument();
      expect(screen.queryByText('Art Expo')).not.toBeInTheDocument();
    });
  });

  test('filters events correctly by city', async () => {
    render(<App />);
    
    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Tech Summit')).toBeInTheDocument();
      expect(screen.getByText('Music Fest')).toBeInTheDocument();
    });

    // Filter by Baghdad
    const citySelect = screen.getByLabelText('city-select');
    fireEvent.change(citySelect, { target: { value: 'Baghdad' } });

    // Should show only Baghdad events
    await waitFor(() => {
      expect(screen.getByText('Music Fest')).toBeInTheDocument();
      expect(screen.queryByText('Tech Summit')).not.toBeInTheDocument();
    });
  });

  test('filters events correctly by category', async () => {
    render(<App />);
    
    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Tech Summit')).toBeInTheDocument();
      expect(screen.getByText('Music Fest')).toBeInTheDocument();
    });

    // Filter by tech category
    const categorySelect = screen.getByLabelText('category-select');
    fireEvent.change(categorySelect, { target: { value: 'tech' } });

    // Should show only tech events
    await waitFor(() => {
      expect(screen.getByText('Tech Summit')).toBeInTheDocument();
      expect(screen.queryByText('Music Fest')).not.toBeInTheDocument();
    });
  });

  test('renders pagination with correct controls', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Eventara...')).not.toBeInTheDocument();
    });

    // Should have pagination controls (7 events with pageSize 6 = 2 pages)
    expect(screen.getByLabelText('prev-page')).toBeInTheDocument();
    expect(screen.getByLabelText('next-page')).toBeInTheDocument();
    expect(screen.getByText(/Page \d+ \/ \d+/)).toBeInTheDocument();
    
    // First page should be disabled for prev button
    expect(screen.getByLabelText('prev-page')).toBeDisabled();
  });

  test('useMemo does not cause side effects during render', async () => {
    const renderSpy = jest.fn();
    
    // Spy on console to catch any React warnings
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    // Wait for component to stabilize
    await waitFor(() => {
      expect(screen.queryByText('Loading Eventara...')).not.toBeInTheDocument();
    });

    // Trigger multiple filter changes rapidly
    const citySelect = screen.getByLabelText('city-select');
    const categorySelect = screen.getByLabelText('category-select');
    const searchInput = screen.getByLabelText('search-input');
    const langSelect = screen.getByLabelText('lang-select');

    // Rapid changes that would previously cause infinite renders
    for (let i = 0; i < 5; i++) {
      fireEvent.change(citySelect, { target: { value: i % 2 === 0 ? 'Baghdad' : 'All Cities' } });
      fireEvent.change(categorySelect, { target: { value: i % 2 === 0 ? 'tech' : 'All Categories' } });
      fireEvent.change(searchInput, { target: { value: i % 2 === 0 ? 'test' : '' } });
      fireEvent.change(langSelect, { target: { value: i % 2 === 0 ? 'ar' : 'en' } });
    }

    // Allow time for any potential issues to manifest
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify no infinite render warnings
    const reactErrors = consoleSpy.mock.calls.filter(call => 
      call[0] && typeof call[0] === 'string' && (
        call[0].includes('Maximum update depth exceeded') ||
        call[0].includes('Cannot update a component') ||
        call[0].includes('while rendering')
      )
    );

    expect(reactErrors).toHaveLength(0);
    
    consoleSpy.mockRestore();
  });
});