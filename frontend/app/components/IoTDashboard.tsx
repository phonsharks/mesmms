'use client';

import { useSocket } from '../hooks/useSocket';

export const IoTDashboard = () => {
  const { isConnected, messages, systemLogs, sendPing } = useSocket();

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'connection':
        return 'bg-green-100 text-green-800';
      case 'disconnection':
        return 'bg-red-100 text-red-800';
      case 'ping':
        return 'bg-blue-100 text-blue-800';
      case 'rabbitmq':
        return 'bg-purple-100 text-purple-800';
      case 'database':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">IoT Dashboard</h1>
          
          {/* Bağlantı Durumu */}
          <div className="flex items-center mb-6">
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}
            </span>
            <button
              onClick={sendPing}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Ping Gönder
            </button>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Toplam Mesaj</h3>
              <p className="text-2xl font-bold text-blue-600">{messages.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Sistem Logları</h3>
              <p className="text-2xl font-bold text-green-600">{systemLogs.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">Aktif Cihazlar</h3>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(messages.map(m => m.deviceId)).size}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800">Son Güncelleme</h3>
              <p className="text-sm text-yellow-600">
                {messages.length > 0 
                  ? new Date(messages[messages.length - 1].receivedAt).toLocaleTimeString('tr-TR')
                  : 'Henüz veri yok'
                }
              </p>
            </div>
          </div>

          {/* Sistem Logları */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Sistem Logları</h2>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="p-4 space-y-2">
                {systemLogs.slice(-20).reverse().map((log, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLogTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{log.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                        {log.clientId && ` • Client: ${log.clientId}`}
                        {log.deviceId && ` • Device: ${log.deviceId}`}
                      </p>
                    </div>
                  </div>
                ))}
                {systemLogs.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Henüz sistem logu yok</p>
                )}
              </div>
            </div>
          </div>

          {/* Gerçek Zamanlı Veri Tablosu */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Gerçek Zamanlı Veriler</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cihaz ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Değer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zaman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alınma Zamanı
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messages.slice(-10).reverse().map((message, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {message.deviceId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {message.value?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.receivedAt).toLocaleTimeString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 