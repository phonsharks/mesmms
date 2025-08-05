<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# IoT Backend - RabbitMQ Streams Entegrasyonu

Bu proje, IoT sensör verilerini RabbitMQ Streams kullanarak işleyen bir NestJS backend uygulamasıdır.

## 🚀 Özellikler

- **RabbitMQ Streams**: Gerçek zamanlı mesaj işleme
- **PostgreSQL**: Veri kalıcılığı
- **WebSocket**: Gerçek zamanlı frontend iletişimi
- **TypeORM**: Veritabanı ORM
- **NestJS**: Backend framework

## 📋 Gereksinimler

- Node.js >= 16.x
- PostgreSQL
- RabbitMQ (Streams plugin ile)

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Environment Variables

`.env` dosyası oluşturun:

```env
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456
POSTGRES_DB=iot

# RabbitMQ Streams Configuration
RABBITMQ_HOST=localhost
RABBITMQ_STREAM_PORT=5552
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_VHOST=/

# Application Configuration
NODE_ENV=development
PORT=3001
```

### 3. RabbitMQ Streams Kurulumu

#### Docker ile (Önerilen)

```bash
# Docker script'ini çalıştır
chmod +x docker-rabbitmq-streams.sh
./docker-rabbitmq-streams.sh
```

#### Manuel Kurulum

1. RabbitMQ'yu yükleyin
2. Stream plugin'lerini etkinleştirin:
   ```bash
   rabbitmq-plugins enable rabbitmq_stream rabbitmq_stream_management
   ```

### 4. PostgreSQL Kurulumu

PostgreSQL'i kurun ve `iot` veritabanını oluşturun.

### 5. Uygulamayı Başlat

```bash
# Development modunda
npm run start:dev

# Production modunda
npm run start:prod
```

## 🔧 API Endpoints

### Health Check
```
GET /health
```

### Sensor Readings
```
GET /sensor-readings?limit=50&deviceId=device-1
GET /sensor-readings/stats
```

### RabbitMQ Test
```
POST /test-rabbitmq
{
  "deviceId": "test-device",
  "value": 42.5
}
```

## 📊 RabbitMQ Streams

### Stream Detayları
- **Stream Name**: `iot-sensor-stream`
- **Retention**: 5 GB
- **Port**: 5552

### Mesaj Formatı
```json
{
  "deviceId": "device-1",
  "value": 42.5,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "type": "sensor_reading"
}
```

## 🔄 Veri Akışı

1. **Sensör Verisi Üretimi**: `AppService` her 5 saniyede bir random veri üretir
2. **RabbitMQ Streams**: Veri stream'e gönderilir
3. **Consumer**: Stream'den veri okunur ve PostgreSQL'e kaydedilir
4. **WebSocket**: Frontend'e gerçek zamanlı veri gönderilir

## 🐛 Hata Ayıklama

### RabbitMQ Bağlantı Sorunları
- RabbitMQ'nun çalıştığından emin olun
- Stream plugin'lerinin etkin olduğunu kontrol edin
- Port 5552'nin açık olduğunu kontrol edin

### PostgreSQL Bağlantı Sorunları
- PostgreSQL'in çalıştığından emin olun
- Veritabanı ve kullanıcı bilgilerini kontrol edin

## 📝 Loglar

Uygulama detaylı loglar üretir:
- 🔌 Bağlantı durumları
- 📤 Mesaj gönderme
- 📥 Mesaj alma
- 💾 Veritabanı işlemleri
- 📡 WebSocket iletişimi

## 🚀 Production

Production ortamında:
- `synchronize: false` yapın
- Environment variables'ları güvenli şekilde yönetin
- Log seviyelerini ayarlayın
- Monitoring ekleyin
