// Staff Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if logged in
    const staffSession = localStorage.getItem('staffSession');
    if (!staffSession) {
        window.location.href = 'staff-login.html';
        return;
    }
    
    const session = JSON.parse(staffSession);
    
    // Display staff name
    document.getElementById('staffName').textContent = `Welcome, ${session.username}`;
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('staffSession');
        window.location.href = 'staff-login.html';
    });
    
    // Load orders from localStorage
    loadOrders();
    
    // Check for new orders every 1 second for real-time updates
    setInterval(loadOrders, 1000);
});

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    updateStats(orders);
    renderActiveOrders(orders);
    renderCompletedOrders(orders);
}

function updateStats(orders) {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing' || o.status === 'ready').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    
    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('preparingOrders').textContent = preparing;
    document.getElementById('completedOrders').textContent = completed;
}

function renderActiveOrders(orders) {
    const container = document.getElementById('activeOrders');
    const activeOrders = orders.filter(o => o.status !== 'completed');
    
    if (activeOrders.length === 0) {
        container.innerHTML = '<p class="no-orders">No active orders</p>';
        return;
    }
    
    container.innerHTML = activeOrders.map(order => createOrderCard(order)).join('');
    
    // Add event listeners to update buttons
    container.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateOrderStatus(this.dataset.orderId);
        });
    });
}

function renderCompletedOrders(orders) {
    const container = document.getElementById('completedOrdersList');
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    if (completedOrders.length === 0) {
        container.innerHTML = '<p class="no-orders">No completed orders</p>';
        return;
    }
    
    container.innerHTML = completedOrders.map(order => createOrderCard(order, false)).join('');
}

function createOrderCard(order, showButton = true) {
    const time = new Date(order.time).toLocaleString();
    const statusClass = `status-${order.status}`;
    const nextStatus = getNextStatus(order.status);
    
    const itemsHtml = order.items.map(item => `
        <div class="order-item">
            <span>${item.quantity}x ${item.name}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    const buttonHtml = showButton && nextStatus ? `
        <button class="update-status-btn" onclick="updateOrderStatus(${order.id})">
            Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
        </button>
    ` : '';
    
    const deleteButtonHtml = order.status === 'completed' ? `
        <button class="delete-order-btn" onclick="deleteOrder(${order.id})">
            Clear Order
        </button>
    ` : '';
    
    return `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Order #${order.id}</span>
                <span class="order-status ${statusClass}">${order.status}</span>
            </div>
            <div class="order-time">${time}</div>
            <div class="order-items">${itemsHtml}</div>
            <div class="order-total">
                <span>Total</span>
                <span>₹${order.total.toFixed(2)}</span>
            </div>
            <div class="order-actions">
                ${buttonHtml}
                ${deleteButtonHtml}
            </div>
        </div>
    `;
}

function getNextStatus(currentStatus) {
    const statusFlow = {
        'pending': 'preparing',
        'preparing': 'ready',
        'ready': 'completed'
    };
    return statusFlow[currentStatus] || null;
}

function updateOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        const nextStatus = getNextStatus(orders[orderIndex].status);
        if (nextStatus) {
            orders[orderIndex].status = nextStatus;
            localStorage.setItem('orders', JSON.stringify(orders));
            loadOrders(); // Refresh the display
        }
    }
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to clear this completed order?')) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const filteredOrders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(filteredOrders));
        loadOrders(); // Refresh the display
    }
}
