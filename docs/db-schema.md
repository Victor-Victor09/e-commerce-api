# Database Schema

## Tables

### users
| Column | Type | Notes |
|---|---|---|
| id | integer | PK |
| email | string | unique |
| password_hash | string | |
| role | string | `user` or `admin` |

### products
| Column | Type | Notes |
|---|---|---|
| id | integer | PK |
| name | string | |
| price | decimal | |
| inventory_count | integer | |

### carts
| Column | Type | Notes |
|---|---|---|
| id | integer | PK |
| user_id | integer | FK → users.id |

### cart_items
| Column | Type | Notes |
|---|---|---|
| id | integer | PK |
| cart_id | integer | FK → carts.id |
| product_id | integer | FK → products.id |
| quantity | integer | |

### orders
| Column | Type | Notes |
|---|---|---|
| id | integer | PK |
| user_id | integer | FK → users.id |
| status | string | `pending` → `paid` |
| total | decimal | |
| stripe_payment_intent_id | string | |

### order_items
| Column | Type | Notes |
|---|---|---|
| id | integer | PK |
| order_id | integer | FK → orders.id |
| product_id | integer | FK → products.id |
| quantity | integer | |
| price_at_purchase | decimal | copied from product price at checkout time |

## Relationships

- `users` 1—many `carts` (in practice, one active cart per user)
- `users` 1—many `orders`
- `carts` 1—many `cart_items`, `products` 1—many `cart_items` (resolves the cart↔product many-to-many)
- `orders` 1—many `order_items`, `products` 1—many `order_items` (resolves the order↔product many-to-many)

To read a user's cart: look up `carts` by `user_id`, then `cart_items` by the resulting `cart_id`. Orders follow the same pattern, `orders` by `user_id`, then `order_items` by `order_id`, except a user has many orders, not one.

## Key decisions

**`cart_items` and `order_items` are separate tables, not array columns**, because each row needs to carry two linked pieces of information, which product and how many, not just a list of ids. A table lets Postgres enforce the foreign keys and index the lookups; an array column would mean parsing JSON just to update one item's quantity.

**`price_at_purchase` is stored on `order_items` independently of `products.price`**, so that changing a product's price later doesn't rewrite the total on past orders. The order should reflect what was actually paid.

**`role` is a column on `users`, not a separate roles table**, because this project has exactly two fixed roles and no user needs more than one at a time. A roles/permissions table is the right call once that stops being true.

**`orders.status` exists because payment confirmation is asynchronous.** The order starts `pending` at checkout and only becomes `paid` when Stripe's webhook confirms the payment succeeded, not when the checkout request returns.