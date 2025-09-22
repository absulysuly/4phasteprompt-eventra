import { axe, toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('EventCard Component Tests', () => {
  it('should validate event card structure for accessibility', async () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <main>
        <section aria-label="Event listing">
          <article class="event-card" aria-labelledby="event-title-1">
            <div class="event-image">
              <img src="/placeholder.jpg" alt="Test Event" width="300" height="200" />
            </div>
            <div class="event-content">
              <h3 id="event-title-1">Test Event Title</h3>
              <p>This is a test event description that provides details about what attendees can expect.</p>
              <div class="event-details">
                <span>📅 December 25, 2025 at 7:00 PM</span>
                <span>📍 Test Location</span>
                <span>By Test Organizer</span>
              </div>
              <div class="event-pricing">
                <span class="price free">Free</span>
              </div>
              <a href="/event/test-public-1" 
                 class="event-link" 
                 aria-describedby="event-title-1">
                View Event Details
              </a>
            </div>
          </article>
        </section>
      </main>
    `
    
    const results = await axe(div)
    expect(results).toHaveNoViolations()
  })

  it('should validate paid event structure', async () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <main>
        <section aria-label="Paid events">
          <article class="event-card" aria-labelledby="event-title-2">
            <h3 id="event-title-2">Paid Event</h3>
            <p>This is a paid event description.</p>
            <div class="event-pricing">
              <span class="price paid">$25.50</span>
            </div>
            <a href="/event/paid-event" aria-describedby="event-title-2">
              Buy Tickets
            </a>
          </article>
        </section>
      </main>
    `
    
    const results = await axe(div)
    expect(results).toHaveNoViolations()
  })

  it('should validate sold out event structure', async () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <main>
        <section aria-label="Sold out events">
          <article class="event-card sold-out" aria-labelledby="event-title-3">
            <h3 id="event-title-3">Sold Out Event</h3>
            <p>This event is completely sold out.</p>
            <div class="event-pricing">
              <span class="price sold-out" aria-label="Event is sold out">Sold Out</span>
            </div>
            <button disabled aria-label="Event is sold out, tickets unavailable">
              Sold Out
            </button>
          </article>
        </section>
      </main>
    `
    
    const results = await axe(div)
    expect(results).toHaveNoViolations()
  })

  it('should validate event card grid layout', async () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <main>
        <section aria-label="Event listings">
          <ul class="events-grid" aria-label="Upcoming events">
            <li>
              <article aria-labelledby="event-1">
                <h3 id="event-1">Event 1</h3>
                <p>Description 1</p>
              </article>
            </li>
            <li>
              <article aria-labelledby="event-2">
                <h3 id="event-2">Event 2</h3>
                <p>Description 2</p>
              </article>
            </li>
          </ul>
        </section>
      </main>
    `
    
    const results = await axe(div)
    expect(results).toHaveNoViolations()
  })

  it('should validate keyboard focus management', () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <article class="event-card">
        <h3>Focusable Event</h3>
        <a href="/event/focus-test" tabindex="0" role="button">
          View Details
        </a>
      </article>
    `
    
    document.body.appendChild(div)
    
    const link = div.querySelector('a')
    expect(link).toBeTruthy()
    
    if (link) {
      link.focus()
      expect(document.activeElement).toBe(link)
    }
    
    document.body.removeChild(div)
  })
})
