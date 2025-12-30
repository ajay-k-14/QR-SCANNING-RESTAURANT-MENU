// Staff Dashboard JavaScript - Global Real-time Order Management System

// Configuration - works for both localhost and deployed servers
const API_BASE_URL = window.location.origin;
const WS_URL = window.location.origin;

// Global state
let allOrders = [];
let socket = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if logged in
    const staffSession = localStorage.getItem('staffSession');
    if (!staffSession) {
        window.location.href = 'staff-login.html';
        return;
    }

    const session = JSON.parse(staffSession);
    document.getElementById('staffName').textContent = `Welcome, ${session.username}`;

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('staffSession');
        if (socket) {
            socket.disconnect();
        }
        window.location.href = 'staff-login.html';
    });

    // Initialize dashboard
    initializeDashboard();
});

/**
 * Initialize the dashboard with API and WebSocket connections
 */
async function initializeDashboard() {
    try {
        // Load initial orders from API
        await loadOrdersFromAPI();

        // Connect to WebSocket for real-time updates
        connectWebSocket();

        console.log('✓ Dashboard initialized');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showNotification('Failed to connect to server. Retrying...', 'error');

        // Retry after 3 seconds
        setTimeout(initializeDashboard, 3000);
    }
}

/**
 * Load orders from the backend API
 */
async function loadOrdersFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        allOrders = data.orders || [];

        // Update UI
        updateStats(allOrders);
        renderActiveOrders(allOrders);
        renderCompletedOrders(allOrders);

        console.log(`✓ Loaded ${allOrders.length} orders from API`);
    } catch (error) {
        console.error('Error loading orders from API:', error);
        throw error;
    }
}

/**
 * Connect to WebSocket server for real-time updates
 */
function connectWebSocket() {
    // Check if Socket.IO is available
    if (typeof io === 'undefined') {
        console.warn('Socket.IO not loaded. Loading from CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
        script.onload = () => {
            establishWebSocketConnection();
        };
        document.head.appendChild(script);
    } else {
        establishWebSocketConnection();
    }
}

/**
 * Establish WebSocket connection
 */
function establishWebSocketConnection() {
    try {
        socket = io(WS_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        // Connection established
        socket.on('connect', () => {
            console.log('✓ WebSocket connected:', socket.id);
            showNotification('Connected to server', 'success');
        });

        // Load initial orders when first connecting
        socket.on('loadOrders', (orders) => {
            console.log('✓ Received initial orders via WebSocket');
            allOrders = orders;
            updateStats(allOrders);
            renderActiveOrders(allOrders);
            renderCompletedOrders(allOrders);
        });

        // New order event
        socket.on('newOrder', (newOrder) => {
            console.log('✓ New order received:', newOrder);
            allOrders.push(newOrder);
            updateStats(allOrders);
            renderActiveOrders(allOrders);
            showNotification(`New Order #${newOrder.orderId}! 🔔`, 'info');
            playOrderSound();
        });

        // Order updated event
        socket.on('orderUpdated', (updatedOrder) => {
            console.log('✓ Order updated:', updatedOrder);
            const index = allOrders.findIndex(o => o.orderId === updatedOrder.orderId);
            if (index !== -1) {
                allOrders[index] = updatedOrder;
                updateStats(allOrders);
                renderActiveOrders(allOrders);
                renderCompletedOrders(allOrders);
                showNotification(`Order #${updatedOrder.orderId} updated to ${updatedOrder.status}`, 'info');
            }
        });

        // Order deleted event
        socket.on('orderDeleted', (deletedOrder) => {
            console.log('✓ Order deleted:', deletedOrder);
            allOrders = allOrders.filter(o => o.orderId !== deletedOrder.orderId);
            updateStats(allOrders);
            renderActiveOrders(allOrders);
            renderCompletedOrders(allOrders);
        });

        // Disconnection
        socket.on('disconnect', () => {
            console.warn('✗ WebSocket disconnected');
            showNotification('Disconnected from server. Reconnecting...', 'warning');
        });

        // Connection error
        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

    } catch (error) {
        console.error('Error establishing WebSocket connection:', error);
        showNotification('Failed to connect to real-time updates', 'error');
    }
}

/**
 * Update dashboard statistics
 */
function updateStats(orders) {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => ['accepted', 'preparing'].includes(o.status)).length;
    const completed = orders.filter(o => o.status === 'completed').length;

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('preparingOrders').textContent = preparing;
    document.getElementById('completedOrders').textContent = completed;
}

/**
 * Render active orders (pending, accepted, preparing, ready)
 */
function renderActiveOrders(orders) {
    const container = document.getElementById('activeOrders');
    const activeOrders = orders.filter(o => o.status !== 'completed').sort((a, b) => {
        // Sort by creation time, newest first
        return new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp);
    });

    if (activeOrders.length === 0) {
        container.innerHTML = '<p class="no-orders">No active orders</p>';
        return;
    }

    container.innerHTML = activeOrders.map(order => createOrderCard(order, true)).join('');

    // Add event listeners
    container.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateOrderStatus(this.dataset.orderId);
        });
    });

    container.querySelectorAll('.delete-order-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteOrder(this.dataset.orderId);
        });
    });
}

