const io = require('socket.io-client');

console.log('🔍 Sistem Test Ediliyor...\n');

// Socket.io bağlantısını test et
const socket = io('http://localhost:3000/api', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Socket.io bağlantısı başarılı!');
  
  // Ping gönder
  socket.emit('ping', { message: 'test ping' });
});

socket.on('handshake', (data) => {
  console.log('🤝 Handshake alındı:', data);
});

socket.on('pong', (data) => {
  console.log('🏓 Pong alındı:', data);
});

socket.on('system-log', (data) => {
  console.log('📝 Sistem logu:', data.message);
});

socket.on('iot-data', (data) => {
  console.log('📊 IoT verisi:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Bağlantı kesildi');
});

// 5 saniye sonra bağlantıyı kapat
setTimeout(() => {
  console.log('\n🏁 Test tamamlandı');
  socket.disconnect();
  process.exit(0);
}, 5000); 