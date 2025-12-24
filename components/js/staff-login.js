// Staff Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const staffSession = localStorage.getItem('staffSession');
    if (staffSession) {
        window.location.href = 'staff-dashboard.html';
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    const errorMessage = document.getElementById('errorMessage');
    
    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = passwordInput.value;
        
        // Demo credentials - in production, this would be server-side authentication
        if (username === 'staff' && password === 'password123') {
            // Create session
            const session = {
                username: username,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('staffSession', JSON.stringify(session));
            
            // Redirect to dashboard
            window.location.href = 'staff-dashboard.html';
        } else {
            errorMessage.style.display = 'block';
            
            // Clear password field
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
    
    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            eyeIcon.textContent = '👁️';
        }
    });
    
    // Hide error message when user starts typing
    document.getElementById('username').addEventListener('input', function() {
        errorMessage.style.display = 'none';
    });
    
    passwordInput.addEventListener('input', function() {
        errorMessage.style.display = 'none';
    });
});
