// Main Application Logic

// Update user info in header
function updateUserInfo() {
    const user = auth.getCurrentUser();
    if (user) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.username;
        }
    }
}

// Initialize page
function initPage() {
    // Check authentication for protected pages
    if (window.location.pathname !== '/index.html' && 
        window.location.pathname !== '/pages/register.html' &&
        window.location.pathname !== '/') {
        auth.requireAuth();
    }
    
    // Update user info if authenticated
    if (auth.isAuthenticated()) {
        updateUserInfo();
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    }
}

// Call initPage when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
