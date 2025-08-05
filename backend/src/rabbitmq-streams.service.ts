import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorReading } from './entities/sensor-reading.entity';
import { EventEmitter } from 'events';
import { RedisService } from './redis.service';

export interface RabbitMQStreamMessage {
  deviceId: string;
  value: number;
  timestamp: string;
  type: 'sensor_reading' | 'system_event';
}

@Injectable()
export class RabbitMQStreamsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQStreamsService.name);
  private eventEmitter = new EventEmitter();
  private isConnected = false;
  private readonly streamName = 'iot-sensor-stream';
  private readonly streamSizeRetention = 5 * 1e9; // 5 GB
  private isSimulatorMode = true;
  private client: any = null;
  private publisher: any = null;
  private consumer: any = null;

  constructor(
    @InjectRepository(SensorReading)
    private readonly sensorReadingRepository: Repository<SensorReading>,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    this.logger.log('🐰 RabbitMQ Streams Simulator başlatılıyor...');

    try {
      // Gerçek RabbitMQ bağlantısını dene
      await this.connectToRealRabbitMQ();
    } catch (error) {
      this.logger.warn(
        '⚠️ Gerçek RabbitMQ bağlantısı kurulamadı, Simulator moduna geçiliyor...',
        error,
      );
      this.isSimulatorMode = true;
      this.isConnected = true;
      this.logger.log('✅ RabbitMQ Streams Simulator aktif');
    }
  }

  onModuleDestroy() {
    this.logger.log('🔌 RabbitMQ Streams Simulator kapatılıyor...');
    this.isConnected = false;
  }

  private async connectToRealRabbitMQ() {
    try {
      // RabbitMQ Streams client'ını dinamik olarak import et
      const rabbit = await import('rabbitmq-stream-js-client');

      this.logger.log('🔌 Gerçek RabbitMQ Streams bağlantısı deneniyor...');

      this.client = await rabbit.connect({
        hostname: process.env.RABBITMQ_HOST || 'localhost',
        port: parseInt(process.env.RABBITMQ_STREAM_PORT || '5552'),
        username: process.env.RABBITMQ_USER || 'guest',
        password: process.env.RABBITMQ_PASS || 'guest',
        vhost: process.env.RABBITMQ_VHOST || '/',
      });

      // Stream oluştur
      if (this.client) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await this.client.createStream({
          stream: this.streamName,
          arguments: {
            'max-length-bytes': this.streamSizeRetention,
          },
        });

        // Publisher oluştur
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        this.publisher = await this.client.declarePublisher({
          stream: this.streamName,
        });

        // Consumer oluştur
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        this.consumer = await this.client.declareConsumer(
          {
            stream: this.streamName,
            offset: rabbit.Offset.first(),
          },
          (message: any) => {
            void this.handleMessage(message);
          },
        );
      }

      this.isSimulatorMode = false;
      this.isConnected = true;
      this.logger.log('✅ Gerçek RabbitMQ Streams bağlantısı başarılı!');
    } catch (error) {
      throw new Error(`RabbitMQ bağlantı hatası: ${error}`);
    }
  }

  private async handleMessage(message: any) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!message || !message.content || !Buffer.isBuffer(message.content)) {
        this.logger.warn('❌ Geçersiz mesaj formatı');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const content = message.content.toString();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const data: RabbitMQStreamMessage = JSON.parse(content) as RabbitMQStreamMessage;

      this.logger.log(`📨 Stream mesajı alındı: ${data.deviceId} - ${data.value}`);

      // Veritabanına kaydet
      if (data.type === 'sensor_reading') {
        const sensorReading = this.sensorReadingRepository.create({
          deviceId: data.deviceId,
          value: data.value,
          timestamp: data.timestamp,
        });

        await this.sensorReadingRepository.save(sensorReading);
        this.logger.log(`💾 Veri veritabanına kaydedildi: ${data.deviceId}`);

        // Redis cache'e kaydet
        await this.redisService.cacheSensorData(data.deviceId, data);
      }

      // Mesajı onayla (gerçek RabbitMQ için)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!this.isSimulatorMode && message && typeof message.ack === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await message.ack();
      }
    } catch (error) {
      this.logger.error('❌ Mesaj işleme hatası:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!this.isSimulatorMode && message && typeof message.nack === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await message.nack();
      }
    }
  }

  async publishMessage(message: RabbitMQStreamMessage): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.warn('❌ RabbitMQ Streams bağlantısı yok, mesaj gönderilemedi');
      return false;
    }

    try {
      if (this.isSimulatorMode) {
        // Simulator modunda EventEmitter kullan
        this.eventEmitter.emit('message', message);
        this.logger.log(`📤 Simulator mesajı gönderildi: ${message.deviceId} - ${message.value}`);
      } else {
        // Gerçek RabbitMQ'ya gönder
        if (this.publisher) {
          const payload = Buffer.from(JSON.stringify(message));
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          await this.publisher.send(payload);
          this.logger.log(
            `📤 Gerçek RabbitMQ mesajı gönderildi: ${message.deviceId} - ${message.value}`,
          );
        }
      }

      return true;
    } catch (error) {
      this.logger.error('❌ Stream mesaj gönderme hatası:', error);
      return false;
    }
  }

  async publishSensorReading(deviceId: string, value: number): Promise<boolean> {
    const message: RabbitMQStreamMessage = {
      deviceId,
      value,
      timestamp: new Date().toISOString(),
      type: 'sensor_reading',
    };

    return this.publishMessage(message);
  }

  async publishSystemEvent(): Promise<boolean> {
    const message: RabbitMQStreamMessage = {
      deviceId: 'system',
      value: 0,
      timestamp: new Date().toISOString(),
      type: 'system_event',
    };

    return this.publishMessage(message);
  }

  // Simulator için subscriber
  subscribe(callback: (message: RabbitMQStreamMessage) => void) {
    if (this.isSimulatorMode) {
      this.eventEmitter.on('message', callback);
      this.logger.log('📥 Simulator subscriber eklendi');
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      streamName: this.streamName,
      mode: this.isSimulatorMode ? 'simulator' : 'real',
      type: 'streams',
    };
  }
}
