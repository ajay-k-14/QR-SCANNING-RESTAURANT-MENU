// Staff Login State
let isStaffLoggedIn = false;
let currentStaff = null;

function showStaffLogin() {
    hideModals();
    document.getElementById('staff-login-modal').style.display = 'block';
}

function handleStaffLogin(event) {
    event.preventDefault();
    const username = document.getElementById('staff-username').value;
    const password = document.getElementById('staff-password').value;
    const errorDiv = document.getElementById('error');
    if (username === 'staff' && password === '123') {
        isStaffLoggedIn = true;
        currentStaff = { username };

        document.getElementById('staff-username').value = '';
        document.getElementById('staff-password').value = '';
        document.getElementById('login-error').style.display = 'none';
        hideModals();
        showStaffDashboard();
        // document.getElementById(dashboard).style.display='block';
        // Optionally show dashboard or success message here
    } else {
        errorDiv.textContent = 'Invalid credentials.';
        errorDiv.style.display = 'block';
    }
}

function hideModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}
// Menu Data 
const menuItems = [
    // Appetizers
    {
    id: "app-1", 
    name: "parippu Vada",
    description: "crispy lentin fitters spiced with ginger,curry leaves,and green chillies.", 
    price: 10, 
    category: "appetizers", 
    isVegetarian: true
    },

    {
    id: "app-2", 
    name: "Pazham Pori",
    description: "Ripe banana slices dipped in flour batter and deep-fried till golden.", 
    price: 15, 
    category: "appetizers", 
    isVegetarian: true
    },

    {
    id: "app-3", 
    name: "Prawn Fry",
    description: "Shallow fried prawns marinated with chilli,turmeric,and garlic.", 
    price: 100, 
    category: "appetizers", isNonVegetarian: true
    },

    {
    id: "app-4", 
    name: "Ulli Vada",
    description: "Crispy fitters made from sliced onions,gram flour,and chilli.", 
    price: 20, 
    category: "appetizers", isVegetarian: true
    },

    //Main Course

    {
    id: "main-1", 
    name: "Kerala Sadhya",
    description: "Traditional vegeterian feast served on a banana leaf with rice and 10+ side dishes", 
    price: 150, 
    category: "main course", isVegetarian: true
    },

    {
    id: "main-2", 
    name: "Chicken Biriyani",
    description: "Fragrant rice cooked with spicied chicken and fried onion in a delicacy", 
    price: 200, 
    category: "main course", 
    isNonVegetarian: true,
    isSpicy:true
    },

    {
    id: "main-3", 
    name: "Spicy Chicken Curry",
    description: "Home-style chicken curry with cocunut and aromatic spices.", 
    price: 80, 
    category: "main course", 
    isNonVegetarian: true,
    isSpicy:true
    },

    {
    id: "main-4", 
    name: "Appam With Stew",
    description: "soft hoppers served with a creamy coconut-milk based vegitable or meat stew.", 
    price: 150,  
    category: "main course", 
    isVegetarian: true, 
    isNonVegetarian:true
    },

    //Desserts

    {
    id: "des-1", 
    name: "Chocolate Lava Cake",
    description: "Warm chocalate cake with molten center,vanilla ice cream,and berry compote", 
    price: 70, 
    category: "desserts", 
    isVegetarian: true
    },

    {
    id: "des-2", 
    name: "Palada Payasam",
    description: "Creamy rice flakes pudding made with milk and sugar.", 
    price: 70, 
    category: "desserts", 
    isVegetarian: true
    },

    //Beverages

    {
    id: "bev-1", 
    name: "Tea",
    description: "Traditional milk and black tea,strong and energizing", 
    price: 10, 
    category: "beverages", 
    isVegetarian: true
    },

    {
    id: "bev-2", 
    name: "Fresh Juices",
    description: "Freshly squeezed juices", 
    price: 20, 
    category: "beverages", 
    isVegetarian: true
    },
]

// Cart State

let cart = {};

// DOM Elements

const cartBadge = document.getElementById('cartBadge'); 
const cartOverlay = document.getElementById('cartOverlay'); 
const cartSidebar = document.getElementById('cartSidebar'); 
const cartContent = document.getElementById('cartContent'); 
const cartItems = document.getElementById('cartItems'); 
const cartFooter = document.getElementById('cartFooter'); 
const cartTotal = document.getElementById('cartTotal'); 
const emptyCart = document.getElementById('emptyCart'); 
const toast = document.getElementById('toast'); 
const toastMessage = document.getElementById('toastMessage'); 
const qrModal = document.getElementById('qrModal');

// Initialize the application

document.addEventListener('DOMContentLoaded', function() {

    // Initialize Lucide icons 

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Render menu 

    renderMenu();

    // Update cart display 

    updateCartDisplay();
});

// Menu Rendering

