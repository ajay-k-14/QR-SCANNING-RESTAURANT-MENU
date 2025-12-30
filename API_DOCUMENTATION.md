# Global Order Management API - Complete Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
Currently, the API is open. For production, implement JWT authentication.

---

## Endpoints Reference

### 1. Create Order

**Endpoint:** `POST /api/orders`

**Description:** Create a new customer order

**Request Body:**
```json
{
  "items": [
    {
      "id": "app-1",
      "name": "Parippu Vada",
      "quantity": 2,
      "price": 10
    },
    {
      "id": "main-2",
      "name": "Chicken Biryani",
      "quantity": 1,
      "price": 200
    }
  ],
  "total": 220
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439011",
    "orderId": 1,
    "items": [
      {
        "id": "app-1",
        "name": "Parippu Vada",
        "quantity": 2,
        "price": 10
      },
      {
        "id": "main-2",
        "name": "Chicken Biryani",
        "quantity": 1,
        "price": 200
      }
    ],
    "total": 220,
    "status": "pending",
    "timestamp": "2025-12-30T10:30:45.123Z",
    "createdAt": "2025-12-30T10:30:45.123Z",
    "updatedAt": "2025-12-30T10:30:45.123Z",
    "__v": 0
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Order must contain items"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id":"app-1","name":"Parippu Vada","quantity":2,"price":10}],
    "total": 20
  }'
```

---

### 2. Get All Orders

**Endpoint:** `GET /api/orders`

**Description:** Retrieve all orders (sorted by creation time, newest first)

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "orderId": 2,
      "items": [...],
      "total": 150,
      "status": "pending",
      "createdAt": "2025-12-30T10:35:00Z",
      "updatedAt": "2025-12-30T10:35:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "orderId": 1,
      "items": [...],
      "total": 220,
      "status": "completed",
      "createdAt": "2025-12-30T10:30:45Z",
      "updatedAt": "2025-12-30T10:31:20Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/orders
```

---

### 3. Get Orders by Status

**Endpoint:** `GET /api/orders/status/:status`

**Description:** Get all orders with a specific status

**Path Parameters:**
- `status` (string): One of `pending`, `accepted`, `preparing`, `ready`, `completed`

**Response (200 OK):**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "orderId": 2,
      "items": [...],
      "total": 150,
      "status": "pending",
      "createdAt": "2025-12-30T10:35:00Z",
      "updatedAt": "2025-12-30T10:35:00Z"
    }
  ]
}
```

**Example Requests:**
```bash
# Get all pending orders
curl http://localhost:5000/api/orders/status/pending

# Get all completed orders
curl http://localhost:5000/api/orders/status/completed

# Get all orders being prepared
curl http://localhost:5000/api/orders/status/preparing
```

---

### 4. Get Specific Order

**Endpoint:** `GET /api/orders/:orderId`

**Description:** Retrieve a single order by its ID

**Path Parameters:**
- `orderId` (number): The order ID

**Response (200 OK):**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439011",
    "orderId": 1,
    "items": [
      {
        "id": "app-1",
        "name": "Parippu Vada",
        "quantity": 2,
        "price": 10
      }
    ],
    "total": 20,
    "status": "pending",
    "timestamp": "2025-12-30T10:30:45.123Z",
    "createdAt": "2025-12-30T10:30:45.123Z",
    "updatedAt": "2025-12-30T10:30:45.123Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/orders/1
```

---

### 5. Update Order Status

**Endpoint:** `PATCH /api/orders/:orderId/status`

**Description:** Change the status of an order

**Path Parameters:**
- `orderId` (number): The order ID

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Valid Status Transitions:**
```
pending → accepted → preparing → ready → completed
```

**Response (200 OK):**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439011",
    "orderId": 1,
    "items": [...],
    "total": 20,
    "status": "accepted",
    "createdAt": "2025-12-30T10:30:45.123Z",
    "updatedAt": "2025-12-30T10:31:05.456Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid status"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:5000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'
```

**Status Flow Example:**
```bash
# Mark as accepted
curl -X PATCH http://localhost:5000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'

# Start preparing
curl -X PATCH http://localhost:5000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'

# Mark ready for pickup
curl -X PATCH http://localhost:5000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "ready"}'

# Mark completed
curl -X PATCH http://localhost:5000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

### 6. Delete Order

**Endpoint:** `DELETE /api/orders/:orderId`

**Description:** Delete/clear an order from the system

**Path Parameters:**
- `orderId` (number): The order ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order deleted"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/orders/1
```

---

## WebSocket Events Reference

### Client → Server Events

#### `requestOrders`
Request a fresh list of all orders

```javascript
socket.emit('requestOrders');
```

---

### Server → Client Events

#### `connect`
Emitted when client successfully connects to WebSocket server

```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});
```

#### `loadOrders`
Emitted when connecting or when `requestOrders` is sent. Contains all current orders.

```javascript
socket.on('loadOrders', (orders) => {
  console.log('All orders:', orders);
  // orders is an array of order objects
});
```

**Example Data:**
```javascript
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "orderId": 1,
    "items": [
      {
        "id": "app-1",
        "name": "Parippu Vada",
        "quantity": 2,
        "price": 10
      }
    ],
    "total": 20,
    "status": "pending",
    "createdAt": "2025-12-30T10:30:45Z",
    "updatedAt": "2025-12-30T10:30:45Z"
  }
]
```

#### `newOrder`
Broadcast to all connected clients when a new order is placed

```javascript
socket.on('newOrder', (newOrder) => {
  console.log('New order received:', newOrder);
  // newOrder has the same structure as individual order object
});
```

#### `orderUpdated`
Broadcast to all connected clients when an order status changes

