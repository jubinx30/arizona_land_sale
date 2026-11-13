# Arizona Life Homes and Land

A mobile-first, clickable real estate app prototype for Arizona Life Homes and Land – United Country Real Estate. The project is local-data only and requires no API key or backend.

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

The app runs in a centered 390 × 844 phone frame on desktop and fills the viewport on mobile.

## Screen inventory

- Splash and three-step onboarding (skippable)
- Home, featured listings, and property-type categories
- Search results with list/grid/map modes and sorting
- Property filters for price, acreage, type, county, city, and features
- Property detail with gallery, map, payment estimate, and broker actions
- Map search with price markers, listing previews, and area search
- Saved listings and compare selection
- Contact form with validation, consent, confirmation, and office details
- Browse by state, type, county, city, or price
- Brokerage information, accessibility, privacy, and terms accordions

## Design tokens

| Token | Value | Use |
|---|---|---|
| Primary green | `#1F7A54` | Actions, active states, map markers |
| Pressed green | `#0F5E3E` | Pressed/selected interactions |
| Navy | `#2B3A4F` | Headings, app chrome, footer |
| Steel blue | `#9DB4CC` | Sticky search band |
| Canvas | `#F4F6F8` | Soft backgrounds |
| Text | `#1A1A1A` | Primary body text |
| Radius | `12px` | Property cards and surfaces |
| Type | Montserrat | Headings and interface text |

## Notes

- Listings are seeded in `src/data/properties.ts`.
- Zustand persists saved properties, filters, and recent searches in local storage.
- Maps use Leaflet and OpenStreetMap tiles. Property photography is loaded from Unsplash.
- Browse selections apply matching filters; map search and saved-list comparison are interactive.
- Contact and broker call-to-action responses are mocked for prototype use.
