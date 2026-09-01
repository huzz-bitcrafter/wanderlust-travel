# PRD — Wanderlust (Travel Booking Platform)

**Version:** 1.0 | **Type:** Responsive web app | **Builder:** Lovable (React + Supabase)

## 1. Overview

Wanderlust is a full-stack travel website where users discover destinations, browse and book
tour packages, hotels, and flights, build personal itineraries, browse photo galleries, and
leave reviews. It includes a complete front-end admin panel to manage users, bookings,
packages, hotels, flights, reviews, and contact messages.

## 2. Problem

Travelers juggle multiple sites to research destinations, compare packages, book stays/flights,
and plan daily activities. Wanderlust consolidates discovery, booking, and trip planning into
one experience, while operators manage everything from a single admin panel.

## 3. Goals

- **User goal:** Find, plan, and book a full trip (tour + hotel + flight) in one session.
- **Business goal:** A maintainable catalog-driven booking site with admin-managed content.
- **Technical goal:** Clean, responsive, secure (RLS-protected) app built entirely with Lovable.

## 4. Target Users

| Persona              | Description          | Key needs                                             |
| -------------------- | -------------------- | ----------------------------------------------------- |
| The Explorer         | Solo traveler, 22–35 | Search, filters, reviews, tour booking                |
| The Family Planner   | Parent, 30–50        | Price filters, hotel booking, itinerary planning      |
| The Operator (Admin) | Site staff           | Manage users, bookings, packages, content, moderation |

## 5. Functional Requirements

| ID    | Feature                   | Description                                                                                                                                                                                             | Priority |
| ----- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-01 | User Registration & Login | Email/password auth (Supabase), profile creation, roles (`user`/`admin`), protected routes, logout, password reset                                                                                      | Must     |
| FR-02 | Destination Listings      | Card grid (image, name, country, short description, rating), featured section, pagination                                                                                                               | Must     |
| FR-03 | Search & Filter           | Global search bar (destinations, packages, hotels); filters: country/region, price range, duration, rating; sort by price/rating                                                                        | Must     |
| FR-04 | Tour Package Details      | Hero image, day-by-day itinerary, inclusions/exclusions, price, duration, difficulty, group size, booking CTA                                                                                           | Must     |
| FR-05 | Hotel Booking             | Hotel list + detail (stars, amenities, images); select dates & guests; price calculation; creates booking (pending → confirmed)                                                                         | Must     |
| FR-06 | Flight Booking            | Search by origin, destination, date, class; results list; passenger details; creates booking. Flights seeded in DB — no external API                                                                    | Must     |
| FR-07 | Travel Itinerary          | Logged-in users create itineraries: destination, date range, day-by-day items (time, activity, notes); view and edit                                                                                    | Must     |
| FR-08 | Photo Gallery             | Filterable masonry grid by destination; lightbox view; admin-managed images                                                                                                                             | Should   |
| FR-09 | Reviews & Ratings         | 1–5 stars + comment on destinations, tours, hotels (logged-in users); aggregate rating shown on cards/details; admin moderation                                                                         | Must     |
| FR-10 | Contact Form              | Name, email, phone, subject, message with validation; saved to DB; admin inbox with read/archive states                                                                                                 | Must     |
| FR-11 | Responsive Design         | Mobile-first; fully usable from 320px to 4K; mobile menu, stacked layouts, touch-friendly controls                                                                                                      | Must     |
| FR-12 | Admin Panel               | Stats dashboard (users, bookings, revenue); CRUD for destinations, packages, hotels, flights; booking management (change status); user management (view, change role); review moderation; message inbox | Must     |
| FR-13 | User Dashboard            | My bookings, my itineraries, my reviews, edit profile                                                                                                                                                   | Should   |

## 6. Non-Functional Requirements

- **Performance:** Lazy-loaded images, skeleton loaders, meaningful paint < 3s on 4G.
- **Security:** Row Level Security on every table; zod validation on all forms; no service keys client-side.
- **Accessibility:** WCAG AA contrast, keyboard navigation, alt text on all images.
- **SEO basics:** Unique meta title/description per page.

## 7. Out of Scope (v1)

- Real payment processing (checkout is simulated; Stripe = v2).
- Live flight/hotel inventory APIs (Amadeus, Booking.com, etc.) — data seeded in Supabase.
- Multi-language, native mobile apps, email marketing automation.

## 8. Success Metrics

- Search → booking conversion rate
- Registration completion rate
- Average session duration
- Reviews submitted per booking
