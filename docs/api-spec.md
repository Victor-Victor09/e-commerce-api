# API Specification

Base URL: `http://localhost:3000/api`

## Authentication

Protected routes require `Authorization: Bearer <token>`. Tokens carry the user's `id` and `role`. Admin routes check `role` from the verified token, never from the request body.

## Error codes

| Status | Meaning |
|---|---|
| 400 | Malformed request body or missing fields |
| 401 | Missing or invalid JWT |
| 403 | Valid JWT, but insufficient role for this route |
| 404 | Resource doesn't exist |
| 409 | Conflict, e.g. duplicate email on sign up |
| 500 | Unhandled server error |

Error body shape: `{ "error": { "message": "...", "code": "..." } }`

## Endpoints

| Method | Path | Auth | Request body | Response | Notes |
|---|---|---|---|---|---|
| POST | `/auth/register` | None | `{ email, password }` | `201` `{ id, email, role }` | `role` defaults to `user` |
| POST | `/auth/login` | None | `{ email, password }` | `200` `{ token }` | |
| GET | `/products` | None | Query: `search`, `page`, `limit` | `200` `{ products[], page, total }` | |
| GET | `/products/:id` | None | — | `200` product object | `404` if not found |
| GET | `/cart` | User | — | `200` `{ cart_id, items[] }` | Own cart only |
| POST | `/cart/items` | User | `{ product_id, quantity }` | `201` updated cart | Increments quantity if item already in cart |
| DELETE | `/cart/items/:productId` | User | — | `204` no body | |
| POST | `/checkout` | User | — | `201` `{ order_id, status: "pending", client_secret }` | Starts payment, does not confirm it |
| POST | `/webhooks/stripe` | Stripe signature | Stripe event payload | `200` | Flips order to `paid` on `payment_intent.succeeded`; must be idempotent |
| POST | `/admin/products` | Admin | `{ name, price, inventory_count }` | `201` created product | |
| PATCH | `/admin/products/:id` | Admin | Any subset of `{ name, price, inventory_count }` | `200` updated product | |

## Notes on non-obvious behavior

A few routes carry reasoning that doesn't fit in a table cell, worth reading once even though the table above is what you'll actually reference while building.

**Checkout is two steps, not one.** `POST /checkout` starts a Stripe payment intent and returns a `client_secret`, but the order stays `pending` when this call returns. Confirmation happens separately, when Stripe calls `/webhooks/stripe` after the payment actually succeeds. Don't have the checkout handler flip the order to `paid` itself, that would defeat the reason the webhook exists.

**The webhook needs to be idempotent.** Stripe can and does retry webhook delivery for the same event. If the handler isn't written to check "is this order already `paid`?" before acting, a retried event could double-decrement inventory or otherwise double-process the order.

**Cart and admin routes never trust an id from the client.** `/cart` and `/cart/items` always operate on the cart belonging to the token's `user_id`, there's no way to pass a different user's cart id and have it work. Admin routes check `role` from the same verified token. Both are the same principle: once a request is past the JWT check, the server decides who the caller is, the caller doesn't get to assert it.

## Data model reference

| Table | Key columns |
|---|---|
| `users` | id, email, password_hash, role |
| `products` | id, name, price, inventory_count |
| `carts` | id, user_id |
| `cart_items` | id, cart_id, product_id, quantity |
| `orders` | id, user_id, status, total, stripe_payment_intent_id |
| `order_items` | id, order_id, product_id, quantity, price_at_purchase |