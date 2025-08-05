#!/bin/bash

echo "🐰 RabbitMQ Streams Docker container başlatılıyor..."

# RabbitMQ Streams container'ını başlat
docker run -d \
  --name rabbitmq-streams \
  -p 5552:5552 \
  -p 15672:15672 \
  -p 5672:5672 \
  -e RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS='-rabbitmq_stream advertised_host localhost' \
  rabbitmq:4-management

echo "⏳ RabbitMQ başlatılıyor, lütfen bekleyin..."

# RabbitMQ'nun başlamasını bekle
sleep 30

echo "🔧 Stream plugin'leri etkinleştiriliyor..."

# Stream plugin'lerini etkinleştir
docker exec rabbitmq-streams rabbitmq-plugins enable rabbitmq_stream rabbitmq_stream_management

echo "✅ RabbitMQ Streams hazır!"
echo "📊 Management UI: http://localhost:15672"
echo "🔑 Kullanıcı adı: guest"
echo "🔑 Şifre: guest"
echo "�� Stream Port: 5552" 