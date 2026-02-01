import * as dotenv from 'dotenv';
dotenv.config(); // Load .env file before anything else

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Explicitly load .env file
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api'); // Removed global prefix

  // Enable CORS for all origins (for debugging)
  app.enableCors({
    origin: true, // Allow all origins temporarily to debug CORS
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  
  // Debug: Log Database URL (masked)
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`[Bootstrap] Using DATABASE_URL: ${maskedUrl}`);
  } else {
    console.error('[Bootstrap] CRITICAL: DATABASE_URL is not defined!');
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch(err => {
  console.error('Fatal Error during bootstrap:', err);
  process.exit(1);
});