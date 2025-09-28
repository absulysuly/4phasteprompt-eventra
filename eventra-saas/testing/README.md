# Eventra SaaS Testing & Benchmarking Suite

This directory contains a comprehensive testing and benchmarking suite designed specifically for the Eventra SaaS platform. The suite provides tools for prototype generation, user simulation, functionality validation, and performance benchmarking.

## 🎯 Overview

The testing suite is organized into four main components:

1. **Prototype Generation Prompts** - AI-powered prompts for generating variations
2. **User Simulation Scripts** - K6 scripts simulating different user personas  
3. **Automated Test Suites** - Unit, integration, and E2E tests
4. **Performance Benchmarking** - Lighthouse and load testing tools

## 📁 Directory Structure

```
testing/
├── prototype-generation-prompts.md    # AI prompts for design variations
├── simulations/                       # User persona simulation scripts
│   ├── personas.md                   # User persona definitions
│   ├── tourist-tara.js              # Tourist user simulation (K6)
│   └── local-leyla.js               # Local user simulation (K6)
├── unit/                             # Unit tests
│   └── components/
│       └── EventCard.test.tsx       # Sample component test
├── integration/                      # Integration tests
│   └── booking-flow.test.tsx        # Complete booking flow test
├── performance/                      # Performance testing tools
│   └── lighthouse-benchmark.js      # Lighthouse benchmarking tool
├── setup/                           # Test configuration
│   ├── jest-setup.js               # Jest configuration
│   ├── global-setup.js             # Global test setup
│   └── global-teardown.js          # Global test cleanup
├── results/                         # Test output directory
├── jest.config.js                   # Jest configuration
├── run-tests.ps1                    # Main test runner script
├── run-user-simulations.ps1         # User simulation runner
└── run-performance-benchmarks.ps1   # Performance benchmark runner
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js & npm** - For running tests and tools
2. **K6** - For load testing ([Download here](https://k6.io/docs/getting-started/installation/))
3. **Chrome** - For Lighthouse performance tests

### Installation

```powershell
# Install Node.js dependencies
npm install

# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event msw
npm install --save-dev lighthouse chrome-launcher
```

## 📋 Usage Guide

### 1. Prototype Generation

Use AI prompts to generate design variations:

```markdown
# Example: Generate event card variations
Context: Eventra is a travel and entertainment platform for Iraq & Kurdistan
Requirements: Display event title, date, location, price, image
Target personas: Local families, tourists, business travelers
Output format: React/TypeScript components with Tailwind CSS
```

### 2. User Simulations

Run user persona simulations to test user flows:

```powershell
# Run all user simulations
.\testing\run-user-simulations.ps1 -BaseUrl "https://staging.yourdomain.com"

# Run specific persona with custom load
.\testing\run-user-simulations.ps1 -Scenario tourist -VirtualUsers 20 -Duration "10m"

# Generate reports
.\testing\run-user-simulations.ps1 -GenerateReport
```

### 3. Automated Testing

Run the complete test suite:

```powershell
# Run all tests with coverage
.\testing\run-tests.ps1 -Coverage

# Run specific test types
.\testing\run-tests.ps1 -TestType unit
.\testing\run-tests.ps1 -TestType integration

# Watch mode for development
.\testing\run-tests.ps1 -TestType unit -Watch
```

### 4. Performance Benchmarking

Run comprehensive performance tests:

```powershell
# Full performance benchmark suite
.\testing\run-performance-benchmarks.ps1 -BaseUrl "https://staging.yourdomain.com" -GenerateReport -OpenReport

# Mobile-only Lighthouse tests
.\testing\run-performance-benchmarks.ps1 -BenchmarkType lighthouse -Device mobile

