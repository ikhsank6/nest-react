"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logger_service_1 = require("./logger/logger.service");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = app.get(logger_service_1.LoggerService);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'), {
        prefix: '/public/',
    });
    app.enableCors({
        origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new validation_pipe_1.ValidationPipe());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(logger));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Nest React API')
        .setDescription(`
      <h3>🔐 Auto-Token Feature</h3>
      <p>Setelah login berhasil, token akan <strong>otomatis disimpan</strong> ke authorization.</p>
      <p>Anda bisa langsung mengakses endpoint yang memerlukan autentikasi tanpa perlu copy-paste token.</p>
      <hr/>
    `)
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    const port = process.env.PORT || 3000;
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customJsStr: `
      // Custom Swagger script to auto-set token after login
      (function() {
        'use strict';
        
        // Wait for Swagger UI to be ready
        const checkSwaggerUI = setInterval(function() {
          if (window.ui) {
            clearInterval(checkSwaggerUI);
            initAutoToken();
            restoreToken();
          }
        }, 500);

        function restoreToken() {
          // Restore token from localStorage if available
          const savedToken = localStorage.getItem('swagger_jwt_token');
          if (savedToken) {
            setToken(savedToken);
            console.log('🔐 JWT Token restored from storage');
          }
        }

        function setToken(token) {
          // Use the correct method for Bearer auth
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
                  
                  if (data.meta && data.meta.status && data.data && data.data.accessToken) {
                    const token = data.data.accessToken;
                    
                    // Save to localStorage
                    localStorage.setItem('swagger_jwt_token', token);
                    
                    // Auto-set the authorization
                    setToken(token);
                    
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
          notification.style.cssText = 
            'position: fixed; top: 20px; right: 20px; padding: 16px 24px; ' +
            'background: ' + (type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : '#ef4444') + '; ' +
            'color: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); ' +
            'z-index: 99999; font-family: -apple-system, BlinkMacSystemFont, sans-serif; ' +
            'font-size: 14px; font-weight: 500; animation: slideIn 0.3s ease-out;';
          notification.textContent = message;

          // Add animation styles
          if (!document.querySelector('#swagger-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'swagger-notification-styles';
            style.textContent = 
              '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } ' +
              '@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
            document.head.appendChild(style);
          }

          document.body.appendChild(notification);

          // Auto-remove after 4 seconds
          setTimeout(function() {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(function() { notification.remove(); }, 300);
          }, 4000);
        }
      })();
    `,
        customSiteTitle: 'Nest React API Docs',
    });
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map