function renderMenu() {
    const container = document.getElementById('menuContainer'); 
    const categories = [...new Set(menuItems.map(item => item.category))];
    container.innerHTML = categories.map(category => {
    const categoryItems = menuItems.filter(item => item.category === category); 
    return `
        <div class="category-section">
            <h3 class="category-title">${category}</h3>
            <div class="menu-grid">
                ${categoryItems.map(item => renderMenuItem(item)).join('')} 
            </div>
        </div>
        `;
    }).join('');
    // Re-initialize Lucide icons for dynamically added content 
    if (typeof lucide !== 'undefined') { 
        lucide.createIcons();
    }
}

function renderMenuItem(item) {
    const quantity = cart[item.id] || 0;
    return `
    <div class="menu-item">
        <div class="item-header">
            <div class="item-title-row">
                <h4 class="item-name">${item.name}</h4>
                <div class="item-badges">
                    ${item.isVegetarian ? '<span class="badge badge-veg">🌱 Veg</span>' : ''} 
                    ${item.isNonVegetarian ? '<span class="badge badge-veg">🍗NonVeg</span>' : ''}
                    ${item.isSpicy ? '<span class="badge badge-spicy">🌶 	Spicy</span>' : ''} 
                </div>
            </div>
        <p class="item-description">${item.description}</p>
        </div>
        <div class="item-content">
            <div class="item-price">₹${item.price.toFixed(2)}
            </div>
        </div>
    <div class="item-footer">
        <div class="quantity-controls">
            ${quantity > 0 ? `
            <button class="btn btn-outline quantity-btn"onclick="removeFromCart('${item.id}')">
            <i data-lucide="minus"></i>
            </button>
            <span class="quantity-display">${quantity}</span>
            ` : ''}
            <button class="btn btn-default add-btn" onclick="addToCart('${item.id}')">
                <i data-lucide="plus"></i>
                ${quantity > 0 ? 'Add More' : 'Add to Cart'}
            </button>
        </div>
    </div>
</div>
`;
}

// Cart Functions 
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId); 
    if (!item) return;
    cart[itemId] = (cart[itemId] || 0) + 1;
    showToast(`${item.name} has been added to your cart`); 
    updateCartDisplay();
    renderMenu(); // Re-render to update quantities
}

function removeFromCart(itemId) {
    if (cart[itemId]) {
        cart[itemId] -= 1; 
    if (cart[itemId] === 0) {
        delete cart[itemId];
    }
    updateCartDisplay();
    renderMenu(); // Re-render to update quantities
    }
}

function clearCart() {
    cart = {};
    showToast('Cart cleared - All items have been removed'); 
    updateCartDisplay();
    renderMenu(); // Re-render to update quantities
}

function clearCart() {
    cart = {};
    showToast('Cart cleared - All items have been removed'); updateCartDisplay();
    renderMenu(); // Re-render to update quantities
}

function updateCartDisplay() { 

    // Update cart badge

    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0); cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';

    // Update cart content

    const cartItemsArray = Object.entries(cart)
    .filter(([_, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => { const item = menuItems.find(i => i.id === itemId); 
    return { ...item, quantity };
    });
    if (cartItemsArray.length === 0) {
        emptyCart.style.display = 'flex'; 
        cartItems.innerHTML = ''; 
        cartFooter.style.display = 'none';
    } 
    else { 
        emptyCart.style.display = 'none'; 
        cartFooter.style.display = 'block';
        cartItems.innerHTML = cartItemsArray.map(item => `
        <div class="cart-item">
           <div class="cart-item-header">
            <h4 class="cart-item-name">${item.name}</h4>
            <div class="item-badges">
                ${item.isVegetarian ? '<span class="badge badge-veg">🌱</span>' : ''}
                ${item.isNonVegetarian ? '<span class="badge badge-veg">🍗</span>' : ''}
                ${item.isSpicy ? '<span class="badge badge-spicy">🌶 </span>' : ''}
            </div>
        </div>
        <p class="cart-item-description">${item.description}</p>
        <div class="cart-item-footer">
            <div class="quantity-controls">
                <button class="btn btn-outline quantity-btn" onclick="removeFromCart('${item.id}')">
                    <i data-lucide="minus"></i>
                </button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="btn btn-outline quantity-btn" onclick="addToCart('${item.id}')">
                    <i data-lucide="plus"></i>
                </button>
            </div>
            <div class="cart-item-price">
                <div class="unit-price">₹${item.price.toFixed(2)} each</div>
                <div class="total-price">₹${(item.price * item.quantity).toFixed(2)}</div> 
            </div>
        </div>
    </div>
    `).join('');
    // Update total
    const total = cartItemsArray.reduce((sum, item) => sum + (item.price * item.quantity),0);
    cartTotal.textContent = `₹${total.toFixed(2)}`;
}

    // Re-initialize Lucide icons 

    if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}
}

// Cart UI Functions

function toggleCart() {
    const isActive = cartSidebar.classList.contains('active'); 
    if (isActive) {
       closeCart();
    } 
    else { 
        openCart();
    }
}

function openCart() {
    cartOverlay.classList.add('active'); 
    cartSidebar.classList.add('active'); 
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartOverlay.classList.remove('active'); 
    cartSidebar.classList.remove('active'); 
    document.body.style.overflow = '';
}

// Toast Notifications

