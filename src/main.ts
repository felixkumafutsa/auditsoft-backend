import * as dotenv from 'dotenv';
dotenv.config(); // Load .env file before anything else

import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  // ─── 1. CORS: Restrict to known front-end origin ──────────────────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,https://mw265.com,https://api.mw265.com')
    .split(',')
    .map(o => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or matched origins
      if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
        callback(null, true);
      } else {
        // Log the mismatch instead of throwing an unhandled error
        console.warn(`[CORS] Rejected origin: ${origin}`);
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ─── 1.5. Serve static files (uploads) ──────────────────────────────────
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // ─── 2. Global Validation Pipe (class-validator) ───────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on extra properties
      transform: true,          // Auto-transform payloads to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── 3. Global JWT Auth Guard (all routes protected by default) ───────────
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  if (!process.env.DATABASE_URL) {
    console.error('[Bootstrap] CRITICAL: DATABASE_URL is not defined!');
  }

  // ─── 4. Swagger API Documentation ─────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('AUDITSOFT API')
    .setDescription('Enterprise Audit Management System')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();

  // Create the document
  const document = SwaggerModule.createDocument(app, config);

  // Setup with custom options
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`📚 API Documentation: ${await app.getUrl()}/api`);
}
bootstrap().catch(err => {
  console.error('Fatal Error during bootstrap:', err);
  process.exit(1);
});
