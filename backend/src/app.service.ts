import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IoTGateway } from './iot.gateway';
import { RabbitMQStreamsService } from './rabbitmq-streams.service';
import { SensorReading } from './entities/sensor-reading.entity';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly gateway: IoTGateway,
    private readonly rabbitMQStreams: RabbitMQStreamsService,
    @InjectRepository(SensorReading)
    private readonly sensorReadingRepository: Repository<SensorReading>,
  ) {}

  onModuleInit() {
    // 5 saniyede bir random veri gönder
    setInterval(() => {
      void this.generateAndSendData();
    }, 5000);
  }

  private async generateAndSendData() {
    const deviceId = 'device-' + Math.floor(Math.random() * 10);
    const value = Math.random() * 100;

    // RabbitMQ Streams üzerinden mesaj gönder
    const success = await this.rabbitMQStreams.publishSensorReading(deviceId, value);

    if (success) {
      console.log(`📤 RabbitMQ Streams'e mesaj gönderildi: ${deviceId} - ${value}`);
    } else {
      console.log('❌ RabbitMQ Streams mesaj gönderilemedi, direkt veritabanına kaydediliyor...');

      // Backup olarak direkt veritabanına kaydet
      try {
        const sensorReading = this.sensorReadingRepository.create({
          deviceId,
          value,
          timestamp: new Date().toISOString(),
        });
        await this.sensorReadingRepository.save(sensorReading);
        console.log('💾 Veri direkt veritabanına kaydedildi (backup):', { deviceId, value });
      } catch (dbError) {
        console.error('❌ Veritabanına kaydetme hatası:', dbError);
      }
    }

    // WebSocket ile frontend'e gönder
    if (this.gateway.server) {
      const data = { deviceId, value, timestamp: new Date().toISOString() };
      this.gateway.server.emit('iot-data', data);
      console.log('📡 Veri WebSocket ile gönderildi:', data);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