function showToast(message) { 
    toastMessage.textContent = message; 
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Modal Functions

function showQrCode() {
    qrModal.classList.add('active'); 
    document.body.style.overflow = 'hidden';
}

function closeQrModal() {
    qrModal.classList.remove('active'); 
    document.body.style.overflow = '';
}

// Staff Login Functions

    
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('staff-password');
    const toggleBtn = document.getElementById('password-toggle');
        
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } 
    else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
        }
}
    
// Staff Dashboard Functions
    
function showStaffDashboard() {
    if (!isStaffLoggedIn) {
        showStaffLogin();
        return;
    }
    hideModals();
    // If you have a staff dashboard modal, show it here:
    document.getElementById('staff-dashboard-modal').style.display = 'block';
    // renderDashboard();
    showToast('Staff logged in! (Dashboard not implemented)');
}
    
// renderDashboard and staff dashboard modal logic can be implemented here if needed
    
function renderOrderCard(order) {
    const statusColors = {
        pending: 'status-pending',
        preparing: 'status-preparing',
        ready: 'status-ready',
        completed: 'status-completed'
    };
        
    const statusIcons = {
        pending: '⏳',
        preparing: '👨‍🍳',
        ready: '✅',
        completed: '🎉'
    };
        
    const nextStatus = this.getNextStatus(order.status);
        
    return `
         <div class="order-card">
            <div class="order-header">
                <h4>Order #${order.id}</h4>
                <span class="status-badge ${statusColors[order.status]}">
                    ${statusIcons[order.status]} ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </div>
            <div class="order-details">
                <p><strong>Time:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
                <p><strong>Items:</strong></p>
                <ul class="order-items">
                    ${order.items.map(item => `
                    <li>${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
                </ul>
                <p class="order-total"><strong>Total: $${order.total.toFixed(2)}</strong></p>
            </div>
            ${order.status !== 'completed' ? `
            <button onclick="app.updateOrderStatus('${order.id}', '${nextStatus}')" class="btn btn-primary btn-small">Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                </button>` : ''}
        </div>
    `;
}
    
function getNextStatus(currentStatus) {
    const statusFlow = {
        'pending': 'preparing',
        'preparing': 'ready',
        'ready': 'completed'
    };
    return statusFlow[currentStatus] || 'completed';
}
    
function updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('restaurant-orders', JSON.stringify(this.orders));
        this.renderDashboard();
    }
}
    
function staffLogout() {
    isStaffLoggedIn = false;
    currentStaff = null;
    hideModals();
}
    
function hideModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Initialize the app when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     window.app = new RestaurantApp();
// });

// Global functions for HTML onclick handlers
function closeModal() {
    hideModals();
}

function placeOrder() {
    placeOrder();
}

function submitStaffLogin(event) {
    handleStaffLogin(event);
}

function togglePassword() {
    togglePasswordVisibility();
}

function staffLogout() {
    staffLogout();
}

// function showStaffDashboard() {
//     showStaffDashboard();
// }


// Navigation Functions

function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({
        behavior: 'smooth'
    });
}

// Order Functions 

function placeOrder() {
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0); 
    const total = Object.entries(cart).reduce((sum, [itemId, quantity]) => {
    const item = menuItems.find(i => i.id === itemId); 
    return sum + (item.price * quantity);}, 0);
    
    // Convert cart to order items format
    const orderItems = Object.entries(cart).map(([itemId, quantity]) => {
        const item = menuItems.find(i => i.id === itemId);
        return {
            id: item.id,
            name: item.name,
            quantity: quantity,
            price: item.price
        };
    });
    
    // Get orders array and generate sequential order ID
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderNumber = orders.length + 1;
    
    // Create order object with sequential numbering
    const order = {
        id: orderNumber,
        time: new Date().toISOString(),
        items: orderItems,
        total: total,
        status: 'pending'
    };
    
    // Save order to localStorage
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    showToast(`Order placed! ${totalItems} items - Total: ₹${total.toFixed(2)}`);

    // Log for debugging
    console.log('Order placed:', order);

    // Clear cart after order 
    setTimeout(() => { clearCart(); closeCart();}, 2000);
}

// Keyboard shortcuts

    document.addEventListener('keydown', function(e) {
        // Press 'Escape' to close cart or modal 
        if (e.key === 'Escape') {
            closeCart(); closeQrModal();
        }   
        // Press 'C' to toggle cart 
        if (e.key === 'c' || e.key === 'C') {
            if (!qrModal.classList.contains('active')) {
                toggleCart();
            }
        }
    });
    // Smooth scrolling for navigation links 
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href')); 
        if (target) {
            target.scrollIntoView({
            behavior: 'smooth'
            });
        }
    });
});

// Add some entrance animations 
function addEntranceAnimations() {
    const observerOptions = {
        threshold: 0.1, rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)';
        }
    });
    }, observerOptions);
    // Observe menu items for scroll animations 
    document.querySelectorAll('.menu-item').forEach(item => {
    item.style.opacity = '0'; item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease'; 
    observer.observe(item);
    });
}
// Initialize entrance animations after a short delay 
setTimeout(addEntranceAnimations, 500);
