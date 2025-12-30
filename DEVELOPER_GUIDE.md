# Developer Guide - Extending the Global Order System

This guide helps developers understand the codebase and make custom modifications.

---

## 🏗️ Architecture Overview

### Backend Stack
- **Framework**: Express.js (Node.js)
- **Real-time**: Socket.IO
- **Database**: MongoDB
- **Runtime**: Node.js 14+

### Frontend Stack
- **Customer Page**: Vanilla JavaScript + HTML/CSS
- **Staff Dashboard**: Vanilla JavaScript + HTML/CSS
- **Real-time Client**: Socket.IO Client Library

### Communication
- **REST API**: HTTP (POST, GET, PATCH, DELETE)
- **Real-time**: WebSocket via Socket.IO

---

## 📁 File Structure & Responsibilities

### Backend Files

#### `server.js` - Main Server File
**Size**: ~400 lines  
**Responsibilities**:
- Express app initialization
- MongoDB connection
- API route handlers
- WebSocket server setup
- In-memory fallback storage

**Key Sections**:
```javascript
// Line 1-50: Imports and middleware
// Line 50-100: MongoDB schema definition
// Line 100-200: API endpoint handlers
// Line 200-300: WebSocket event handlers
// Line 300+: Server startup and graceful shutdown
```

**Modification Tips**:
- Add new API routes before line 200
- Add new WebSocket events before line 300
- Database schema changes: modify orderSchema
- Error handling: wraps in try-catch

#### `package.json` - Dependencies
**Current Dependencies**:
- `express` - Web framework
- `socket.io` - Real-time communication
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin support
- `dotenv` - Environment variables

**Adding Dependencies**:
```bash
npm install package-name
npm install --save-dev package-name  # Dev dependencies
```

#### `.env` - Configuration
**Environment Variables**:
```env
NODE_ENV        # development or production
PORT            # Server port (default 5000)
MONGODB_URI     # Database connection string
CLIENT_URL      # Frontend origin (for CORS)
```

**How to Use**:
```javascript
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;
```

### Frontend Files

#### `components/js/script.js` - Customer Page
**Size**: ~512 lines  
**Key Functions**:
- `placeOrder()` - Send order to backend
- Menu rendering and cart management
- Staff login handling
- Toast notifications

**Key Changes Made**:
```javascript
// Line 421: placeOrder() function completely rewritten
// Now sends to API instead of localStorage
const API_BASE_URL = 'http://localhost:5000';
```

#### `components/js/staff-dashboard.js` - Staff Dashboard
**Size**: ~500 lines  
**Key Functions**:
- `initializeDashboard()` - Load and connect
- `loadOrdersFromAPI()` - Fetch from backend
- `connectWebSocket()` - Establish real-time connection
- `updateOrderStatus()` - Change status via API
- `deleteOrder()` - Remove order from system

**Architecture**:
- Fully rewritten for backend integration
- WebSocket auto-reconnection
- Real-time UI updates
- Notification system

#### `staff-dashboard.html`
**Key Addition**:
```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
```
Loads Socket.IO client library before dashboard script.

---

## 🔌 API Development

### Adding a New Endpoint

**Step 1: Define Endpoint**
```javascript
// In server.js, before line 200
app.get('/api/custom', async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true, data: ... });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

**Step 2: Test with cURL**
```bash
curl http://localhost:5000/api/custom
```

**Step 3: Use in Frontend**
```javascript
const response = await fetch('http://localhost:5000/api/custom');
const data = await response.json();
```

### Modifying Order Schema

**Current Schema** (in server.js, ~line 50):
```javascript
const orderSchema = new mongoose.Schema({
  orderId: Number,
  items: Array,
  total: Number,
  status: String,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
});
```

**To Add a Field**:
```javascript
const orderSchema = new mongoose.Schema({
  // ... existing fields
  customerName: String,      // NEW FIELD
  customerPhone: String,     // NEW FIELD
  deliveryAddress: String,   // NEW FIELD
  // ...
}, { timestamps: true });
```

**Update corresponding API calls**:
```javascript
// In POST /api/orders endpoint
const newOrder = {
  orderId,
  items,
  total,
  customerName,    // Add to request body
  customerPhone,   // Add to request body
  deliveryAddress, // Add to request body
  // ...
};
```

---

## 🔌 WebSocket Development

### Adding a New Event

**Server Side** (server.js, ~line 200):
```javascript
io.on('connection', (socket) => {
  // NEW EVENT
  socket.on('customEvent', (data) => {
    console.log('Received:', data);
    // Broadcast to all
    io.emit('customEventResponse', { message: 'success' });
  });
});
```

**Client Side** (staff-dashboard.js):
```javascript
// Emit event
socket.emit('customEvent', { data: 'value' });

