#!/bin/bash
# Test Script for CRUD API with JWT Authentication

API_URL="http://localhost:3000/api"

echo "======================================"
echo "CRUD API Test Script with JWT Auth"
echo "======================================"

# 1. Register a user
echo -e "\n1. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@test.com",
    "password":"admin123",
    "name":"Admin User"
  }')

echo "Response: $REGISTER_RESPONSE"

# Extract token using grep and cut
USER_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "User Token: $USER_TOKEN"

# 2. Login
echo -e "\n2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@test.com",
    "password":"admin123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# 3. Get current user
echo -e "\n3. Getting current user info..."
curl -s -X GET $API_URL/auth/me \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

# 4. Try to create category without auth (should fail)
echo -e "\n4. Attempting to create category WITHOUT auth (should fail)..."
curl -s -X POST $API_URL/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electronic items"}' | jq .

# 5. Try to create category WITH auth but as regular user (should fail)
echo -e "\n5. Attempting to create category as regular user (should fail - need admin)..."
curl -s -X POST $API_URL/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"name":"Electronics","description":"Electronic items"}' | jq .

# 6. Get all categories (public, no auth needed)
echo -e "\n6. Getting all categories (public endpoint)..."
curl -s -X GET $API_URL/categories | jq .

echo -e "\n======================================"
echo "Test Complete!"
echo "======================================"
