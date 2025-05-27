# 🔗 API Documentation

## 📋 Overview

This document provides comprehensive documentation for the **AI Product Categorizer** REST API. The backend runs on Flask and provides endpoints for authentication, product management, AI categorization, and e-commerce functionality.

**Base URL**: `http://localhost:8000`

---

## 🔐 Authentication

### **JWT Token Authentication**
Most endpoints require authentication. Include the JWT token in the request header:

```
Authorization: Bearer <jwt_token>
```

### **User Roles**
- **Customer**: Can browse products, manage cart, place orders
- **Seller**: Can manage own products, view sales, access platform tools

---

## 🚪 Authentication Endpoints

### **Register User**
```http
POST /api/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "customer"  // or "seller"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "customer"
  }
}
```

**Status Codes:**
- `201`: User created successfully
- `400`: Email already exists or invalid data

---

### **Login User**
```http
POST /api/login
```

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
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "customer"
  }
}
```

**Status Codes:**
- `200`: Login successful
- `401`: Invalid credentials

---

### **Get Current User**
```http
GET /api/user
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "customer"
}
```

---

## 🛍️ Product Endpoints

### **Get All Products (Marketplace)**
```http
GET /api/all-products
```

**Query Parameters:**
- `category`: Filter by category (optional)
- `min_price`: Minimum price filter (optional)
- `max_price`: Maximum price filter (optional)
- `search`: Text search in title/description (optional)

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "title": "MacBook Pro 14 M3",
      "description": "Latest MacBook Pro with M3 chip",
      "price": 1999.99,
      "category": "Electronics",
      "image_url": "https://images.unsplash.com/...",
      "seller": "admin@admin.com",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 10,
  "filtered": 5
}
```

---

### **Get User's Products**
```http
GET /api/products
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "products": [
    {
      "id": 2,
      "title": "iPhone 15 Pro",
      "description": "Latest iPhone model",
      "price": 999.99,
      "category": "Electronics",
      "image_url": "https://images.unsplash.com/...",
      "seller": "seller@example.com",
      "created_at": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### **Add Product**
```http
POST /api/products
```

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `title`: Product title
- `description`: Product description
- `price`: Product price
- `category`: Product category
- `image`: Image file (optional)

**Response:**
```json
{
  "message": "Product added successfully",
  "product": {
    "id": 3,
    "title": "New Product",
    "description": "Product description",
    "price": 99.99,
    "category": "Electronics",
    "image_url": "/uploads/image_123.jpg",
    "seller": "seller@example.com"
  }
}
```

**Status Codes:**
- `201`: Product created successfully
- `400`: Invalid data or missing fields
- `401`: Unauthorized (seller role required)

---

### **Update Product**
```http
PUT /api/products/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Product Title",
  "description": "Updated description",
  "price": 149.99,
  "category": "Fashion"
}
```

**Response:**
```json
{
  "message": "Product updated successfully",
  "product": {
    "id": 3,
    "title": "Updated Product Title",
    "description": "Updated description",
    "price": 149.99,
    "category": "Fashion"
  }
}
```

**Status Codes:**
- `200`: Product updated successfully
- `403`: Forbidden (not product owner)
- `404`: Product not found

---

### **Delete Product**
```http
DELETE /api/products/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

**Status Codes:**
- `200`: Product deleted successfully
- `403`: Forbidden (not product owner)
- `404`: Product not found

---

## 🤖 AI Categorization Endpoints

### **Categorize Image**
```http
POST /api/categorize
```

**Headers:** 
- `Content-Type: multipart/form-data`

**Form Data:**
- `image`: Image file for categorization

**Response:**
```json
{
  "predictions": [
    {
      "category": "Electronics",
      "confidence": 0.89
    },
    {
      "category": "Toys & Games",
      "confidence": 0.67
    },
    {
      "category": "Home & Furniture",
      "confidence": 0.45
    }
  ],
  "recommended_category": "Electronics"
}
```

**Status Codes:**
- `200`: Image categorized successfully
- `400`: No image provided or invalid format
- `500`: AI model error

---

## 🛒 Shopping Cart Endpoints

### **Get Cart Items**
```http
GET /api/cart
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "title": "MacBook Pro 14 M3",
      "price": 1999.99,
      "quantity": 1,
      "image_url": "https://images.unsplash.com/...",
      "total": 1999.99
    }
  ],
  "total_amount": 1999.99,
  "item_count": 1
}
```

