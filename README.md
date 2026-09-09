# Voltix — Full-Stack E-Commerce Store

A premium tech-gadget storefront with a working admin dashboard. This repository is
**phase one: the complete frontend**, running on mock data shaped like the API
responses the Express + MongoDB backend will return.

Built with **Vite + React + React Router + plain CSS** — no UI framework, no Tailwind,
no component library. Every component and every line of CSS is hand-written.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

Requires Node 18 or newer.

### Demo accounts

| Role     | Email                | Password    | Lands on |
|----------|----------------------|-------------|----------|
| Customer | `demo@voltix.store`  | `demo1234`  | `/account` |
| Admin    | `admin@voltix.store` | `admin1234` | `/admin` |

Both are pre-filled by the buttons at the bottom of the sign-in page.

---

## What's built

### Storefront
- **Home** — hero, value props, category grid, bestsellers, promo banner, new arrivals, sale rail
- **Shop** — filter by category, brand, max price, rating, stock and sale; six sort orders; text search. Every filter lives in the URL, so a filtered view is shareable and survives a refresh.
- **Product detail** — gallery with view switching, variant picker, quantity stepper, stock messaging, tabbed description / specifications / reviews with a rating breakdown, related products
- **Cart** — slide-over drawer plus a full cart page, free-delivery progress bar, quantity editing, live totals
- **Wishlist** — persisted per browser
- **404** — catch-all route

### Checkout
Three steps (contact → delivery → payment) with per-step validation, inline field
errors, a focusable error summary, card-number and expiry formatting, three delivery
options, and an order confirmation page with the full receipt.

### Accounts
Register with password-strength feedback, sign in, account area with order history,
saved items and account details. Routes are guarded — `/account` needs a session,
`/admin` needs an admin session.

### Admin dashboard
- **Overview** — revenue, orders, units and AOV stats; a six-month revenue chart; recent orders; top products by units; low and out-of-stock alerts
- **Products** — searchable, filterable table with create, edit and delete in a slide-over form
- **Orders** — search and status filter, expandable rows showing items, address and payment, and inline status changes that write straight through

---

## Design system

Generated with the [`ui-ux-pro-max`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
design database, then tuned:

| Decision | Value |
|---|---|
| Style | Minimalism / Swiss — spacious, product-forward, high contrast |
| Type | Inter, single family, hierarchy from weight and size |
| Colour | Monochrome (`#18181b`) + one blue accent (`#2563eb`) on `#fafafa` |
| Motion | Standard tier — 200–250 ms, `prefers-reduced-motion` honoured |
| Density | Standard — 4 px → 96 px spacing scale |

All of it lives in `src/index.css` as CSS custom properties, with a full dark theme
that swaps only the tokens.

### Motion

Every animation comes from a preset in the skill's motion table (17 presets across
7 categories, each graded Subtle / Standard / Complex). Implemented with **GSAP**
plus ScrollTrigger, Flip and SplitText. It all lives in `src/motion/`.

| Preset (tier) | Where |
|---|---|
| Stagger List · Standard | Product grids — `grid: 'auto'` gives a diagonal wave across the CSS grid, `back.out(1.4)`, 0.06s apart |
| Stagger List · Complex | Hero headline, SplitText per character, `expo.out` |
| Scroll Reveal · Standard | Value props, banner, product-page buy box, admin stat cards |
| Parallax Scroll · Subtle | Hero product image, scrubbed to scroll |
| Hover · Standard | Product card lift — `y: -4, scale: 1.02` via `quickTo`, with a reverse tween on leave and focus |
| Hover · Complex | Magnetic primary CTA that leans toward the cursor |
| Page Transition · Subtle | 180ms fade-in on route change |
| Page Transition · Complex | Flip morph: the card image you click becomes the product page's hero image |
| Loading / Skeleton · Subtle | CSS shimmer on skeletons (kept in CSS — no reason for a tween) |

Plus a fly-to-bag arc on add-to-cart, an elastic pop on the wishlist heart, count-up
on statistics, and bars growing from their baseline on the admin chart — deliberately
without the `back.out` overshoot, which the skill flags as sloppy on data UI.

**How the rules were followed**

- Everything runs inside `gsap.matchMedia()`. With `prefers-reduced-motion: reduce`, no tween is created at all and every element renders in its final state.
- Nothing is hidden by CSS. With JavaScript disabled the whole page is visible — the skill's warning about shipping invisible-by-default content.
- `gsap.context` scoping plus revert on unmount, so React 18 StrictMode's double-mount doesn't run every tween twice.
- Hover and magnetic effects skip coarse pointers entirely and remove their listeners on unmount.
- Product grids drop `pointer-events` for the length of their entrance so a click can't land on a card that is still sliding under the cursor.
- The cart drawer stays mounted through its exit tween, so closing animates instead of cutting.

GSAP 3.13+ ships Flip and SplitText under the standard
[no-charge licence](https://gsap.com/standard-license) — worth re-checking if this
ever becomes commercial.

### Accessibility

Checked, not assumed:

- Every colour pair in both themes meets WCAG AA (4.5:1) for body text
- Visible focus rings everywhere — never removed, only restyled
- Form errors are inline, tied to their field with `aria-describedby`, and repeated in a focusable error summary that links back to each invalid input
- Validation runs on blur and clears as soon as a field becomes valid
- The cart drawer traps focus, closes on `Escape`, and returns focus to the trigger
- Interactive targets are at least 44 × 44 px
- Status is never conveyed by colour alone — stock, order status and chart values all carry text
- SVG icons throughout; no emoji used as icons
- Skip link, landmarks, live regions for result counts and toasts

---

## Project structure