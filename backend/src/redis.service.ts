import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

export interface CacheData {
  deviceId: string;
  value: number;
  timestamp: string;
  type: 'sensor_reading' | 'system_event';
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;
  private isConnected = false;

  async onModuleInit() {
    this.logger.log('🔴 Redis bağlantısı başlatılıyor...');
    await this.connect();
  }

  async onModuleDestroy() {
    this.logger.log('🔌 Redis bağlantısı kapatılıyor...');
    await this.disconnect();
  }

  private async connect() {
    try {
      this.client = createClient({
        username: 'default',
        password: 'WBYdloNPkkCfnDc3Ykp4EC6IPDYK1ABC',
        socket: {
          host: 'redis-14048.c99.us-east-1-4.ec2.redns.redis-cloud.com',
          port: 14048,
        },
      });

      this.client.on('error', (err) => {
        this.logger.error('❌ Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('✅ Redis bağlantısı başarılı!');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        this.logger.log('🚀 Redis hazır!');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('❌ Redis bağlantı hatası:', error);
      this.isConnected = false;
    }
  }

  private async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  // Sensor verilerini cache'e kaydet
  async cacheSensorData(deviceId: string, data: CacheData): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.warn('❌ Redis bağlantısı yok, cache işlemi yapılamadı');
      return false;
    }

    try {
      const key = `sensor:${deviceId}`;
      const value = JSON.stringify(data);

      // Veriyi cache'e kaydet (TTL: 1 saat)
      await this.client.setEx(key, 3600, value);

      // Son 10 okumayı liste olarak sakla
      const listKey = `sensor_history:${deviceId}`;
      await this.client.lPush(listKey, value);
      await this.client.lTrim(listKey, 0, 9); // Sadece son 10 kayıt
      await this.client.expire(listKey, 86400); // 24 saat TTL

      this.logger.log(`💾 Sensor verisi cache'e kaydedildi: ${deviceId}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Cache kaydetme hatası:', error);
      return false;
    }
  }

  // Cache'den sensor verisi al
  async getSensorData(deviceId: string): Promise<CacheData | null> {
    if (!this.isConnected) {
      this.logger.warn('❌ Redis bağlantısı yok, cache verisi alınamadı');
      return null;
    }

    try {
      const key = `sensor:${deviceId}`;
      const data = await this.client.get(key);

      if (data) {
        return JSON.parse(data) as CacheData;
      }

      return null;
    } catch (error) {
      this.logger.error('❌ Cache okuma hatası:', error);
      return null;
    }
  }

  // Sensor geçmişini al
  async getSensorHistory(deviceId: string, limit = 10): Promise<CacheData[]> {
    if (!this.isConnected) {
      this.logger.warn('❌ Redis bağlantısı yok, geçmiş verisi alınamadı');
      return [];
    }

    try {
      const listKey = `sensor_history:${deviceId}`;
      const history = await this.client.lRange(listKey, 0, limit - 1);

      return history.map((item) => JSON.parse(item) as CacheData);
    } catch (error) {
      this.logger.error('❌ Geçmiş okuma hatası:', error);
      return [];
    }
  }

  // Tüm aktif sensor'ları listele
  async getAllActiveSensors(): Promise<string[]> {
    if (!this.isConnected) {
      this.logger.warn('❌ Redis bağlantısı yok, sensor listesi alınamadı');
      return [];
    }

    try {
      const keys = await this.client.keys('sensor:*');
      return keys.map((key) => key.replace('sensor:', ''));
    } catch (error) {
      this.logger.error('❌ Sensor listesi alma hatası:', error);
      return [];
    }
  }

  // Cache'i temizle
  async clearCache(): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.warn('❌ Redis bağlantısı yok, cache temizlenemedi');
      return false;
    }

    try {
      await this.client.flushDb();
      this.logger.log('🧹 Cache temizlendi');
      return true;
    } catch (error) {
      this.logger.error('❌ Cache temizleme hatası:', error);
      return false;
    }
  }

  // Bağlantı durumunu kontrol et
  async ping(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('❌ Redis ping hatası:', error);
      return false;
    }
  }

  // Bağlantı durumunu döndür
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      type: 'redis',
      host: 'redis-14048.c99.us-east-1-4.ec2.redns.redis-cloud.com',
      port: 14048,
    };
  }
}
