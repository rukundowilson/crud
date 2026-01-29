# JWT Authentication & API Documentation Setup

## Overview
Your CRUD API now has complete JWT authentication with role-based access control and Swagger/OpenAPI documentation.

## File Structure Added

```
src/
├── middleware/
│   └── auth.ts                 # JWT authentication & authorization middleware
├── data/
│   └── users.ts                # User database operations
├── controllers/
│   └── authController.ts       # Login, Register, Get Current User
├── routes/
│   └── auth.ts                 # Authentication endpoints with Swagger docs
├── config/
│   └── swagger.ts              # Swagger/OpenAPI configuration
```

## New Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login and get JWT token
- **GET** `/api/auth/me` - Get current user info (requires auth)

### Categories (Updated with Auth)
- **GET** `/api/categories` - Get all categories (public)
- **GET** `/api/categories/:id` - Get category by ID (public)
- **POST** `/api/categories` - Create category (Admin only)
- **PUT** `/api/categories/:id` - Update category (Admin only)
- **DELETE** `/api/categories/:id` - Delete category (Admin only)

## Quick Start

### 1. Set Environment Variable
```bash
export JWT_SECRET="your-secret-key-change-in-production"
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Access Swagger UI
Open browser: `http://localhost:3000/api-docs`

## Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

Response:
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

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Category (Admin Only)
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices"
  }'
```

### Using Swagger UI
1. Click "Authorize" button in top-right
2. Enter your JWT token: `Bearer YOUR_JWT_TOKEN`
3. Click "Authorize"
4. Now all authenticated endpoints are available in UI

## Database Collections

MongoDB now includes:
- **users** - Stores user accounts with hashed passwords
- **categories** - Product categories
- **products** - Product catalog
- **carts** - User shopping carts

## Security Features

- ✅ Passwords are hashed with bcryptjs
- ✅ JWT tokens expire after 24 hours
- ✅ Role-based access control (Admin/User)
- ✅ Bearer token authentication in Swagger
- ✅ Protected admin endpoints

## Testing in MongoDB

```javascript
use crudApp

// View users
db.users.find()

// Create an admin user (for testing)
db.users.insertOne({
  id: "admin-123",
  email: "admin@example.com",
  password: "hashed_password",  // must be hashed via bcryptjs
  name: "Admin User",
  role: "admin",
  createdAt: new Date()
})
```

## Next Steps

To create an admin account for testing, use the API:
```bash
# Register as admin (normally done through app logic)
# Then manually update in MongoDB:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Environment Variables
```
JWT_SECRET=your-secret-key (default: "your-secret-key-change-in-production")
MONGO_URI=mongodb://localhost:27017 (default)
MONGO_DB=crudApp (default)
PORT=3000 (default)
```
