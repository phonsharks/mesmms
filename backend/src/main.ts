import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Environment variables'ları yükle
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS konfigürasyonu
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('RabbitMQ Streams Host:', process.env.RABBITMQ_HOST || 'localhost');
  console.log('RabbitMQ Streams Port:', process.env.RABBITMQ_STREAM_PORT || '5552');
  console.log('PostgreSQL Host:', process.env.POSTGRES_HOST || 'localhost');
  console.log('PostgreSQL Database:', process.env.POSTGRES_DB || 'iot');
  console.log('PostgreSQL User:', process.env.POSTGRES_USER || 'postgres');
  console.log('Environment:', process.env.NODE_ENV || 'development');
}
void bootstrap();