// Listen for response
socket.on('customEventResponse', (data) => {
  console.log('Response:', data);
});
```

### Broadcast to All Connected Clients

```javascript
// After making changes
io.emit('eventName', changedData);

// Only to sender
socket.emit('eventName', changedData);

// To all except sender
socket.broadcast.emit('eventName', changedData);
```

---

## 🎨 Frontend Modification Patterns

### Add a New Status

**1. Update backend** (server.js):
```javascript
const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'NEW_STATUS'];
```

**2. Update status flow** (staff-dashboard.js):
```javascript
function getNextStatus(currentStatus) {
  const statusFlow = {
    'pending': 'accepted',
    'accepted': 'preparing',
    'preparing': 'ready',
    'ready': 'completed',
    'NEW_STATUS': null  // Add here
  };
  return statusFlow[currentStatus] || null;
}
```

**3. Update CSS** (components/css/staff-style.css):
```css
.status-new_status {
  background-color: #some-color;
  color: white;
}
```

### Add a New API Call

**Pattern**:
```javascript
async function myNewFunction(param) {
  try {
    const response = await fetch(`http://localhost:5000/api/endpoint`, {
      method: 'POST', // or GET, PATCH, DELETE
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ /* data */ })
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const data = await response.json();
    console.log('Success:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
    showNotification(`Error: ${error.message}`, 'error');
  }
}
```

---

## 🧪 Testing Your Changes

### Unit Testing (Manual)

**Test an Endpoint**:
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"test","name":"Test","quantity":1,"price":10}],"total":10}'
```

**Check Response**:
- Should return 201 with order data
- Check server console for log message

### Integration Testing

**1. Start Server**:
```bash
npm run dev
```

**2. Open 2 Browser Tabs**:
- Tab 1: Customer page
- Tab 2: Staff dashboard

**3. Place Order**:
- Should appear on dashboard instantly
- Both tabs should sync

**4. Update Status**:
- Change on one dashboard
- Other dashboard should update without refresh

---

## 🔍 Debugging Tips

### Enable Verbose Logging

Add to server.js:
```javascript
// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Monitor Database Operations

```javascript
// Before mongoose.connect()
mongoose.connection.on('connected', () => {
  console.log('✓ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('✗ MongoDB error:', err);
});
```

### Debug WebSocket

```javascript
// In establishWebSocketConnection()
socket.on('connect', () => {
  console.log('WebSocket connected:', socket.id);
});

socket.onAny((event, ...args) => {
  console.log('WebSocket event:', event, args);
});
```

### Browser DevTools

1. **Console Tab**: JavaScript errors and logs
2. **Network Tab**: API requests/responses
3. **Application Tab**: localStorage, cookies, cache
4. **WebSocket**: Filter network by "WS" to see real-time events

---

## 🚀 Performance Optimization

### Database Indexing

Add to MongoDB schema:
```javascript
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ customerId: 1 });
```

Query with index:
```javascript
// Fast (uses index)
await Order.find({ status: 'pending' }).sort({ createdAt: -1 });

// Slow (no index)
await Order.find({ someRandomField: value });
```

### Pagination for Large Results

```javascript
app.get('/api/orders', async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({ orders, page, limit, total: await Order.countDocuments() });
});
```

### WebSocket Broadcasting Optimization

```javascript
// Broadcast only changed data (not all orders)
io.emit('orderUpdated', { orderId: 1, status: 'new_status' });

// Instead of
io.emit('loadOrders', allOrders); // Large payload
```

---

## 📝 Code Style Guidelines

### Naming Conventions

```javascript
// Variables and functions: camelCase
const orderCount = 10;
function processOrder() { }

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://...';
const MAX_ORDERS = 1000;

// Classes: PascalCase
class OrderManager { }

// CSS Classes: kebab-case
<div class="order-card"></div>
```

### Comments and Documentation

```javascript
/**
 * Process an order and save to database
 * @param {Array} items - Order items
 * @param {Number} total - Total amount
 * @returns {Object} Created order object
 */
function placeOrder(items, total) {
  // Implementation
}
```

### Error Messages

```javascript
// Good: Clear, actionable
showNotification('Order #123 updated to preparing', 'success');

// Bad: Vague
showNotification('Order processed', 'info');
```

---

## 🔐 Security Best Practices

### Input Validation

```javascript
// Always validate input
app.post('/api/orders', async (req, res) => {
  const { items, total } = req.body;

  // Validate
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false });
  }
  if (typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ success: false });
  }

  // Process...
});
```

### Prevent SQL Injection

✅ **Good** (MongoDB/Mongoose handles escaping):
```javascript
await Order.find({ orderId: parseInt(orderId) });
```

❌ **Bad** (Don't concatenate):
```javascript
// Don't do this with SQL
db.query(`SELECT * FROM orders WHERE id = ${orderId}`);
```

### CORS Security

```javascript
// Current: Open CORS
app.use(cors());