```javascript
socket.on('orderUpdated', (updatedOrder) => {
  console.log('Order updated:', updatedOrder);
  // Contains the full updated order object with new status
});
```

#### `orderDeleted`
Broadcast to all connected clients when an order is deleted

```javascript
socket.on('orderDeleted', (data) => {
  console.log('Order deleted. ID:', data.orderId);
  // data = { orderId: 1 }
});
```

#### `disconnect`
Emitted when client disconnects from WebSocket server

```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

#### `connect_error`
Emitted when there's a connection error

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

---

## Complete JavaScript Examples

### Example 1: Place an Order from Frontend

```javascript
async function placeOrder(items, total) {
  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: items,
        total: total
      })
    });

    if (!response.ok) {
      throw new Error('Failed to place order');
    }

    const data = await response.json();
    console.log('Order placed successfully:', data.order);
    console.log('Order ID:', data.order.orderId);
    
    return data.order;
  } catch (error) {
    console.error('Error placing order:', error);
  }
}

// Usage
const items = [
  { id: 'app-1', name: 'Parippu Vada', quantity: 2, price: 10 }
];
placeOrder(items, 20);
```

### Example 2: Connect to WebSocket and Listen for Orders

```javascript
const socket = io('http://localhost:5000');

// On connection
socket.on('connect', () => {
  console.log('Connected to server');
});

// Listen for all orders when connecting
socket.on('loadOrders', (orders) => {
  console.log('Total orders:', orders.length);
  orders.forEach(order => {
    console.log(`Order #${order.orderId}: ${order.status}`);
  });
});

// Listen for new orders
socket.on('newOrder', (newOrder) => {
  console.log('🔔 New order placed!');
  console.log(`Order #${newOrder.orderId} - Total: ₹${newOrder.total}`);
});

// Listen for order updates
socket.on('orderUpdated', (order) => {
  console.log(`Order #${order.orderId} status changed to ${order.status}`);
});

// Listen for order deletions
socket.on('orderDeleted', (data) => {
  console.log(`Order #${data.orderId} has been deleted`);
});

// On disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

### Example 3: Update Order Status

```javascript
async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/orders/${orderId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update order');
    }

    const data = await response.json();
    console.log('Order updated:', data.order);
    return data.order;
  } catch (error) {
    console.error('Error updating order:', error);
  }
}

// Usage
updateOrderStatus(1, 'preparing');
```

### Example 4: Fetch Orders by Status

```javascript
async function getPendingOrders() {
  try {
    const response = await fetch('http://localhost:5000/api/orders/status/pending');
    const data = await response.json();
    
    console.log('Pending orders:', data.orders);
    console.log('Count:', data.orders.length);
    
    return data.orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

// Usage
getPendingOrders();
```

---

## Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success (GET, PATCH) | Order retrieved/updated successfully |
| 201 | Created (POST) | New order created successfully |
| 400 | Bad Request | Invalid order data or status |
| 404 | Not Found | Order with given ID doesn't exist |
| 500 | Server Error | Database connection failed |

---

## Rate Limiting (Recommended for Production)

Currently not implemented. For production, add rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Testing the API

### Using Postman

1. **Create Order**
   - Method: POST
   - URL: `http://localhost:5000/api/orders`
   - Body (JSON):
     ```json
     {
       "items": [{"id":"app-1","name":"Parippu Vada","quantity":2,"price":10}],
       "total": 20
     }
     ```

2. **Get All Orders**
   - Method: GET
   - URL: `http://localhost:5000/api/orders`

3. **Update Status**
   - Method: PATCH
   - URL: `http://localhost:5000/api/orders/1/status`
   - Body (JSON): `{"status": "accepted"}`

### Using Insomnia

Same as Postman. Both tools support WebSocket connections for testing Socket.IO.

---

## Database Schema (MongoDB)

```javascript
{
  "_id": ObjectId,
  "orderId": Number,           // Unique sequential ID
  "items": [
    {
      "id": String,           // Menu item ID
      "name": String,         // Menu item name
      "quantity": Number,     // Quantity ordered
      "price": Number         // Unit price
    }
  ],
  "total": Number,            // Total order amount
  "status": String,           // pending/accepted/preparing/ready/completed
  "timestamp": Date,          // Order creation timestamp
  "createdAt": Date,          // MongoDB creation timestamp
  "updatedAt": Date,          // Last update timestamp
  "__v": Number               // MongoDB version
}
```

---

## Error Handling

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "order": {...} or "orders": [...]
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (if available)"
}
```

---

## Performance Tips

1. **Batch Orders**: Request orders by status rather than fetching all
2. **Pagination**: For large datasets, implement pagination in `/api/orders`
3. **Caching**: Cache frequently accessed orders on client side
4. **WebSocket**: Use WebSocket for real-time updates instead of polling
5. **Indexes**: Database has indexes on `status` and `orderId` for fast queries

---

## Monitoring

### Server Logs

Check server console for:
- Order creation: `✓ Order #X created with Y items - Total: ₹Z`
- Status updates: `✓ Order #X updated to status_name`
- Deletions: `✓ Order #X deleted`
- WebSocket events: Connection/disconnection logs

### Database Monitoring

```bash
# Connect to MongoDB and check order count
mongo
> use qr-menu
> db.orders.count()
> db.orders.find().pretty()
```

---

## Versioning

Current API Version: `1.0`

Future versions will maintain backward compatibility.

---

## Contact & Support

For issues or questions, check:
1. Server console for error messages
2. Browser console for client-side errors
3. MongoDB logs for database issues
4. Network tab in browser DevTools for API requests

---

**Last Updated:** December 30, 2025  
**Version:** 1.0.0