---

### **Add to Cart**
```http
POST /api/cart
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "message": "Product added to cart",
  "item": {
    "id": 1,
    "product_id": 1,
    "quantity": 2,
    "total": 3999.98
  }
}
```

**Status Codes:**
- `201`: Item added to cart
- `400`: Invalid product or quantity
- `403`: Cannot add own products (sellers)

---

### **Update Cart Item**
```http
PUT /api/cart/{item_id}
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "message": "Cart updated successfully",
  "item": {
    "id": 1,
    "quantity": 3,
    "total": 5999.97
  }
}
```

---

### **Remove from Cart**
```http
DELETE /api/cart/{item_id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Item removed from cart"
}
```

---

## 📦 Order Endpoints

### **Place Order**
```http
POST /api/orders
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "shipping_address": "123 Main St, City, State 12345",
  "payment_method": "credit_card"
}
```

**Response:**
```json
{
  "message": "Order placed successfully",
  "order": {
    "id": 1,
    "total_amount": 1999.99,
    "status": "pending",
    "created_at": "2024-01-15T12:00:00Z",
    "items": [
      {
        "product_title": "MacBook Pro 14 M3",
        "quantity": 1,
        "price": 1999.99
      }
    ]
  }
}
```

**Status Codes:**
- `201`: Order placed successfully
- `400`: Empty cart or invalid data
- `401`: Authentication required

---

### **Get User Orders**
```http
GET /api/orders
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "total_amount": 1999.99,
      "status": "delivered",
      "created_at": "2024-01-15T12:00:00Z",
      "shipping_address": "123 Main St, City, State 12345",
      "items": [
        {
          "product_title": "MacBook Pro 14 M3",
          "quantity": 1,
          "price": 1999.99,
          "total": 1999.99
        }
      ]
    }
  ]
}
```

---

### **Get Order Details**
```http
GET /api/orders/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "total_amount": 1999.99,
  "status": "delivered",
  "created_at": "2024-01-15T12:00:00Z",
  "shipping_address": "123 Main St, City, State 12345",
  "payment_method": "credit_card",
  "items": [
    {
      "product_id": 1,
      "product_title": "MacBook Pro 14 M3",
      "quantity": 1,
      "price": 1999.99,
      "total": 1999.99,
      "seller": "admin@admin.com"
    }
  ]
}
```

---

## 👥 Seller Management Endpoints

### **Get All Users** (Seller Access)
```http
GET /api/users
```

**Headers:** `Authorization: Bearer <token>`  
**Role Required:** Seller

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "customer@example.com",
      "role": "customer",
      "created_at": "2024-01-10T09:00:00Z"
    },
    {
      "id": 2,
      "email": "seller@example.com",
      "role": "seller",
      "created_at": "2024-01-12T10:30:00Z"
    }
  ],
  "total": 2
}
```

**Status Codes:**
- `200`: Users retrieved successfully
- `403`: Forbidden (seller role required)

---

## 📊 Statistics Endpoints

### **Get Platform Statistics**
```http
GET /api/stats
```

**Response:**
```json
{
  "total_products": 25,
  "total_users": 15,
  "total_orders": 8,
  "categories": [
    {
      "name": "Electronics",
      "count": 8
    },
    {
      "name": "Fashion",
      "count": 5
    }
  ]
}
```

---

## ❌ Error Responses

### **Standard Error Format**
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### **Common Status Codes**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## 🔧 Rate Limiting

**Current Limits:**
- Authentication endpoints: 5 requests per minute
- Product endpoints: 100 requests per minute
- AI categorization: 10 requests per minute

---

## 📝 Notes

### **Image Upload Requirements**
- **Supported formats**: JPG, JPEG, PNG, GIF
- **Maximum size**: 10MB
- **Recommended dimensions**: 800x600px or higher

### **Category List**
Available product categories:
- Electronics
- Fashion & Clothing
- Home & Furniture
- Beauty & Personal Care
- Health & Wellness
- Groceries & Food
- Baby & Kids
- Sports & Outdoors
- Books & Stationery
- Automotive & Tools
- Pet Supplies
- Toys & Games
- Travel & Luggages

---

*This API documentation covers all available endpoints in the AI Product Categorizer platform. For additional support or questions, please refer to the project documentation.* 