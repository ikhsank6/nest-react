// Custom Swagger script to auto-set token after login
(function() {
  'use strict';
  
  // Wait for Swagger UI to be ready
  const checkSwaggerUI = setInterval(function() {
    if (window.ui) {
      clearInterval(checkSwaggerUI);
      initAutoToken();
    }
  }, 100);

  function initAutoToken() {
    // Intercept fetch to capture login response
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      return originalFetch.apply(this, args).then(async response => {
        const url = args[0];
        
        // Check if this is a login request
        if (typeof url === 'string' && url.includes('/api/auth/login')) {
          try {
            const clonedResponse = response.clone();
            const data = await clonedResponse.json();
            
            if (data.success && data.data && data.data.accessToken) {
              const token = data.data.accessToken;
              
              // Auto-set the authorization
              window.ui.preauthorizeApiKey('JWT-auth', token);
              
              // Show notification
              showNotification('✓ Token berhasil disimpan! Endpoint terproteksi sekarang dapat diakses.', 'success');
              
              console.log('🔐 JWT Token auto-saved to Swagger authorization');
            }
          } catch (e) {
            console.log('Could not parse login response:', e);
          }
        }
        
        return response;
      });
    };
  }

  function showNotification(message, type) {
    // Remove existing notification
    const existing = document.querySelector('.custom-swagger-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'custom-swagger-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : '#ef4444'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
})();
