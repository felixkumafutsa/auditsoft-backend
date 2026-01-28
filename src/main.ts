import * as dotenv from 'dotenv';
dotenv.config(); // Load .env file before anything else

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Explicitly load .env file
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins (for debugging)
app.enableCors({
  origin: ['https://mw265.com', 'http://localhost:3001'], // Add your actual domain
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});

  app.setGlobalPrefix('api');
  
  // Debug: Log Database URL (masked)
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`[Bootstrap] Using DATABASE_URL: ${maskedUrl}`);
  } else {
    console.error('[Bootstrap] CRITICAL: DATABASE_URL is not defined!');
  }

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch(err => {
  console.error('Fatal Error during bootstrap:', err);
  process.exit(1);
});