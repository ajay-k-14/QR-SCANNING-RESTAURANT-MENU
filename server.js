import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Socket.IO configuration with CORS - works for localhost and global access
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for self-hosted global access
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-menu')
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    // Continue running without DB if connection fails (fallback to in-memory storage)
  });

// Order Schema and Model
const orderSchema = new mongoose.Schema({
  orderId: {
    type: Number,
    required: true,
    unique: true
  },
  items: [{
    id: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for better query performance
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });

const Order = mongoose.model('Order', orderSchema);

// In-memory fallback storage (if MongoDB is unavailable)
let orders = [];
let nextOrderId = 1;

// Function to get next order ID
async function getNextOrderId() {
  try {
    if (mongoose.connection.readyState === 1) { // Connected
      const lastOrder = await Order.findOne().sort({ orderId: -1 });
      return lastOrder ? lastOrder.orderId + 1 : 1;
    }
  } catch (err) {
    console.error('Error fetching last order ID:', err);
  }
  return nextOrderId++;
}

// ============ API Routes ============

// GET all orders
app.get('/api/orders', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) { // Connected
      const allOrders = await Order.find().sort({ createdAt: -1 });
      res.json({ success: true, orders: allOrders });
    } else {
      res.json({ success: true, orders: orders.sort((a, b) => b.timestamp - a.timestamp) });
    }
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, message: 'Error fetching orders', error: err.message });
  }
});

// GET orders by status
app.get('/api/orders/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    if (mongoose.connection.readyState === 1) { // Connected
      const filteredOrders = await Order.find({ status }).sort({ createdAt: -1 });
      res.json({ success: true, orders: filteredOrders });
    } else {
      const filteredOrders = orders.filter(o => o.status === status).sort((a, b) => b.timestamp - a.timestamp);
      res.json({ success: true, orders: filteredOrders });
    }
  } catch (err) {
    console.error('Error fetching orders by status:', err);
    res.status(500).json({ success: false, message: 'Error fetching orders', error: err.message });
  }
});

// GET specific order
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (mongoose.connection.readyState === 1) { // Connected
      const order = await Order.findOne({ orderId: parseInt(orderId) });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, order });
    } else {
      const order = orders.find(o => o.orderId === parseInt(orderId));
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, order });
    }
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ success: false, message: 'Error fetching order', error: err.message });
  }
});

// POST create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { items, total } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain items' });
    }
    if (!total || total <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order total' });
    }

    const orderId = await getNextOrderId();
    const newOrder = {
      orderId,
      items,
      total,
      status: 'pending',
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database if connected
    if (mongoose.connection.readyState === 1) {
      const order = new Order(newOrder);
      const savedOrder = await order.save();
      
      // Broadcast to all connected staff via WebSocket
      io.emit('newOrder', savedOrder);
      
      res.status(201).json({ success: true, order: savedOrder });
    } else {
      // Fallback to in-memory storage
      orders.push(newOrder);
      
      // Broadcast to all connected staff via WebSocket
      io.emit('newOrder', newOrder);
      
      res.status(201).json({ success: true, order: newOrder });
    }

    console.log(`✓ Order #${orderId} created with ${items.length} items - Total: ₹${total}`);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, message: 'Error creating order', error: err.message });
  }
});

// PATCH update order status
app.patch('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (mongoose.connection.readyState === 1) { // Connected
      const order = await Order.findOneAndUpdate(
        { orderId: parseInt(orderId) },
        { status, updatedAt: new Date() },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Broadcast updated order to all connected staff
      io.emit('orderUpdated', order);

      res.json({ success: true, order });
    } else {
      const order = orders.find(o => o.orderId === parseInt(orderId));
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.status = status;
      order.updatedAt = new Date();

      // Broadcast updated order to all connected staff
      io.emit('orderUpdated', order);

      res.json({ success: true, order });
    }

    console.log(`✓ Order #${orderId} updated to ${status}`);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ success: false, message: 'Error updating order', error: err.message });
  }
});

// DELETE order
app.delete('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (mongoose.connection.readyState === 1) { // Connected
      const order = await Order.findOneAndDelete({ orderId: parseInt(orderId) });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Broadcast deletion to all connected staff
      io.emit('orderDeleted', { orderId: parseInt(orderId) });

      res.json({ success: true, message: 'Order deleted' });
    } else {
      const index = orders.findIndex(o => o.orderId === parseInt(orderId));
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      orders.splice(index, 1);

      // Broadcast deletion to all connected staff
      io.emit('orderDeleted', { orderId: parseInt(orderId) });

      res.json({ success: true, message: 'Order deleted' });
    }

    console.log(`✓ Order #${orderId} deleted`);
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ success: false, message: 'Error deleting order', error: err.message });
  }
});

// ============ WebSocket Events ============

io.on('connection', (socket) => {
  console.log(`✓ Staff connected: ${socket.id}`);

  // When a staff member connects, send all current orders
  (async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        const allOrders = await Order.find().sort({ createdAt: -1 });
        socket.emit('loadOrders', allOrders);
      } else {
        socket.emit('loadOrders', orders.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (err) {
      console.error('Error sending initial orders:', err);
    }
  })();

  socket.on('disconnect', () => {
    console.log(`✗ Staff disconnected: ${socket.id}`);
  });

  socket.on('requestOrders', async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        const allOrders = await Order.find().sort({ createdAt: -1 });
        socket.emit('loadOrders', allOrders);
      } else {
        socket.emit('loadOrders', orders.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (err) {
      console.error('Error sending orders:', err);
    }
  });
});

// ============ Server Startup ============

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  QR Menu Restaurant - Backend Server   ║`);
  console.log(`║  🚀 Running on port ${PORT}               ║`);
  console.log(`║  📍 http://localhost:${PORT}              ║`);
  console.log(`║  🌐 http://YOUR_IP:${PORT}                ║`);
  console.log(`║  🌍 http://YOUR_DOMAIN:${PORT}            ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nGracefully shutting down...');
  httpServer.close(() => {
    console.log('Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});
