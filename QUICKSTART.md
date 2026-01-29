# 🚀 Complete Setup Guide - JWT Auth & Swagger Docs

## What You Have Now

Your CRUD API is fully equipped with:
- ✅ **User Authentication** (Register/Login)
- ✅ **JWT Tokens** (24-hour expiration)
- ✅ **Role-Based Access Control** (Admin/User)
- ✅ **Swagger/OpenAPI Documentation** with Bearer token
- ✅ **MongoDB Integration** (Users, Categories, Products, Carts)
- ✅ **Password Security** (Bcryptjs hashing)

---

## 📁 New Files Created

```
src/
├── middleware/auth.ts              # JWT verification & role checking
├── controllers/authController.ts   # Login, Register, Current User
├── data/users.ts                   # User database operations  
├── routes/auth.ts                  # Auth endpoints with Swagger docs
└── config/swagger.ts               # Swagger/OpenAPI configuration

Root:
├── API_DOCUMENTATION.md            # Complete API reference
├── AUTH_SETUP.md                   # Auth setup details
├── IMPLEMENTATION_SUMMARY.md       # What was added (this file)
└── test-api.sh                     # Automated testing script
```

---

## 🎯 Quick Start (5 Minutes)

### 1. Start MongoDB
```bash
docker run -d -p 27017:27017 mongo
# or if installed: sudo systemctl start mongod
```

### 2. Start Server
```bash
cd /home/willy/crud
npm run dev
```

### 3. Access Swagger UI
Open browser: **`http://localhost:3000/api-docs`**

### 4. Test Register Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@test.com",
    "password":"pass123",
    "name":"Test User"
  }'
```

### 5. Copy Token & Authorize in Swagger
- Click "Authorize" button in Swagger UI
- Paste token: `Bearer YOUR_TOKEN_HERE`
- Now test all protected endpoints!

---

## 📚 API Endpoints Summary

### Authentication (No Auth Required)
```
POST   /api/auth/register    - Create new user account
POST   /api/auth/login       - Get JWT token
GET    /api/auth/me          - Get current user (requires token)
```

### Categories (Public Read, Admin Write)
```
GET    /api/categories       - List all categories (public)
GET    /api/categories/:id   - Get one category (public)
POST   /api/categories       - Create category (ADMIN ONLY)
PUT    /api/categories/:id   - Update category (ADMIN ONLY)
DELETE /api/categories/:id   - Delete category (ADMIN ONLY)
```

### Products & Cart
```
GET/POST/PUT/DELETE /api/products
GET/POST/PUT        /api/cart/:userId
```

---

## 🔐 How Authentication Works

### Flow Diagram
```
1. User sends credentials to /api/auth/login
   ↓
2. Server verifies email & password
   ↓
3. Server creates JWT token (signed with JWT_SECRET)
   ↓
4. User stores token (typically in localStorage)
   ↓
5. User sends token in header: Authorization: Bearer TOKEN
   ↓
6. authMiddleware verifies token signature
   ↓
7. adminMiddleware checks if user role is "admin"
   ↓
8. Endpoint executes & returns data
```

### Token Structure
```
Header (algorithm & type):
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (user data):
{
  "userId": "uuid",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234654290  // expires in 24 hours
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "your-secret-key"
)
```

---

## 👥 User Roles

### User Role
- ✓ Register & login
- ✓ View public data
- ✓ Cannot create/edit/delete categories
- ✗ No admin access

### Admin Role
- ✓ All user permissions
- ✓ Create categories
- ✓ Update categories
- ✓ Delete categories
- Can only be assigned manually via MongoDB

---

## 🛠️ Creating an Admin User

### Method 1: Via MongoDB (Fastest)
```bash
mongosh mongodb://localhost:27017/crudApp
```

```javascript
// Update existing user to admin
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)

// Verify it worked
db.users.findOne({ email: "user@example.com" })
```

### Method 2: Direct Insert (For Testing)
```javascript
db.users.insertOne({
  id: "admin-001",
  email: "admin@example.com",
  password: "$2b$10$hashedpasswordhere", // needs to be pre-hashed
  name: "Admin User",
  role: "admin",
  createdAt: new Date()
})
```

---

## 🧪 Test Examples

### Test 1: Complete Flow
```bash
# 1. Register
USER_DATA=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123","name":"Admin"}')

TOKEN=$(echo $USER_DATA | jq -r '.token')
echo "Token: $TOKEN"

# 2. Make them admin in MongoDB
mongosh mongodb://localhost:27017/crudApp --eval \
  "db.users.updateOne({email:'admin@example.com'}, {\$set:{role:'admin'}})"

# 3. Login to get fresh token
LOGIN_DATA=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $LOGIN_DATA | jq -r '.token')
echo "Admin Token: $ADMIN_TOKEN"