# Load testing only
.\testing\run-performance-benchmarks.ps1 -BenchmarkType k6 -VirtualUsers 50 -Duration 10
```

## 🎭 User Personas

### Tourist Tara
- **Goal**: Discover weekend events, book tickets, share with friends
- **Behavior**: Mobile usage, English UI, compares options
- **Simulation**: `tourist-tara.js`

### Local Leyla  
- **Goal**: Browse family events, save favorites, plan ahead
- **Behavior**: Arabic RTL UI, thorough research, evening usage
- **Simulation**: `local-leyla.js`

## 🧪 Test Categories

### Unit Tests
- **Component testing** - Individual React components
- **Utility function testing** - Helper functions and utilities
- **Hook testing** - Custom React hooks
- **API logic testing** - Business logic validation

### Integration Tests
- **User flow testing** - Complete user journeys
- **API integration** - External service integration
- **Database operations** - Data persistence testing
- **Authentication flows** - Login/logout scenarios

### Performance Tests
- **Lighthouse audits** - Core Web Vitals measurement
- **Load testing** - User simulation under load
- **Accessibility testing** - A11y compliance validation
- **Security testing** - Basic security checks

## 📊 Reports and Results

All test results are saved in the `testing/results/` directory:

- `test-report.html` - Comprehensive test results
- `coverage/` - Code coverage reports  
- `performance/` - Lighthouse and load test results
- `simulation-summary.json` - User simulation summaries

## 🔧 Configuration

### Jest Configuration

Key settings in `jest.config.js`:
- Coverage thresholds: 70% overall, 80% for components
- Test timeout: 10 seconds
- Module mapping for Next.js aliases
- Custom reporters for CI/CD integration

### Performance Thresholds

Lighthouse performance targets:
- **Mobile**: 75 performance score, 4s LCP, 2.5s FCP
- **Desktop**: 85 performance score, 2.5s LCP, 1.5s FCP
- **Accessibility**: 95+ score required
- **SEO**: 90+ score required

### K6 Load Testing

Default simulation parameters:
- **Ramp-up**: 2 minutes to target users
- **Steady state**: 5 minutes at load
- **Ramp-down**: 2 minutes to zero
- **Thresholds**: 95% requests under 2s, <5% failures

## 🚦 CI/CD Integration

### GitHub Actions Integration

Example workflow snippet:
```yaml
- name: Run Tests
  run: .\testing\run-tests.ps1 -TestType all -Coverage -Silent

- name: Performance Benchmark  
  run: .\testing\run-performance-benchmarks.ps1 -BenchmarkType lighthouse -Device mobile
```

### Quality Gates

Tests serve as quality gates for:
- **Code coverage** - Minimum 70% overall
- **Performance** - No regression in Core Web Vitals
- **Accessibility** - WCAG compliance maintained
- **Load capacity** - Handle expected user load

## 📈 Monitoring and Trends

### Performance Tracking

- **CSV exports** - Track metrics over time
- **Comparison reports** - Compare with previous runs
- **Threshold alerts** - Fail CI/CD on regressions
- **Device-specific** - Mobile vs desktop performance

### Test Metrics

- **Test coverage trends** - Monitor coverage changes
- **Test execution time** - Optimize slow tests
- **Flaky test detection** - Identify unreliable tests
- **Success rate tracking** - Overall test health

## 🔍 Troubleshooting

### Common Issues

1. **Tests timeout** - Increase timeout in jest.config.js
2. **K6 not found** - Install K6 from official website
3. **Chrome crashes** - Add `--no-sandbox` flag for CI
4. **API mocking fails** - Check MSW handlers configuration

### Debug Commands

```powershell
# Verbose test output
.\testing\run-tests.ps1 -Verbose

# Debug specific test
npx jest --config testing/jest.config.js --testNamePattern="EventCard"

# Performance debug
node testing/performance/lighthouse-benchmark.js http://localhost:3000 mobile
```

## 📚 Best Practices

### Test Writing
- **Arrange-Act-Assert** pattern
- **Descriptive test names** 
- **Test user behavior**, not implementation
- **Mock external dependencies**
- **Use realistic test data**

### Performance Testing
- **Test on realistic hardware** - Mid-range mobile devices
- **Use production-like data** - Realistic content sizes
- **Test different networks** - 3G, 4G, WiFi conditions
- **Regular benchmarking** - Weekly performance checks

### User Simulations
- **Realistic user behavior** - Include think time
- **Gradual load increase** - Avoid traffic spikes
- **Monitor error rates** - Track business logic failures
- **Cultural considerations** - Language, region-specific behavior

## 🎯 Success Metrics

### Quality Targets
- **Test Coverage**: 80%+ for critical components
- **Performance Score**: 85+ on desktop, 75+ on mobile
- **Accessibility Score**: 95+ across all pages
- **Load Capacity**: Handle 100+ concurrent users

### Continuous Improvement
- **Weekly performance reviews**
- **Monthly test suite optimization** 
- **Quarterly persona updates**
- **Annual testing strategy review**

---

This testing suite provides comprehensive coverage for the Eventra SaaS platform, ensuring high quality, performance, and user experience across all supported devices and user scenarios.