import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins (for demo)
  app.enableCors({
    origin: '*',          // allow all domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
