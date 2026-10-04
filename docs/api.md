> Historical pre-rebrand document retained for preservation. The active public website is Wills Group of Company (doors, gates, metalwork and interiors). Former business details are not current. See docs/REBRAND_DECISIONS.md for current scope and configuration.

# API Documentation

## Base URL

```
Production: https://thewworksict.com
Development: http://localhost:3001
```

## Authentication

### Browser CSRF

State-changing browser requests must first call `GET /api/security/csrf-token`, then send the returned token in `X-XSRF-TOKEN`. The response also sets the matching `XSRF-TOKEN` cookie.

### Admin Endpoints

Admin endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <admin-token>
```

## Endpoints

### Health Check

#### GET /api/health

Check API health status.

**Response:**
```json
{
  "status": "ok"
}
```

---

### CSRF Token

#### GET /api/security/csrf-token

Issue a signed browser CSRF token.

**Success Response (200):**
```json
{
  "token": "nonce.signature"
}
```

---

### Checkout Initialize

#### POST /api/checkout/initialize

Initialize a checkout session with Paystack.

**Headers:**
```
Content-Type: application/json
X-XSRF-TOKEN: <token from /api/security/csrf-token>
```

**Request Body:**
```json
{
  "customer": {
    "fullName": "string (required, 2-120 chars)",
    "email": "string (required, valid email)",
    "phone": "string (required, 7-24 chars)",
    "address": "string (required, 5-240 chars)",
    "city": "string (required, 2-80 chars)",
    "state": "string (required, 2-80 chars)",
    "notes": "string (optional, max 500 chars)"
  },
  "items": [
    {
      "id": "number (required, positive integer)",
      "quantity": "number (required, 1-20)"
    }
  ],
  "captchaToken": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "authorizationUrl": "https://checkout.paystack.co/xxx",
  "reference": "STK-xxx"
}
```

**Error Response (400):**
```json
{
  "message": "Your cart is empty."
}
```

---

### Checkout Verify

#### GET /api/checkout/verify/:reference

Verify payment status for an order.

**Parameters:**
- `reference` (required) - Order reference from Paystack

**Headers:**
```
Cookie: receiptToken=<token>
```

**Success Response (200):**
```json
{
  "order": {
    "reference": "STK-xxx",
    "status": "paid",
    "amount": 25000,
    "currency": "NGN",
    "paidAt": "2024-01-15T10:00:00Z",
    "paymentChannel": "card",
    "deliveryMessage": "Your payment has been confirmed.",
    "customer": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "address": "123 Main Street",
      "city": "Lagos",
      "state": "Lagos",
      "notes": ""
    },
    "items": [
      {
        "id": 1,
        "name": "Product 1",
        "price": 15000,
        "quantity": 1,
        "image": "/images/product.jpg"
      }
    ],
    "notifications": {
      "email": "sent",
      "sms": "sent"
    }
  }
}
```

**Error Response (404):**
```json
{
  "message": "We could not find that order."
}
```

---

### Admin - Get Current User

#### GET /api/admin/me

Get the currently authenticated admin user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized admin session."
}
```

---

### Admin - Get Dashboard Stats

#### GET /api/admin/stats

Get admin dashboard statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "revenue": "NGN 18.4M",
  "orders": 156,
  "metrics": [...],
  "series": [...]
}
```

---

### Admin - List Products

#### GET /api/admin/products

List all products.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "Premium Business Cards",
    "price": 15000,
    "category": "Essentials",
    "image": "/images/product.jpg",
    "supplier": "Thewworks Pressroom",
    "origin": "Digital press lane",
    "moq": "500 cards",
    "lead_time": "24-72 hours",
    "rating": 4.9,
    "orders": "248 repeat orders",
    "badge": "Fast proofing",
    "summary": "Thick card stock with matte finish..."
  }
]
```

---

### Admin - Create Product

#### POST /api/admin/products

Create a new product.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-XSRF-TOKEN: <token from /api/security/csrf-token>
```

**Request Body:**
```json
{
  "name": "string (required)",
  "price": "number (required, positive)",
  "category": "string (required)",
  "supplier": "string (required)",
  "image": "string (optional, URL)",
  "imageBase64": "string (optional, base64)",
  "origin": "string (optional)",
  "moq": "string (optional)",
  "lead_time": "string (optional)",
  "rating": "number (optional, 0-5)",
  "orders": "string (optional)",
  "badge": "string (optional)",
  "summary": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "name": "New Product",
  ...
}
```

**Error Response (400):**
```json
{
  "message": "Product details are invalid."
}
```

---

### Admin - Update Product

#### PUT /api/admin/products/:id

Update an existing product.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-XSRF-TOKEN: <token from /api/security/csrf-token>
```

**Parameters:**
- `id` (required) - Product ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "price": "number (optional, positive)",
  "category": "string (optional)",
  "supplier": "string (optional)",
  "image": "string (optional)",
  "imageBase64": "string (optional)",
  "origin": "string (optional)",
  "moq": "string (optional)",
  "lead_time": "string (optional)",
  "rating": "number (optional, 0-5)",
  "orders": "string (optional)",
  "badge": "string (optional)",
  "summary": "string (optional)"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "Updated Product",
  ...
}
```

**Error Response (400):**
```json
{
  "message": "No valid fields to update."
}
```

---

### Admin - Delete Product

#### DELETE /api/admin/products/:id

Delete a product.

**Headers:**
```
Authorization: Bearer <token>
X-XSRF-TOKEN: <token from /api/security/csrf-token>
```

**Parameters:**
- `id` (required) - Product ID

**Success Response (204):** No content

**Error Response (400):**
```json
{
  "message": "Invalid product ID."
}
```

---

### Paystack Webhook

#### POST /api/payments/paystack/webhook

Receive payment status updates from Paystack.

**Headers:**
```
x-paystack-signature: <signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "STK-xxx",
    "status": "success",
    "amount": 25000,
    "currency": "NGN",
    "channel": "card",
    "customer": {
      "email": "customer@example.com"
    }
  }
}
```

**Success Response (200):**
```json
{
  "received": true
}
```

**Error Response (401):**
```json
{
  "message": "Invalid Paystack signature."
}
```

---

## Error Codes

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Admin privileges required |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Payment not confirmed |
| 429 | RATE_LIMITED | Too many requests |
| 500 | SERVER_ERROR | Internal server error |

## Rate Limiting

- Checkout Initialize: 10 requests per 10 minutes
- Checkout Verify: 30 requests per 10 minutes
- Admin API: 100 requests per 15 minutes
