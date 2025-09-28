# Eventra User Personas and Simulation Plan

This document defines realistic personas and maps them to simulation scripts for load and journey testing.

Personas:
- Tourist Tara
  - Goal: Discover weekend events in Baghdad, book 2 tickets, share with friend
  - Behavior: Mobile, English UI, compares 3 options before booking
- Local Leyla
  - Goal: Browse family-friendly events, add to favorites, purchase later
  - Behavior: Arabic RTL UI, evening peak usage (18:00-21:00 local)
- Planner Peshraw
  - Goal: Searches for venues, checks availability, contacts organizer
  - Behavior: Desktop, Kurdish UI, longer sessions
- Business Bilal
  - Goal: Corporate event booking, requests invoice, multi-ticket checkout
  - Behavior: Desktop, multiple tabs, uses filters heavily

Simulation mapping:
- Light browsing (Tara, Leyla): GET homepage, categories, search, event details
- Deep discovery (Peshraw): search + filter combinations, venue detail, availability
- Checkout (Bilal): cart, checkout, payment endpoints (use mock/test mode)

Environment variables used by scripts:
- BASE_URL: Target base URL (e.g., https://staging.yourdomain.com)
- AUTH_TOKEN (optional): API token if needed for certain flows
- LOCALE: en, ar, ku
- RAMP_VUS: virtual users to ramp to (default 20)
- DURATION: test duration (e.g., 5m)