# 4. Create category (should work now)
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Electronics","description":"Electronic devices"}' | jq .
```

### Test 2: Permission Denied
```bash
# Try to create category as regular user (should fail)
REGULAR_TOKEN="token_from_regular_user"

curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REGULAR_TOKEN" \
  -d '{"name":"Books"}' | jq .

# Expected response:
# {"message":"Admin access required"}
```

### Test 3: No Token (should fail)
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Books"}'

# Expected response:
# {"message":"Missing or invalid token"}
```

---

## 🔧 Configuration

### Environment Variables
Create `.env` file or export:
```bash
export JWT_SECRET="change-this-in-production"
export MONGO_URI="mongodb://localhost:27017"
export MONGO_DB="crudApp"
export PORT="3000"
```

### Default Values
```
JWT_SECRET: "your-secret-key-change-in-production"
MONGO_URI: "mongodb://localhost:27017"
MONGO_DB: "crudApp"
PORT: 3000
```

---

## 📊 Database Schema

### users Collection
```javascript
{
  _id: ObjectId(),
  id: "uuid",
  email: "user@example.com",        // unique
  password: "$2b$10$...",            // bcryptjs hashed
  name: "User Name",
  role: "user" | "admin",
  createdAt: ISODate("2026-01-21T...")
}
```

### categories Collection
```javascript
{
  _id: ObjectId(),
  id: "uuid",
  name: "Category Name",
  description: "Optional description"
}
```

### products Collection
```javascript
{
  _id: ObjectId(),
  id: "uuid",
  name: "Product Name",
  price: 99.99,
  description: "Optional",
  categoryId: "uuid",
  inStock: true,
  quantity: 10
}
```

### carts Collection
```javascript
{
  _id: ObjectId(),
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

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing or invalid token" | Include `Authorization: Bearer YOUR_TOKEN` header |
| "Invalid or expired token" | Token expired (24h) or secret key changed - login again |
| "Admin access required" | User doesn't have admin role - update in MongoDB |
| "MongoDB not connected" | Start MongoDB: `docker run -d -p 27017:27017 mongo` |
| "Port 3000 already in use" | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| Swagger doesn't show docs | Ensure swagger-jsdoc parsed files correctly - rebuild |

---

## 🚀 Production Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS/TLS
- [ ] Set NODE_ENV=production
- [ ] Add rate limiting middleware
- [ ] Enable CORS properly
- [ ] Add request logging
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up API key rotation
- [ ] Add email verification
- [ ] Implement password reset flow
- [ ] Add request validation
- [ ] Set up monitoring/alerts

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `API_DOCUMENTATION.md` | Complete API endpoint reference |
| `AUTH_SETUP.md` | Authentication setup & configuration |
| `IMPLEMENTATION_SUMMARY.md` | Technical implementation details |
| `test-api.sh` | Automated API test script |
| `README.md` | Original project readme |
| `MONGO_SETUP_README.md` | MongoDB setup guide |

---

## 💡 Tips & Tricks

### 1. Store Token in Browser
```javascript
// On successful login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const { token } = await response.json();
localStorage.setItem('auth_token', token);

// Use token in requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
};
```

### 2. Auto-Refresh UI After Login
```javascript
// After login, redirect to dashboard
window.location.href = '/dashboard';

// On dashboard, fetch user info
const response = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const user = await response.json();
```

### 3. Handle Expired Tokens
```javascript
// Check token expiration
const checkTokenExpiry = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp > Date.now() / 1000;
};

if (!checkTokenExpiry(token)) {
  // Redirect to login
  window.location.href = '/login';
}
```

---

## 🎓 Learning Resources

- JWT.io - JWT explanation & debugger
- Express.js - Web framework docs
- MongoDB - Database documentation
- Swagger/OpenAPI - API documentation standard
- Bcryptjs - Password hashing library

---

## ✅ Completion Checklist

- [x] JWT Authentication implemented
- [x] User registration endpoint
- [x] User login endpoint
- [x] Bearer token in Swagger UI
- [x] Categories API documented
- [x] Admin-only operations protected
- [x] Role-based access control
- [x] Password hashing with bcryptjs
- [x] Token expiration (24 hours)
- [x] Clear file architecture
- [x] Comprehensive documentation
- [x] Test scripts provided

---

## 🎉 You're All Set!

Your API now has production-ready authentication and comprehensive documentation. 

**Next Steps:**
1. Deploy to production server
2. Set strong JWT_SECRET
3. Enable HTTPS
4. Set up monitoring
5. Add more features (password reset, email verification, etc.)

**Support Documentation:**
- Read `API_DOCUMENTATION.md` for full API reference
- Check `AUTH_SETUP.md` for detailed auth configuration
- Run `bash test-api.sh` to test all endpoints

---

**Created:** January 21, 2026  
**Status:** ✅ Complete & Ready for Use
