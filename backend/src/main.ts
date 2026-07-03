import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://192.168.1.82:5173',
      'https://goods-shop-v1.vercel.app',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  const configService = app.get(ConfigService);

  const port = parseInt(configService.get<string>('PORT', '8080'), 10);

  await app.listen(port || 8080, '0.0.0.0');
}
bootstrap();
