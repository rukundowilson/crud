

## API Endpoints

Base path: `/api`

### Categories

- GET `/api/categories`

- GET `/api/categories/:id`

- POST `/api/categories`
  - Body: `{ "name": string, "description"?: string }`
  - Response: created category object (201)

- PUT `/api/categories/:id`
  - Body: `{ "name"?: string, "description"?: string }`
  - Response: updated category

- DELETE `/api/categories/:id`
  - Response: 204 No Content

### Products

- GET `/api/products`
  - Returns array of products

- GET `/api/products/:id`
  - Returns product by id

- POST `/api/products`
  - Body: `{ "name": string, "price": number, "categoryId": UUID, "inStock": boolean, "quantity": number, "description"?: string }`
  - Response: created product object (201)

- PUT `/api/products/:id`
  - Body: partial product fields
  - Response: updated product

- DELETE `/api/products/:id`
  - Response: 204 No Content

### Cart

All cart endpoints use a `userId` path param to identify the cart owner.

- GET `/api/cart/:userId`
  - Returns the cart for `userId` (creates empty cart if none)

- POST `/api/cart/:userId/items`
  - Add item to cart
  - Body: `{ "productId": UUID, "quantity": number }`
  - Response: created cart item (201)

- PUT `/api/cart/:userId/items/:id`
  - Update cart item quantity
  - Body: `{ "quantity": number }`
  - Response: updated cart item

- DELETE `/api/cart/:userId/items/:id`
  - Remove a single item from the cart
  - Response: 204 No Content

- DELETE `/api/cart/:userId`
  - Clear the entire cart for the user
  - Response: 204 No Content

## Examples (curl)

- Create category:
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Books","description":"All books"}'
```

- Create product (replace `<categoryId>`):
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Novel","price":9.99,"categoryId":"<>","inStock":true,"quantity":10}'
```

- Add item to cart (replace `<productId>`):
```bash
curl -X POST http://localhost:3000/api/cart/user123/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"<productId>","quantity":2}'
```
