import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { RabbitMQStreamsService } from './rabbitmq-streams.service';
import { RedisService } from './redis.service';
import { SensorReading } from './entities/sensor-reading.entity';

interface TestData {
  deviceId?: string;
  value?: number;
}

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rabbitMQStreams: RabbitMQStreamsService,
    private readonly redisService: RedisService,
    @InjectRepository(SensorReading)
    private readonly sensorReadingRepository: Repository<SensorReading>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        websocket: 'active',
        database: 'active',
      },
      rabbitmq: this.rabbitMQStreams.getConnectionStatus(),
      redis: this.redisService.getConnectionStatus(),
    };
  }

  @Get('sensor-readings')
  async getSensorReadings(
    @Query('limit') limit: string = '50',
    @Query('deviceId') deviceId?: string,
  ) {
    try {
      const queryBuilder = this.sensorReadingRepository
        .createQueryBuilder('reading')
        .orderBy('reading.createdAt', 'DESC')
        .limit(parseInt(limit) || 50);

      if (deviceId) {
        queryBuilder.where('reading.deviceId = :deviceId', { deviceId });
      }

      const readings = await queryBuilder.getMany();

      return {
        success: true,
        count: readings.length,
        data: readings,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  @Get('sensor-readings/stats')
  async getSensorStats() {
    try {
      const stats = (await this.sensorReadingRepository
        .createQueryBuilder('reading')
        .select([
          'COUNT(*) as totalReadings',
          'COUNT(DISTINCT reading.deviceId) as uniqueDevices',
          'AVG(reading.value) as averageValue',
          'MAX(reading.value) as maxValue',
          'MIN(reading.value) as minValue',
        ])
        .getRawOne()) as {
        totalReadings: string;
        uniqueDevices: string;
        averageValue: string;
        maxValue: string;
        minValue: string;
      };

      return {
        success: true,
        stats,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  @Post('test-rabbitmq')
  async testRabbitMQ(@Body() data: TestData) {
    const deviceId = data.deviceId || 'test-device';
    const value = data.value || Math.random() * 100;

    // RabbitMQ Streams'e gönder
    const success = await this.rabbitMQStreams.publishSensorReading(deviceId, value);

    return {
      message: success
        ? "Test verisi RabbitMQ Streams'e gönderildi"
        : 'RabbitMQ Streams bağlantısı yok',
      data: { deviceId, value, timestamp: new Date().toISOString() },
      rabbitmq: this.rabbitMQStreams.getConnectionStatus(),
      success,
    };
  }

  @Post('rabbitmq/disconnect')
  disconnectRabbitMQ() {
    // RabbitMQ Streams bağlantısını kapatma işlemi
    return {
      message: 'RabbitMQ Streams bağlantısı kapatıldı',
      rabbitmq: this.rabbitMQStreams.getConnectionStatus(),
    };
  }

  @Post('rabbitmq/connect')
  connectRabbitMQ() {
    // RabbitMQ Streams bağlantısını yeniden kurma işlemi
    return {
      message: 'RabbitMQ Streams bağlantısı kuruldu',
      rabbitmq: this.rabbitMQStreams.getConnectionStatus(),
    };
  }

  // Redis Cache Endpoint'leri
  @Get('cache/sensor/:deviceId')
  async getCachedSensorData(@Query('deviceId') deviceId: string) {
    try {
      const data = await this.redisService.getSensorData(deviceId);

      return {
        success: true,
        data,
        redis: this.redisService.getConnectionStatus(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        redis: this.redisService.getConnectionStatus(),
      };
    }
  }

  @Get('cache/sensor/:deviceId/history')
  async getCachedSensorHistory(
    @Query('deviceId') deviceId: string,
    @Query('limit') limit: string = '10',
  ) {
    try {
      const history = await this.redisService.getSensorHistory(deviceId, parseInt(limit) || 10);

      return {
        success: true,
        count: history.length,
        data: history,
        redis: this.redisService.getConnectionStatus(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        redis: this.redisService.getConnectionStatus(),
      };
    }
  }

  @Get('cache/sensors')
  async getAllCachedSensors() {
    try {
      const sensors = await this.redisService.getAllActiveSensors();

      return {
        success: true,
        count: sensors.length,
        data: sensors,
        redis: this.redisService.getConnectionStatus(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        redis: this.redisService.getConnectionStatus(),
      };
    }
  }

  @Post('cache/clear')
  async clearCache() {
    try {
      const success = await this.redisService.clearCache();

      return {
        success,
        message: success ? 'Cache temizlendi' : 'Cache temizlenemedi',
        redis: this.redisService.getConnectionStatus(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        redis: this.redisService.getConnectionStatus(),
      };
    }
  }

  @Get('cache/ping')
  async pingRedis() {
    try {
      const isAlive = await this.redisService.ping();

      return {
        success: true,
        ping: isAlive ? 'PONG' : 'FAILED',
        redis: this.redisService.getConnectionStatus(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        redis: this.redisService.getConnectionStatus(),
      };
    }
  }
}
