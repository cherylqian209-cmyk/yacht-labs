# Yacht-Inc API Endpoints Map

## Overview
This document provides a comprehensive map of yacht-inc API endpoints for managing yacht charters, users, and related resources. The API follows RESTful principles and requires authentication for most operations.

## Base URL
```
https://api.yacht-inc.com/api/v1
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## 1. Authentication Endpoints

### Register User
- **Method:** `POST`
- **Endpoint:** `/user/auth/register`
- **Description:** Registers a new user account
- **Authentication:** Not required
- **Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "johndoe@example.com",
  "password": "SecurePassword123"
}
```
- **Response:** User registration confirmation and token

### Authenticate User
- **Method:** `POST`
- **Endpoint:** `/user/auth/authenticate`
- **Description:** Authenticates existing user and returns access token
- **Authentication:** Not required
- **Request Body:**
```json
{
  "email": "johndoe@example.com",
  "password": "SecurePassword123"
}
```
- **Response:** Authentication token and user details

---

## 2. User Management Endpoints

### Get All Users
- **Method:** `GET`
- **Endpoint:** `/users`
- **Description:** Retrieves list of all registered users
- **Required Privileges:** ADMIN
- **Parameters:** None
- **Response:** Array of user objects

### Get Specific User
- **Method:** `GET`
- **Endpoint:** `/users/{id}`
- **Description:** Retrieves details of a specific user
- **Required Privileges:** USER (owner) or ADMIN
- **Parameters:** 
  - `id` (path parameter): User ID
- **Response:** User object with detailed information

### Update User
- **Method:** `PUT`
- **Endpoint:** `/users/{id}`
- **Description:** Updates user account details
- **Required Privileges:** ADMIN
- **Parameters:**
  - `id` (path parameter): User ID
