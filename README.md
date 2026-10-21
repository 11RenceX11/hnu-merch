# HNU Merch

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. No database: data is saved in JSON files
in `.data/`. Payments use PayMongo **test mode** (no real money).

## Run it

```bash
npm install
cp .env.example .env.local        # then fill in SESSION_SECRET and your PayMongo TEST key
npm run dev                       # http://localhost:3000
```

Generate the session secret with `openssl rand -base64 32`.

## Accounts

The accounts are fixed in the code (`src/data/seed-users.ts`). There is no sign-up and no user
database. The login page shows both accounts and fills the form in for you (it starts with the
collector). Click "Admin" to switch.

| Account   | Email                       | Password         |
|-----------|-----------------------------|------------------|
| Collector | `collector@hnu-merch.test`  | `Collector#2026` |
| Admin     | `admin@hnu-merch.test`      | `HnuAdmin#2026`  |

Passwords are stored as scrypt hashes, never as plain text. To change one, create a hash with
`hashPassword()` from `src/lib/password.ts`, paste it into `src/data/seed-users.ts`, and update
`src/data/demo-accounts.ts` so the login page shows the new password.

Login follows the Next.js authentication guide: a Server Action with `useActionState`, Zod
validation, an HttpOnly JWT cookie signed with `jose` (`src/lib/session.ts`), a Data Access Layer
(`src/lib/dal.ts`) and a Proxy for quick redirects (`src/proxy.ts`).

## What the admin can do (`/admin`)

- **Products**: add or edit a product, choose categories (a product can have several), collection,
  sizes and price, upload a photo, then **pin labels on the photo** (click "+ Add a pin", click the
  photo, type a label, choose the product the pin opens). Customers hover a pin to see the label
  and click it to open that item.
- **Collections**: same photo-and-pins editor for a bundle photo, for example a person wearing a
  t-shirt and a cap.
- **Sales calendar**: put a sale on the calendar with a start and end date. It starts and ends
  automatically. Click a day to start a sale there. You can pause or resume a sale by hand.
  A sale can cover everything, one collection or selected products.
- **Orders**: every order and its status.

## What collectors can do

- Log in with the collector account, see what they already own (`/account`, collection pages, "You own
  this" badges). They can always buy another of anything.
- Browse by category (`/shop`) and by collection or bundle (`/collections`).

## Weather bar

A bar at the very top of every page (`src/components/weather/`) shows the real weather at the campus
from the free Open-Meteo API: temperature, conditions and today's chance of rain. It also analyses
today, tomorrow and the coming weekend. When rain is likely it turns yellow and asks the student
"Do you have an umbrella?" (a reminder, not a sales message). A collector who already bought an
umbrella from the shop is reminded to bring it. If the forecast cannot be loaded, the bar says so.
Put your real exam dates in `src/data/campus.ts` so the reminder can mention exams.

## Design

White mode only. The layout follows the PewDiePie store (a big "now live" feature on top, Latest
releases, Help and support, Subscribe) with a playful layer: sticker badges, hard shadows, tilting
cards, a scrolling banner, a popping cart counter, "Added!" feedback and confetti after an order.
Colours and shadows are defined in `src/app/globals.css`.

## Payments (demo)

Flow: `src/actions/checkout.ts` creates a PayMongo Checkout Session (`src/lib/paymongo.ts`) and
redirects to PayMongo's hosted page. On that page use the test card **4343 4343 4343 4345**, any
future expiry and any 3-digit CVC (for GCash or Maya choose "Authorize"). The order is marked paid
only after our server confirms it with PayMongo: by the webhook (`/api/webhooks/paymongo`) or by
asking PayMongo directly when the customer returns, so it works on localhost without a tunnel.

Live keys (`sk_live_`) are blocked unless you set `ALLOW_LIVE_PAYMENTS=true`.

## Where things are

```
src/app/            Routes: shop, collections, products, account, checkout, admin, api, uploads
src/actions/        Server Actions: auth, checkout, admin-products, admin-collections, admin-sales
src/components/     UI grouped by feature (photo/ has the pin viewer and pin editor)
src/data/           Starter data: products, collections, categories, site text, campus, admin
src/lib/            Stores (users, products, collections, sales, orders), auth, pricing, PayMongo
public/             Placeholder photos (replace them from the admin area)
.data/              Created at runtime: saved accounts, products, sales, orders, uploads
```

## Before going live

- Replace the JSON files with a real database (only the files in `src/lib` that use
  `JsonFileStore` need to change). Serverless hosts such as Vercel do not keep files.
- `src/lib/rate-limit.ts` is in-memory. Use a shared store (Redis/Upstash) with many servers.
- Run `npm run lint` and `npm run build`.