/**
 * Render completed orders
 */
function renderCompletedOrders(orders) {
    const container = document.getElementById('completedOrdersList');
    const completedOrders = orders.filter(o => o.status === 'completed').sort((a, b) => {
        // Sort by update time, most recent first
        return new Date(b.updatedAt || b.timestamp) - new Date(a.updatedAt || a.timestamp);
    });

    if (completedOrders.length === 0) {
        container.innerHTML = '<p class="no-orders">No completed orders</p>';
        return;
    }

    container.innerHTML = completedOrders.map(order => createOrderCard(order, false)).join('');

    // Add event listeners for deletion
    container.querySelectorAll('.delete-order-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteOrder(this.dataset.orderId);
        });
    });
}

/**
 * Create HTML for an order card
 */
function createOrderCard(order, showActionButton = true) {
    const timestamp = order.updatedAt || order.timestamp || order.createdAt;
    const time = new Date(timestamp).toLocaleString();
    const statusClass = `status-${order.status.toLowerCase()}`;
    const nextStatus = getNextStatus(order.status);

    const itemsHtml = order.items.map(item => `
        <div class="order-item">
            <span>${item.quantity}x ${item.name}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    // Determine what button to show
    let actionButtonHtml = '';
    if (showActionButton && nextStatus) {
        const buttonLabel = {
            'accepted': 'Start Preparing',
            'preparing': 'Ready for Pickup',
            'ready': 'Mark Completed'
        }[nextStatus] || `Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`;

        actionButtonHtml = `
            <button class="update-status-btn" data-order-id="${order.orderId}">
                ${buttonLabel}
            </button>
        `;
    }

    const deleteButtonHtml = `
        <button class="delete-order-btn" data-order-id="${order.orderId}">
            ${order.status === 'completed' ? 'Clear Order' : 'Cancel'}
        </button>
    `;

    return `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Order #${order.orderId}</span>
                <span class="order-status ${statusClass}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-time">${time}</div>
            <div class="order-items">${itemsHtml}</div>
            <div class="order-total">
                <span>Total</span>
                <span>₹${order.total.toFixed(2)}</span>
            </div>
            <div class="order-actions">
                ${actionButtonHtml}
                ${deleteButtonHtml}
            </div>
        </div>
    `;
}

/**
 * Get the next status in the order workflow
 */
function getNextStatus(currentStatus) {
    const statusFlow = {
        'pending': 'accepted',
        'accepted': 'preparing',
        'preparing': 'ready',
        'ready': 'completed',
        'completed': null
    };
    return statusFlow[currentStatus] || null;
}

/**
 * Update order status via API
 */
async function updateOrderStatus(orderId) {
    const order = allOrders.find(o => o.orderId === parseInt(orderId));
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }

    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) {
        showNotification('Order cannot be progressed further', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: nextStatus })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update order');
        }

        const data = await response.json();
        console.log('✓ Order updated:', data.order);
        showNotification(`Order #${orderId} marked as ${nextStatus}`, 'success');

        // Update local state and UI
        const index = allOrders.findIndex(o => o.orderId === parseInt(orderId));
        if (index !== -1) {
            allOrders[index] = data.order;
            updateStats(allOrders);
            renderActiveOrders(allOrders);
            renderCompletedOrders(allOrders);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

/**
 * Delete/clear an order via API
 */
async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete order');
        }

        console.log('✓ Order deleted');
        showNotification(`Order #${orderId} deleted`, 'success');

        // Update local state and UI
        allOrders = allOrders.filter(o => o.orderId !== parseInt(orderId));
        updateStats(allOrders);
        renderActiveOrders(allOrders);
        renderCompletedOrders(allOrders);
    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    const bgColor = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196f3'
    }[type] || '#2196f3';

    notification.style.cssText = `
        background-color: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

/**
 * Play a notification sound when new order arrives
 */
function playOrderSound() {
    // Use Web Audio API to play a simple beep
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.warn('Could not play notification sound:', error);
    }
}

// Add CSS animations for notifications
if (!document.getElementById('dashboardStyles')) {
    const style = document.createElement('style');
    style.id = 'dashboardStyles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
