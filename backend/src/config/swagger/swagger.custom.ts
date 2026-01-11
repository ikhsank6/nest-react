export const swaggerCustomCss = `
  .swagger-ui {
    background-color: #0f172a;
    color: #e2e8f0;
  }
  .swagger-ui .topbar {
    background-color: #1e293b;
    border-bottom: 1px solid #334155;
  }
  .swagger-ui .info .title {
    color: #f8fafc;
  }
  .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info table {
    color: #94a3b8;
  }
  .swagger-ui .opblock-tag {
    color: #f1f5f9;
    border-bottom: 1px solid #334155;
    font-family: 'Inter', sans-serif;
    background: rgba(30, 41, 59, 0.7);
    padding: 15px 20px;
    border-radius: 8px;
    margin: 10px 0;
  }
  .swagger-ui .opblock {
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #334155 !important;
    background: #1e293b !important;
  }
  .swagger-ui .opblock .opblock-summary {
    padding: 12px 20px;
  }
  .swagger-ui .opblock.opblock-post { border-color: #10b981 !important; background: rgba(16, 185, 129, 0.05) !important; }
  .swagger-ui .opblock.opblock-get { border-color: #3b82f6 !important; background: rgba(59, 130, 246, 0.05) !important; }
  .swagger-ui .opblock.opblock-put { border-color: #f59e0b !important; background: rgba(245, 158, 11, 0.05) !important; }
  .swagger-ui .opblock.opblock-delete { border-color: #ef4444 !important; background: rgba(239, 68, 68, 0.05) !important; }
  
  .swagger-ui .opblock-description-wrapper p, .swagger-ui .opblock-external-docs-wrapper p, .swagger-ui .opblock-title_normal p {
    color: #cbd5e1;
  }
  .swagger-ui section.models {
    border: 1px solid #334155;
    border-radius: 8px;
    background: #1e293b;
  }
  .swagger-ui section.models .model-container {
    background: transparent;
  }
  .swagger-ui .model {
    color: #94a3b8;
  }
  
  /* Hierarchy styling */
  .swagger-ui .opblock-tag small {
    color: #64748b;
  }
  
  /* Download Button Styling */
  .download-swagger-button {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white !important;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none !important;
    margin-left: 20px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: none;
    cursor: pointer;
  }
  .download-swagger-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px -2px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
  }
  .download-swagger-button svg {
    margin-right: 8px;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #0f172a; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #475569; }

  /* Custom badge for grouping */
  .swagger-ui .opblock-tag {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 45px !important;
  }
  .swagger-ui .opblock-tag::before {
    content: '📁';
    position: absolute;
    left: 15px;
    font-size: 18px;
    opacity: 0.8;
  }
`;

export const swaggerCustomJs = `
  (function() {
    'use strict';
    
    // Wait for Swagger UI to be ready
    const checkSwaggerUI = setInterval(function() {
      if (window.ui) {
        clearInterval(checkSwaggerUI);
        initAutoToken();
        restoreToken();
        injectDownloadButton();
      }
    }, 500);

    function injectDownloadButton() {
      const topbar = document.querySelector('.topbar-wrapper');
      if (topbar && !document.querySelector('.download-swagger-button')) {
        const downloadBtn = document.createElement('a');
        downloadBtn.className = 'download-swagger-button';
        downloadBtn.href = '/api/docs-json';
        downloadBtn.target = '_blank';
        downloadBtn.innerHTML = \`
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download JSON
        \`;
        
        // Find insert point (after the logo)
        const link = topbar.querySelector('a');
        if (link) {
          link.after(downloadBtn);
        } else {
          topbar.appendChild(downloadBtn);
        }
      }
    }

    function restoreToken() {
      const savedToken = localStorage.getItem('swagger_jwt_token');
      if (savedToken) {
        setToken(savedToken);
      }
    }

    function setToken(token) {
      window.ui.authActions.authorizeWithPersistOption({
        'JWT-auth': {
          name: 'JWT-auth',
          schema: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            in: 'header'
          },
          value: token
        }
      });
    }

    function initAutoToken() {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        return originalFetch.apply(this, args).then(async response => {
          const url = args[0];
          
          if (typeof url === 'string' && url.includes('/api/auth/login')) {
            try {
              const clonedResponse = response.clone();
              const data = await clonedResponse.json();
              
              if (data.meta && data.meta.status && data.data && data.data.accessToken) {
                const token = data.data.accessToken;
                localStorage.setItem('swagger_jwt_token', token);
                setToken(token);
                showNotification('✓ Token berhasil disimpan! Endpoint terproteksi sekarang dapat diakses.', 'success');
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
      const existing = document.querySelector('.custom-swagger-notification');
      if (existing) existing.remove();

      const notification = document.createElement('div');
      notification.className = 'custom-swagger-notification';
      notification.style.cssText = 
        'position: fixed; top: 20px; right: 20px; padding: 16px 24px; ' +
        'background: ' + (type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : '#ef4444') + '; ' +
        'color: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); ' +
        'z-index: 99999; font-family: -apple-system, BlinkMacSystemFont, sans-serif; ' +
        'font-size: 14px; font-weight: 500; animation: slideIn 0.3s ease-out;';
      notification.textContent = message;

      if (!document.querySelector('#swagger-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'swagger-notification-styles';
        style.textContent = 
          '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } ' +
          '@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
        document.head.appendChild(style);
      }

      document.body.appendChild(notification);

      setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(function() { notification.remove(); }, 300);
      }, 4000);
    }
  })();
`;
