import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IoTGateway } from './iot.gateway';
import { Device } from './entities/device.entity';
import { SensorReading } from './entities/sensor-reading.entity';
import { RabbitMQStreamsService } from './rabbitmq-streams.service';
import { RedisService } from './redis.service';

// Port parsing için yardımcı fonksiyon
const getPort = (port: string | undefined, defaultPort: number): number => {
  if (!port) return defaultPort;
  const parsed = parseInt(port, 10);
  return isNaN(parsed) ? defaultPort : parsed;
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: getPort(process.env.POSTGRES_PORT, 5432),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '123456',
      database: process.env.POSTGRES_DB || 'iot',
      entities: [Device, SensorReading],
      synchronize: true,
      retryAttempts: 3,
      retryDelay: 3000,
      logging: false,
    }),
    TypeOrmModule.forFeature([Device, SensorReading]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', '.next'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, IoTGateway, RabbitMQStreamsService, RedisService],
})
export class AppModule {}
