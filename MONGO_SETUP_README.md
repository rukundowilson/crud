# MongoDB Integration for CRUD App

This README documents the steps taken to integrate MongoDB into your Node.js CRUD application.

## Steps Performed

### 1. MongoDB Configuration
- Created `src/data/mongoConfig.ts` to handle MongoDB connection, database selection, and closing logic.
- Uses environment variables `MONGO_URI` and `MONGO_DB` for connection string and database name.

### 2. Install MongoDB Driver
- Ran the following command to install the official MongoDB Node.js driver:

```
npm install mongodb
```

### 3. Refactored Data Storage
- Updated `src/data/store.ts` to use MongoDB collections for categories, products, and carts.
- Replaced in-memory arrays/objects with async CRUD functions that interact with MongoDB.

### 4. Updated Controllers
- Refactored all controllers in `src/controllers/` to use the new MongoDB-based store functions:
  - `productsController.ts`
  - `categoriesController.ts`
  - `cartController.ts`
- All CRUD operations now read/write data from MongoDB.

### 5. MongoDB Service
- Verified MongoDB service is running:

```
sudo systemctl status mongod
```

## Environment Variables
Set these in your environment or a `.env` file:
```
MONGO_URI=mongodb://localhost:27017
MONGO_DB=crudApp
```

## Usage
- On app start, MongoDB will be connected automatically.
- All data is now persisted in MongoDB.

---
If you need help with testing, environment setup, or further features, let me know!
