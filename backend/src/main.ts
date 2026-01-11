import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerService } from './logger/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { swaggerCustomCss, swaggerCustomJs } from './config/swagger/swagger.custom';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Disable ETags to force 200 OK instead of 304
  app.set('etag', false);

  const logger = app.get(LoggerService);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200,
  });

  // Global prefix (exclude static asset paths)
  app.setGlobalPrefix('api', {
    exclude: ['/uploads/(.*)', '/public/(.*)'],
  });

  // Serve static files (AFTER global prefix to avoid conflicts)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global pipes
  app.useGlobalPipes(new ValidationPipe());

  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Swagger hanya untuk development dan staging
  const allowedEnvs = ['development', 'staging', 'local'];
  const currentEnv = process.env.NODE_ENV || 'development';

  if (allowedEnvs.includes(currentEnv)) {
    // Swagger Setup
    const config = new DocumentBuilder()
      .setTitle('Nest React API')
      .setDescription(`
      <h3>🔐 Auto-Token Feature</h3>
      <p>Setelah login berhasil, token akan <strong>otomatis disimpan</strong> ke authorization.</p>
      <p>Anda bisa langsung mengakses endpoint yang memerlukan autentikasi tanpa perlu copy-paste token.</p>
      <hr/>
    `)
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Custom Swagger options with script to auto-set token after login
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        tagsSorter: 'alpha',
        filter: false,
        displayRequestDuration: true,
      },
      customCss: swaggerCustomCss,
      customJsStr: swaggerCustomJs,
      customSiteTitle: 'Nest React API Docs',
    });
  }
  // Get the base URL for the custom script
  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
