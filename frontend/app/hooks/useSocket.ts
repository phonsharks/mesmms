'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const newSocket = io(`${apiUrl}/api`, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket.io bağlantısı başarılı');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.io bağlantısı kesildi');
      setIsConnected(false);
    });

    newSocket.on('handshake', (data) => {
      console.log('Handshake mesajı:', data);
    });

    newSocket.on('iot-data', (data) => {
      console.log('IoT verisi alındı:', data);
      setMessages((prev) => [...prev, { ...data, receivedAt: new Date().toISOString() }]);
    });

    newSocket.on('system-log', (data) => {
      console.log('Sistem log mesajı:', data);
      setSystemLogs((prev) => [...prev, { ...data, receivedAt: new Date().toISOString() }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendPing = () => {
    if (socket) {
      socket.emit('ping', { message: 'ping from frontend' });
    }
  };

  return {
    socket,
    isConnected,
    messages,
    systemLogs,
    sendPing,
  };
}; 