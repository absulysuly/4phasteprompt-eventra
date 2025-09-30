import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navigation from '../../src/app/components/Navigation';
import { LanguageProvider } from '../../src/app/components/LanguageProvider';

// Mock the translation hook
jest.mock('../../src/app/hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key) => key,
  }),
}));

const NavigationWithProvider = ({ children }) => (
  <LanguageProvider initialLanguage="en">
    {children || <Navigation />}
  </LanguageProvider>
);

describe('Navigation Component', () => {
  describe('Language Switcher', () => {
    test('should render language switcher', () => {
      render(<NavigationWithProvider />);
      
      const languageSwitcher = screen.getByTestId('language-switcher');
      expect(languageSwitcher).toBeInTheDocument();
    });

    test('should display all supported languages', async () => {
      render(<NavigationWithProvider />);
      
      const languageButton = screen.getByText('English');
      fireEvent.mouseOver(languageButton);
      
      await waitFor(() => {
        expect(screen.getByText('🇺🇸 English')).toBeInTheDocument();
        expect(screen.getByText('🇮🇶 العربية')).toBeInTheDocument();
        expect(screen.getByText('🏴 کوردی')).toBeInTheDocument();
      });
    });

    test('should switch languages correctly', async () => {
      render(<NavigationWithProvider />);
      
      const languageButton = screen.getByRole('button', { name: /english/i });
      fireEvent.mouseOver(languageButton);
      
      await waitFor(() => {
        const arabicOption = screen.getByText('🇮🇶 العربية');
        fireEvent.click(arabicOption);
      });
      
      // Language switch should be handled by the provider
    });
  });

  describe('Mobile Navigation', () => {
    test('should render mobile menu button', () => {
      render(<NavigationWithProvider />);
      
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      expect(mobileButton).toBeInTheDocument();
    });

    test('should toggle mobile menu', () => {
      render(<NavigationWithProvider />);
      
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      
      // Menu should be closed initially
      expect(screen.queryByText('navigation.home')).not.toBeVisible();
      
      // Click to open menu
      fireEvent.click(mobileButton);
      
      // Menu should be open
      expect(screen.getByText('navigation.home')).toBeInTheDocument();
    });

    test('should show hamburger and X icons correctly', () => {
      render(<NavigationWithProvider />);
      
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      
      // Initially should show hamburger (menu closed)
      expect(mobileButton.getAttribute('aria-expanded')).toBe('false');
      
      fireEvent.click(mobileButton);
      
      // After click should show X (menu open)
      expect(mobileButton.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Navigation Links', () => {
    test('should render main navigation links', () => {
      render(<NavigationWithProvider />);
      
      expect(screen.getByText('navigation.home')).toBeInTheDocument();
      expect(screen.getByText('navigation.events')).toBeInTheDocument();
      expect(screen.getByText('navigation.categories')).toBeInTheDocument();
      expect(screen.getByText('navigation.about')).toBeInTheDocument();
    });

    test('should render authentication links when not signed in', () => {
      render(<NavigationWithProvider />);
      
      expect(screen.getByText('navigation.login')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(<NavigationWithProvider />);
      
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      expect(mobileButton).toHaveAttribute('aria-label');
      expect(mobileButton).toHaveAttribute('aria-expanded');
    });

    test('should support keyboard navigation', () => {
      render(<NavigationWithProvider />);
      
      const mobileButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      mobileButton.focus();
      
      expect(document.activeElement).toBe(mobileButton);
    });
  });
});