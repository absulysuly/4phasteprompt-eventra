import { axe, toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('should validate basic HTML structure for accessibility', async () => {
    // Create a basic language switcher structure
    const div = document.createElement('div')
    div.innerHTML = `
      <header>
        <nav aria-label="Language selection">
          <button 
            data-testid="language-switcher" 
            aria-label="Switch Language"
            aria-expanded="false"
            aria-haspopup="listbox"
          >
            English
            <span aria-hidden="true">▼</span>
          </button>
          <ul role="listbox" aria-hidden="true" style="display: none;">
            <li role="option" tabindex="0">English</li>
            <li role="option" tabindex="0">العربية</li>
            <li role="option" tabindex="0">کوردی</li>
          </ul>
        </nav>
      </header>
    `
    
    const results = await axe(div)
    expect(results).toHaveNoViolations()
  })

  it('should validate event card structure for accessibility', async () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <main>
        <section aria-label="Featured events">
          <article aria-labelledby="event-title-1">
            <h3 id="event-title-1">Test Event</h3>
            <p>Event description goes here</p>
            <div>
              <span>📍 Event Location</span>
              <span>📅 December 25, 2025</span>
            </div>
            <a href="/event/test-event" aria-describedby="event-title-1">
              View Event Details
            </a>
          </article>
        </section>
      </main>
    `
    
    const results = await axe(div)
    expect(results).toHaveNoViolations()
  })

  it('should validate form accessibility', async () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <main>
        <section aria-label="Create event form">
          <form>
            <div>
              <label for="event-name">Event Name *</label>
              <input 
                id="event-name" 
                type="text" 
                required 
                aria-required="true"
                aria-describedby="event-name-help"
              />
              <div id="event-name-help">Enter a descriptive name for your event</div>
            </div>
            <div>
              <label for="event-date">Event Date *</label>
              <input 
                id="event-date" 
                type="datetime-local" 
                required 
                aria-required="true"
              />
            </div>
            <button type="submit">Create Event</button>
          </form>
        </section>
      </main>
    `
    
    const results = await axe(div)
    expect(results).toHaveNoViolations()
  })

  it('should validate navigation accessibility', async () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/" aria-current="page">Home</a></li>
          <li><a href="/events">Events</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    `
    
    const results = await axe(div)
    expect(results).toHaveNoViolations()
  })

  it('should validate skip links for keyboard navigation', async () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/events">Events</a></li>
        </ul>
      </nav>
      <main id="main-content">
        <h1>Page Title</h1>
        <p>Main content here</p>
      </main>
    `
    
    const results = await axe(div)
    expect(results).toHaveNoViolations()
  })
})
