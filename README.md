# E-Commerce API

A REST API for a small e-commerce platform. Users can browse products, manage a cart, and check out with Stripe. Admins manage inventory and pricing.

Built with Node.js, Express, PostgreSQL, and Sequelize, as a project to practice relational data modeling, JWT-based auth with role gating, and webhook-driven payment confirmation rather than trusting a synchronous checkout response.

## Features

- User sign up and login with JWT
- Browse and search products
- Cart tied to a logged-in user, persisted in Postgres
- Checkout through Stripe, with order status confirmed by webhook rather than by the checkout request itself
- Admin routes for managing products, pricing, and inventory, gated by role

## Tech stack

Node.js, Express, PostgreSQL, Sequelize, Stripe.

## Getting started

Clone the repo and install dependencies:

```bash
git clone <your-repo-url>
cd e-commerce-api
npm install
```

Create a `.env` file in the project root:

Check  `.env.example` for mock `.env` details.


Run migrations and start the server:

```bash
npx sequelize-cli db:migrate   # applies the schema in migrations/
npm run dev                    # starts the server with hot reload
```

The API will be running at `http://localhost:3000`.

## Testing the Stripe flow

Use the Stripe CLI to forward webhook events to your local server while developing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Run a checkout with a Stripe test card and confirm the order status flips from `pending` to `paid` once the webhook fires, not immediately on checkout.

## Data model

- `users` — id, email, password_hash, role
- `products` — id, name, price, inventory_count
- `carts` — id, user_id
- `cart_items` — id, cart_id, product_id, quantity
- `orders` — id, user_id, status, total, stripe_payment_intent_id
- `order_items` — id, order_id, product_id, quantity, price_at_purchase

`order_items` stores `price_at_purchase` separately from the live product price, so a price change later doesn't rewrite history on past orders.

## API reference

See `api-spec.md` for the full endpoint list, request and response shapes, and error codes.

## Notes on scope

This is a personal learning project, not a production service. Redis caching, multiple payment providers, and order history / refund flows are deliberately out of scope for now.

## License

No License for now.