// Recommended for production
const allowedOrigins = ['https://yourdomain.com'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

---

## 🎯 Common Modifications

### Change Order Status Names

1. **Update backend** (server.js):
```javascript
const validStatuses = ['new_status_1', 'new_status_2', ...];
```

2. **Update frontend** (staff-dashboard.js):
```javascript
function getNextStatus(currentStatus) {
  const statusFlow = {
    'new_status_1': 'new_status_2',
    // ...
  };
  return statusFlow[currentStatus];
}
```

3. **Update CSS** (staff-style.css):
```css
.status-new_status_1 { background: #color; }
```

### Add Authentication

```javascript
// Install: npm install jsonwebtoken

const jwt = require('jsonwebtoken');

app.post('/api/login', (req, res) => {
  const token = jwt.sign({ userId: 1 }, 'secret_key');
  res.json({ token });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ success: false });
    req.user = decoded;
    next();
  });
};

// Protect routes
app.get('/api/orders', verifyToken, async (req, res) => {
  // ...
});
```

### Add Order Filtering

```javascript
// By date range
app.get('/api/orders/range', async (req, res) => {
  const { startDate, endDate } = req.query;
  const orders = await Order.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });
  res.json({ orders });
});

// By multiple criteria
app.get('/api/orders/filter', async (req, res) => {
  const { status, customerId, minTotal, maxTotal } = req.query;
  const query = {};
  if (status) query.status = status;
  if (customerId) query.customerId = customerId;
  if (minTotal || maxTotal) {
    query.total = {};
    if (minTotal) query.total.$gte = minTotal;
    if (maxTotal) query.total.$lte = maxTotal;
  }
  
  const orders = await Order.find(query);
  res.json({ orders });
});
```

---

## 📚 Useful Resources

### Express.js
- [Express Docs](https://expressjs.com/)
- [Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)

### MongoDB/Mongoose
- [Mongoose Docs](https://mongoosejs.com/)
- [Query Methods](https://mongoosejs.com/docs/api/query.html)

### Socket.IO
- [Socket.IO Docs](https://socket.io/docs/)
- [Event Emitter](https://socket.io/docs/v4/socket-io-protocol/)

### Node.js
- [Node.js Docs](https://nodejs.org/docs/)
- [Event Emitter](https://nodejs.org/api/events.html)

---

## 🚀 Deployment Considerations

### Environment-specific Code

```javascript
if (process.env.NODE_ENV === 'production') {
  // Production logic
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
} else {
  // Development logic
  app.use(morgan('dev'));
}
```

### Database Migrations

```javascript
// After schema changes
async function migrateDatabase() {
  // Update existing documents
  await Order.updateMany({}, { $set: { newField: defaultValue } });
}

// Call on startup
migrateDatabase().catch(console.error);
```

---

## 💡 Tips & Tricks

### Quick Restart During Development
```bash
npm run dev  # Auto-restarts on file changes
```

### View MongoDB Data
```bash
mongo
> use qr-menu
> db.orders.find().pretty()
> db.orders.countDocuments()
> db.orders.deleteMany({})
```

### Monitor Real-time Updates
```javascript
// Add to socket event handlers
socket.on('newOrder', (order) => {
  console.group('🔔 New Order');
  console.log('Order ID:', order.orderId);
  console.log('Status:', order.status);
  console.log('Total:', order.total);
  console.groupEnd();
});
```

---

## 📞 Debugging Workflow

1. **Identify Issue** → Check error message
2. **Isolate Problem** → Browser console vs server console
3. **Add Logging** → Use `console.log()` or `console.table()`
4. **Test Endpoint** → Use `curl` or Postman
5. **Check Database** → Verify data in MongoDB
6. **Verify WebSocket** → Check network tab for events
7. **Review Code** → Look for logical errors
8. **Restart** → Kill and restart server: `npm run dev`

---

## 📋 Checklist for New Features

- [ ] Update backend API endpoint
- [ ] Add WebSocket event (if real-time needed)
- [ ] Update MongoDB schema (if new fields)
- [ ] Add input validation
- [ ] Update frontend API call
- [ ] Update UI rendering
- [ ] Add error handling
- [ ] Test with multiple devices
- [ ] Check browser console
- [ ] Check server console
- [ ] Document changes in code comments
- [ ] Update README if needed

---

## 🎓 Learning Path

**Beginner**:
1. Understand API endpoints (CRUD operations)
2. Learn WebSocket events
3. Modify CSS styling

**Intermediate**:
1. Add new API endpoints
2. Modify database schema
3. Implement new features

**Advanced**:
1. Optimize database queries
2. Implement authentication
3. Scale to multiple servers
4. Add monitoring/logging

---

**Happy developing! 🚀**

For specific questions, check the documentation or the inline code comments.