- **Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "password": "NewSecurePassword123",
  "role": "user"
}
```
- **Response:** Updated user object

### Delete User
- **Method:** `DELETE`
- **Endpoint:** `/users/{id}`
- **Description:** Permanently deletes a user account
- **Required Privileges:** ADMIN
- **Parameters:**
  - `id` (path parameter): User ID
- **Response:** Deletion confirmation

---

## 3. Yacht Management Endpoints

### Get All Yachts
- **Method:** `GET`
- **Endpoint:** `/search`
- **Description:** Retrieves list of all available yachts
- **Required Privileges:** USER
- **Query Parameters:**
  - `category` (optional): Yacht category filter
  - `minLength` (optional): Minimum yacht length
  - `maxLength` (optional): Maximum yacht length
  - `capacity` (optional): Minimum passenger capacity
  - `propulsion` (optional): sailing/motor filter
- **Response:** Array of yacht objects

### Get Specific Yacht
- **Method:** `GET`
- **Endpoint:** `/search/{id}`
- **Description:** Retrieves detailed information about a specific yacht
- **Required Privileges:** USER
- **Parameters:**
  - `id` (path parameter): Yacht ID
- **Response:** Detailed yacht object with specifications

### Add Yacht
- **Method:** `POST`
- **Endpoint:** `/search`
- **Description:** Adds a new yacht to the fleet
- **Required Privileges:** ADMIN
- **Request Body:**
```json
{
  "model": "Sasanka",
  "propulsion": "sailing",
  "length": 6.60,
  "capacity": 5,
  "motorPower": 8.0,
  "priceFrom": 150.0,
  "accessories": [
    {"id": 1, "name": "tent"},
    {"id": 2, "name": "sink"}
  ]
}
```
- **Response:** Created yacht object with assigned ID

### Update Yacht
- **Method:** `PUT`
- **Endpoint:** `/search/{id}`
- **Description:** Updates yacht specifications and details
- **Required Privileges:** ADMIN
- **Parameters:**
  - `id` (path parameter): Yacht ID
- **Request Body:** Same as Add Yacht
- **Response:** Updated yacht object

### Delete Yacht
- **Method:** `DELETE`
- **Endpoint:** `/search/{id}`
- **Description:** Removes yacht from the fleet
- **Required Privileges:** ADMIN
- **Parameters:**
  - `id` (path parameter): Yacht ID
- **Response:** Deletion confirmation

---

## 4. Accessory Management Endpoints

### Get All Accessories
- **Method:** `GET`
- **Endpoint:** `/search/accessory`
- **Description:** Retrieves list of all available yacht accessories
- **Required Privileges:** ADMIN
- **Response:** Array of accessory objects

### Get Specific Accessory
- **Method:** `GET`
- **Endpoint:** `/search/accessory/{id}`
- **Description:** Retrieves details of a specific accessory
- **Required Privileges:** ADMIN
- **Parameters:**
  - `id` (path parameter): Accessory ID
- **Response:** Accessory object

### Add Accessory
- **Method:** `POST`
- **Endpoint:** `/search/accessory`
- **Description:** Adds a new accessory option
- **Required Privileges:** ADMIN
- **Request Body:**
```json
{
  "name": "tent",
  "description": "Weather protection tent",
  "price": 25.0
}
```
- **Response:** Created accessory object

### Update Accessory
- **Method:** `PUT`
- **Endpoint:** `/search/accessory/{id}`
- **Description:** Updates accessory details
- **Required Privileges:** ADMIN
- **Parameters:**
  - `id` (path parameter): Accessory ID
- **Request Body:** Same as Add Accessory
- **Response:** Updated accessory object

### Delete Accessory
- **Method:** `DELETE`
- **Endpoint:** `/search/accessory/{id}`
- **Description:** Removes accessory option
- **Required Privileges:** ADMIN
- **Parameters:**
  - `id` (path parameter): Accessory ID
- **Response:** Deletion confirmation

---

## 5. Pricing Endpoints

### Get Yacht Pricing
- **Method:** `GET`
- **Endpoint:** `/pricing/{priceFrom}/{from}/{to}`
- **Description:** Calculates yacht rental price for specified period
- **Required Privileges:** USER
- **Parameters:**
  - `priceFrom` (path parameter): Base daily price
  - `from` (path parameter): Start date (YYYY-MM-DD)
  - `to` (path parameter): End date (YYYY-MM-DD)
- **Response:** Pricing breakdown with total cost

---

## 6. Order Management Endpoints

### Get User Orders
- **Method:** `GET`
- **Endpoint:** `/orders`
- **Description:** Retrieves all orders for the authenticated user
- **Required Privileges:** USER
- **Query Parameters:**
  - `status` (optional): Filter by order status
  - `dateFrom` (optional): Filter orders from date
  - `dateTo` (optional): Filter orders to date
- **Response:** Array of user's order objects

### Get Specific Order
- **Method:** `GET`
- **Endpoint:** `/orders/{id}`
- **Description:** Retrieves detailed information about a specific order
- **Required Privileges:** USER (owner) or ADMIN
- **Parameters:**
  - `id` (path parameter): Order ID
- **Response:** Detailed order object

### Create Order
- **Method:** `POST`
- **Endpoint:** `/orders`
- **Description:** Creates a new yacht charter booking
- **Required Privileges:** USER
- **Request Body:**
```json
{
  "userId": 1,
  "yachtId": 1,
  "days": 10,
  "dateFrom": "2024-04-15",
  "dateTo": "2024-04-25",
  "price": 1987.5,
  "accessories": [1, 2],
  "notes": "Special requirements or requests"
}
```
- **Response:** Created order object with booking confirmation

### Update Order
- **Method:** `PUT`
- **Endpoint:** `/orders/{id}`
- **Description:** Updates order details (admin only)
- **Required Privileges:** ADMIN
- **Parameters:**
  - `id` (path parameter): Order ID
- **Request Body:** Same as Create Order
- **Response:** Updated order object

### Cancel Order
- **Method:** `DELETE`
- **Endpoint:** `/orders/{id}`
- **Description:** Cancels and removes an order
- **Required Privileges:** USER (owner) or ADMIN
- **Parameters:**
  - `id` (path parameter): Order ID
- **Response:** Cancellation confirmation

---

## 7. Additional Endpoints

### Health Check
- **Method:** `GET`
- **Endpoint:** `/health`
- **Description:** API health status check
- **Authentication:** Not required
- **Response:** Service status information

### API Documentation
- **Method:** `GET`
- **Endpoint:** `/docs`
- **Description:** Interactive API documentation (Swagger UI)
- **Authentication:** Not required
- **Response:** HTML documentation interface

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error context"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/endpoint"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting

API requests are limited to:
- **Authenticated users:** 1000 requests per hour
- **Admin users:** 5000 requests per hour
- **Unauthenticated endpoints:** 100 requests per hour

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248600
```

---

## Data Models

### User Object
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Yacht Object
```json
{
  "id": 1,
  "model": "Sasanka",
  "propulsion": "sailing",
  "length": 6.60,
  "capacity": 5,
  "motorPower": 8.0,
  "priceFrom": 150.0,
  "accessories": [
    {"id": 1, "name": "tent"},
    {"id": 2, "name": "sink"}
  ],
  "images": ["yacht1.jpg", "yacht2.jpg"],
  "description": "Beautiful sailing yacht perfect for small groups",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Order Object
```json
{
  "id": 1,
  "userId": 1,
  "yachtId": 1,
  "days": 10,
  "dateFrom": "2024-04-15",
  "dateTo": "2024-04-25",
  "price": 1987.5,
  "status": "confirmed",
  "accessories": [1, 2],
  "notes": "Special requirements",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## Contact Information

For API support and questions:
- **Website:** https://www.yacht-labs.com
- **Email:** api-support@yacht-inc.com
- **Documentation:** https://api.yacht-inc.com/docs