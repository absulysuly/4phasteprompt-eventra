# Contributing to Eventra

Thank you for your interest in contributing to Eventra, a multilingual event management platform for Iraq and the Middle East region! This guide will help you get started with contributing to the project.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- A GitHub account

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/eventra-saas.git
   cd eventra-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Initialize the database**
   ```bash
   npm run db:setup
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📋 Development Guidelines

### Coding Standards

- **TypeScript**: Use TypeScript for all new files
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code formatting is handled by Prettier (runs automatically on commit)
- **Naming Conventions**:
  - Components: PascalCase (e.g., `EventCard`, `LanguageSwitcher`)
  - Files: lowercase with hyphens (e.g., `event-card.tsx`)
  - Variables/Functions: camelCase (e.g., `handleSubmit`, `eventData`)

### Internationalization (i18n) Requirements

- **All user-facing text must be internationalized**
- **Update all three locale files**: `messages/en.json`, `messages/ar.json`, `messages/ku.json`
- **Test RTL layouts**: Always test Arabic and Kurdish (right-to-left) layouts
- **Translation keys**: Use descriptive, hierarchical keys (e.g., `events.create.title`)
- **Run validation**: Execute `npm run i18n:check` before committing

### Component Development

- **Server Components**: Use Server Components by default for better performance
- **Client Components**: Only use Client Components when necessary (add `'use client'` directive)
- **Accessibility**: Ensure components are accessible (ARIA labels, keyboard navigation, semantic HTML)
- **Responsive Design**: Test on mobile, tablet, and desktop viewports
- **Type Safety**: Define proper TypeScript interfaces for all props

### Database Changes

- **Schema Updates**: Modify `prisma/schema.prisma` for database changes
- **Migrations**: Run `npm run db:migrate` to generate migration files
- **Seeding**: Update `prisma/seed.ts` if sample data needs to change
- **Testing**: Always test migrations locally before submitting

## 🔄 Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clean, well-documented code
- Follow the established patterns in the codebase
- Add or update tests as necessary
- Ensure all new strings are internationalized

### 3. Test Your Changes

```bash
# Run all quality checks
npm run dev:check      # Type-check, lint, i18n validation

# Run tests (when available)
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests

# Test the build
npm run build
```

### 4. Commit Your Changes

We use conventional commits. Format your commit messages as:

```
type(scope): description

feat(events): add event sharing functionality
fix(i18n): resolve RTL layout issues in Arabic
docs(readme): update installation instructions
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request through GitHub's interface.

### 6. Address Review Feedback

- Respond to reviewer comments
- Make requested changes
- Update tests if necessary
- Push additional commits to the same branch

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, ensure you've tested:

- [ ] **Language Switching**: Test all three languages (English, Arabic, Kurdish)
- [ ] **RTL Layout**: Verify Arabic and Kurdish display correctly right-to-left
- [ ] **Responsive Design**: Test mobile, tablet, and desktop views
- [ ] **Authentication**: Test login/logout if auth-related changes
- [ ] **Database Operations**: Test CRUD operations if database changes
- [ ] **Browser Compatibility**: Test in Chrome, Firefox, Safari, Edge

### Automated Testing

- **Unit Tests**: Add tests for new utility functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Add tests for critical user flows
- **i18n Validation**: Ensure `npm run i18n:check` passes

## 🌐 Internationalization Guidelines

### Adding New Translation Keys

1. **Add to TypeScript types** (`src/lib/i18n.ts`):
   ```typescript
   export type TranslationKey = 
     | 'existing.keys'
     | 'new.feature.title'        // Add your new key here
     | 'new.feature.description'  // Add related keys
   ```

2. **Add translations to all locale files**:
   ```json
   // messages/en.json
   {
     "new": {
       "feature": {
         "title": "New Feature",
         "description": "Description of the feature"
       }
     }
   }
   ```

3. **Use in components**:
   ```typescript
   import { useTranslations } from '@/hooks/useTranslations';
   
   const t = useTranslations();
   return <h1>{t('new.feature.title')}</h1>;
   ```

### RTL Layout Considerations

- Use logical CSS properties: `margin-inline-start` instead of `margin-left`
- Test icon and button positioning in RTL layouts
- Ensure text alignment works in both directions
- Test form layouts and input field positioning

## 📝 Documentation

### Code Comments

- Document complex logic and business rules
- Explain why certain decisions were made
- Add JSDoc comments for public functions and components
- Keep comments up-to-date with code changes

### README Updates

- Update README.md if you add new features
- Document new environment variables
- Update installation or setup instructions if changed
- Add examples for new functionality

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment**: OS, browser, Node.js version
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable, especially for UI issues
- **Language**: Which language(s) exhibit the issue
- **Console errors**: Any JavaScript errors from browser console

## 💡 Feature Requests

For new feature requests:

- **Use Case**: Describe the problem you're trying to solve
- **Proposed Solution**: How you think it should work
- **Alternatives**: Other solutions you've considered
- **Impact**: Who would benefit from this feature
- **i18n Considerations**: How it should work across languages

## 📞 Getting Help

- **GitHub Discussions**: Ask questions and discuss ideas
- **GitHub Issues**: Report bugs or request features
- **Code Review**: Ask questions in pull request comments
- **Documentation**: Check existing docs and WARP.md file

## 🏆 Recognition

Contributors will be:

- Listed in the project's contributor list
- Mentioned in release notes for significant contributions
- Eligible for special contributor badges and recognition

## 📄 License

By contributing to Eventra, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to Eventra! Your efforts help make event management accessible to Arabic, Kurdish, and English-speaking communities. 🎉