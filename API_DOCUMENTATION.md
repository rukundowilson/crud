# CRUD API with JWT Authentication & Swagger Documentation

Complete REST API with MongoDB integration, JWT authentication, role-based access control, and interactive API documentation.

## Features

✅ **JWT Authentication** - Secure Bearer token authentication  
✅ **Role-Based Access Control** - Admin and User roles  
✅ **Swagger/OpenAPI UI** - Interactive API documentation  
✅ **Password Hashing** - Bcryptjs for secure password storage  
✅ **MongoDB Integration** - Persistent data storage  
✅ **Express.js** - Fast HTTP server  
✅ **TypeScript** - Type-safe code  

## Project Structure

```
crud/
├── src/
│   ├── middleware/
│   │   └── auth.ts                 # JWT & role-based auth
│   ├── controllers/
│   │   ├── authController.ts       # Login, Register, Current User
│   │   ├── categoriesController.ts # Category CRUD with docs
│   │   ├── productsController.ts   # Product CRUD
│   │   └── cartController.ts       # Cart management
│   ├── routes/
│   │   ├── auth.ts                 # Auth endpoints
│   │   ├── categories.ts           # Category routes
│   │   ├── products.ts             # Product routes
│   │   └── cart.ts                 # Cart routes
│   ├── data/
│   │   ├── mongoConfig.ts          # MongoDB connection
│   │   ├── store.ts                # Database operations
│   │   └── users.ts                # User operations
│   ├── config/
│   │   └── swagger.ts              # Swagger configuration
│   └── types/
│       └── index.ts                # TypeScript interfaces
├── index.ts                        # Main server file
├── AUTH_SETUP.md                   # Authentication setup guide
├── MONGO_SETUP_README.md           # MongoDB setup guide
└── package.json
```

## Installation

1. **Clone/Setup Project**
```bash
cd crud
npm install
```

2. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 mongo

# Or if installed locally
sudo systemctl start mongod
```

3. **Set Environment Variables (Optional)**
```bash
export JWT_SECRET="your-secret-key-change-in-production"
export MONGO_URI="mongodb://localhost:27017"
export MONGO_DB="crudApp"
export PORT="3000"
```

4. **Build TypeScript**
```bash
npm run build
```

5. **Start Development Server**
```bash
npm run dev
```

Server will run on: `http://localhost:3000`

## API Documentation

### Access Swagger UI
Open browser: **`http://localhost:3000/api-docs`**

In Swagger UI:
1. Click **"Authorize"** button (top-right)
2. Enter: `Bearer YOUR_JWT_TOKEN`
3. Click **"Authorize"**
4. All authenticated endpoints now available

---

## Authentication Endpoints

### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### POST `/api/auth/login`
Login and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### GET `/api/auth/me`
Get current user information.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}
```

---

## Categories Endpoints

### GET `/api/categories`
Get all categories (public).

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Electronics",
    "description": "Electronic devices"
  }
]
```

### GET `/api/categories/:id`
Get specific category.

**Response:**
```json
{
  "id": "uuid",
  "name": "Electronics",
  "description": "Electronic devices"
}
```

### POST `/api/categories` ⭐ Admin Only
Create new category.

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Electronics",
  "description": "Electronic devices"
}
```

### PUT `/api/categories/:id` ⭐ Admin Only
Update category.

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### DELETE `/api/categories/:id` ⭐ Admin Only
Delete category.

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Response:** `204 No Content`

---

## Products Endpoints

### GET `/api/products`
Get all products.

### GET `/api/products/:id`
Get specific product.

### POST `/api/products`
Create new product.

### PUT `/api/products/:id`
Update product.

### DELETE `/api/products/:id`
Delete product.

---

## Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "pass123",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "pass123"
  }'
```

**Create Category (with token):**
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Books",
    "description": "Books and literature"
  }'
```

### Using Test Script
```bash
bash test-api.sh
```

---

## MongoDB Collections

### users
```javascript
{
  id: "uuid",
  email: "user@example.com",
  password: "hashed_password",  // bcryptjs hashed
  name: "User Name",
  role: "user" | "admin",
  createdAt: ISODate("2026-01-21T10:00:00Z")
}
```

### categories
```javascript
{
  id: "uuid",
  name: "Category Name",
  description: "Optional description"
}
```

### products
```javascript
{
  id: "uuid",
  name: "Product Name",
  price: 99.99,
  description: "Optional description",
  categoryId: "uuid",
  inStock: true,
  quantity: 10
}
```

### carts
```javascript
{
  userId: "uuid",
  items: [
    {
      id: "uuid",
      productId: "uuid",
      name: "Product Name",
      price: 99.99,
      quantity: 2
    }
  ]
}
```

---

## Creating Admin Users

### Option 1: Via MongoDB
```bash
mongosh mongodb://localhost:27017/crudApp
```

```javascript
// Update user to admin
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### Option 2: Programmatically
Modify user registration to set role, or create an admin endpoint.

---

## Security Features

- ✅ **Password Hashing** - Bcryptjs (10 salt rounds)
- ✅ **JWT Tokens** - Expire after 24 hours
- ✅ **Bearer Authentication** - Swagger compatible
- ✅ **Role-Based Access** - Admin/User separation
- ✅ **Protected Routes** - Auth middleware on admin endpoints
- ✅ **Environment Secrets** - JWT_SECRET configurable

---

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
MONGO_DB=crudApp

# Server Configuration
PORT=3000
```

---

## Scripts

```bash
# Development with auto-reload
npm run dev

# Build TypeScript
npm run build

# Production start
npm start
```

---

## Troubleshooting

**"Missing or invalid token"**
- Include `Authorization: Bearer YOUR_TOKEN` header
- Token must be valid and not expired

**"Admin access required"**
- Only admin users can modify categories
- Update user role in MongoDB to "admin"

**"MongoDB not connected"**
- Ensure MongoDB is running
- Check MONGO_URI connection string

**Port already in use**
- Change PORT environment variable
- Or kill process: `lsof -ti:3000 | xargs kill -9`

---

## Next Steps

- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add request logging
- [ ] Set up rate limiting
- [ ] Add user profile management
- [ ] Implement refresh tokens
- [ ] Add API key authentication option
- [ ] Set up unit tests

---

## License

ISC

---

**Created:** January 21, 2026  
**API Version:** 1.0.0
