# Voltix

A full-stack e-commerce storefront for tech gadgets, with a working admin dashboard.
Built from scratch — no UI framework, no component library, no CSS framework.

**Live:** [voltix-tech-store.vercel.app](https://voltix-tech-store.vercel.app)
**API:** [voltix-api-wine.vercel.app/api/health](https://voltix-api-wine.vercel.app/api/health)

---

## What it is

A complete shop: browse and filter 26 products, read reviews, build a cart and a
wishlist, register an account, place an order, and track it. Behind a sign-in wall
there's an admin dashboard for managing products and moving orders through their
statuses.

Products, users and orders live in MongoDB. The React frontend and the Express API
are deployed separately and talk over HTTP.

---

## Stack

**Frontend** — Vite 5, React 18, React Router 6, GSAP 3 (ScrollTrigger, Flip, SplitText),
hand-written CSS

**Backend** — Node, Express 4, Mongoose 8, JSON Web Tokens, bcryptjs

**Data** — MongoDB Atlas

**Hosting** — Vercel (static frontend + serverless API), two projects from one repo

Twelve direct dependencies in total.

---

## Demo accounts

| Role     | Email                | Password    | Lands on   |
|----------|----------------------|-------------|------------|
| Customer | `demo@voltix.store`  | `demo1234`  | `/account` |
| Admin    | `admin@voltix.store` | `admin1234` | `/admin`   |

Both are pre-filled by buttons at the bottom of the sign-in page.

---

## Running locally

Requires Node 18+ and a MongoDB connection string (the Atlas free tier is enough).

### 1. The API

```bash
cd server
npm install
cp .env.example .env      # then fill it in — see below
npm run seed              # loads 26 products, 2 users, 8 orders
npm run dev               # http://localhost:5000
```

`server/.env`:

| Variable         | Example                                              | Notes |
|------------------|------------------------------------------------------|-------|
| `PORT`           | `5000`                                               | |
| `MONGO_URI`      | `mongodb+srv://user:pass@cluster.mongodb.net/voltix` | Include `/voltix` before the `?` |
| `JWT_SECRET`     | any long random string                               | Changing it invalidates every issued token |
| `JWT_EXPIRES_IN` | `7d`                                                 | |
| `CLIENT_ORIGIN`  | `http://localhost:5173`                              | Comma-separated for more than one |

### 2. The frontend

From the repository root, in a second terminal:

```bash
npm install
npm run dev               # http://localhost:5173
```

Root `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Anything prefixed `VITE_` is substituted into the browser bundle at build time, so
it is public. Secrets belong in `server/.env`, which never reaches the client.

### Other scripts

```bash
npm run build             # production build into dist/
npm run preview           # serve that build locally

cd server
npm run seed              # wipe and reload the demo data
npm run seed:destroy      # empty every collection
```

---

## API

Base path `/api`. All responses are JSON. Every model's `toJSON` renames `_id` to
`id` and strips `__v` and `password`, so the client never sees Mongo internals.

### Products

| Method | Path              | Auth  | Notes |
|--------|-------------------|-------|-------|
| GET    | `/products`       | —     | Filtered, sorted, paginated |
| GET    | `/products/meta`  | —     | Brands, categories, price bounds for the filter sidebar |
| GET    | `/products/:slug` | —     | One product by slug |
| POST   | `/products`       | admin | |
| PUT    | `/products/:id`   | admin | |
| DELETE | `/products/:id`   | admin | |

`GET /products` accepts `q`, `category`, `brand` (comma-separated), `maxPrice`,
`minRating`, `inStock=1`, `sale=1`, `page`, `limit`, and `sort` — one of
`featured`, `price-asc`, `price-desc`, `rating-desc`, `newest`, `name-asc`.
It returns `{ items, total, page, pages }`.

### Auth

| Method | Path             | Auth | Notes |
|--------|------------------|------|-------|
| POST   | `/auth/register` | —    | Returns a token |
| POST   | `/auth/login`    | —    | Returns a token |
| GET    | `/auth/me`       | user | Restores a session from a stored token |

### Orders

| Method | Path                        | Auth  | Notes |
|--------|-----------------------------|-------|-------|
| POST   | `/orders`                   | —     | Guest checkout allowed; attaches the user if a token is sent |
| GET    | `/orders/mine`              | user  | The signed-in user's orders |
| GET    | `/orders/:reference`        | —     | Lookup by order reference |
| GET    | `/orders`                   | admin | Every order |
| PATCH  | `/orders/:reference/status` | admin | |
| GET    | `/orders/stats/summary`     | admin | Revenue, counts, status breakdown, daily totals |

### Health

`GET /api/health` returns `{ ok: true, uptime }`. It is registered *before* the
database middleware, so it answers even when MongoDB is unreachable — which is how
you tell "server down" from "database down".

---

## Structure

```
src/                    frontend
  components/           header, footer, cards, filters, icons
  context/              StoreContext — cart, wishlist, auth, catalogue
  data/                 seed catalogue and demo users
  hooks/                useLocalStorage
  lib/api.js            the single fetch boundary
  motion/               GSAP setup and the Flip helper
  pages/                storefront routes
  pages/admin/          dashboard, products, orders

server/src/             API
  config/db.js          cached Mongoose connection
  models/               Product, User, Order
  controllers/          request handling
  routes/               route definitions
  middleware/           auth, error handling
  utils/token.js        JWT sign and verify
  app.js                builds the Express app
  index.js              starts it (skipped on Vercel)
  seed.js               loads the demo data
```

---

## Decisions worth knowing

**Prices come from the database, never the request.** Checkout sends only
`productId`, `quantity` and `variant`. The API looks up each product, computes the
line total itself, and stores it on the order. A client that sends its own prices
can be told to charge £0.

**Filtering happens in the database.** `GET /products` builds a Mongo query rather
than shipping the whole catalogue for the browser to sift. The results page and the
total count run as two parallel queries.

**Passwords can't be stored in plaintext.** A `pre('save')` hook hashes with bcrypt,
and the field is `select: false`, so no route can leak it by accident. The seed uses
`create()` in a loop rather than `insertMany()` — `insertMany` skips the hook.

**Registration can't grant admin.** `register` destructures only `name`, `email` and
`password` from the body. `role` is never read from a request.

**Sign-in errors don't confirm which emails exist.** "No such user" and "wrong
password" return the same message.

**Stock decrements atomically.** One `bulkWrite` with `$inc`, so two simultaneous
orders can't both sell the last unit.

**Derive live data, copy historical data.** Orders store their own totals and
line-item prices. Changing a product's price tomorrow must not rewrite what someone
paid last week.

**Animations respect `prefers-reduced-motion`.** GSAP is set up through
`gsap.matchMedia`, so for those users no tween is created at all — not created and
then skipped.

**Serverless connection caching.** Mongoose's connection is cached on `globalThis`,
because a serverless function has no startup phase and connecting per request would
exhaust Atlas's connection limit.

---

## Not included

No payment processing. Orders are real database records with real totals, but
nothing is charged — there's no card form and no Stripe integration. Adding Stripe
test mode would be the natural next step.

No TypeScript, no state management library, no CSS framework, no component library.
All deliberate.