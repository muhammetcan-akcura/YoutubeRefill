import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Youtube } from 'lucide-react';

// Order veri tipi tanımlaması
interface Order {
  id: string;
  mainID: string;
  startCount: string | number;
  count: string | number;
  link: string;
}

// JSON API yapısı
interface ApiOrder {
  id: string;
  external_id: string;
  start_count: number;
  count: string;
  link_url: string;
  user?: string;
  status_name?: string;
  created?: string;
  service_name?: string;
}

const YoutubeViewerCheck = () => {
  const [apiKey, setApiKey] = useState('');
  const [ordersInput, setOrdersInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [refillContent, setRefillContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [inputMode, setInputMode] = useState<'csv' | 'json'>('json'); // Default olarak JSON modu

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
  };

  const extractVideoId = (url: string) => {
    let videoId = null;
    
    if (url.includes('anon.ws') || url.includes('r=http')) {
      try {
        const urlObj = new URL(url);
        const redirectParam = urlObj.searchParams.get('r');
        
        if (redirectParam) {
          url = decodeURIComponent(redirectParam);
          addLog(`Yönlendirme URL'si tespit edildi. Gerçek URL: ${url}`);
        }
      } catch (error) {
        addLog(`URL parse hatası: ${(error as Error).message}`);
      }
    }
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    
    return videoId;
  };

  const getViewsCount = async (url: string) => {
    try {
      const videoId = extractVideoId(url);
      
      if (!videoId) {
        addLog(`Geçersiz YouTube URL'si: ${url}`);
        return null;
      }
      
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        addLog(`Video bulunamadı: ${videoId}`);
        return null;
      }
      
      return parseInt(data.items[0].statistics.viewCount);
      
    } catch (error) {
      addLog(`İzlenme sayısı alınamadı (${url}): ${(error as Error).message}`);
      return null;
    }
  };

  const downloadRefillFile = () => {
    const blob = new Blob([refillContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'refill.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  };

  // CSV veya JSON verilerini parse et ve standart Order formatına dönüştür
  const parseOrders = (): Order[] => {
    const orders: Order[] = [];
    
    try {
      if (inputMode === 'json') {
        // JSON verisi parse etme
        let jsonData: ApiOrder[] = [];
        
        try {
          // Çıplak dizi halinde veya bir JSON objesi içinde olabilir
          const trimmedInput = ordersInput.trim();
          const parsedData = JSON.parse(trimmedInput);
          
          if (Array.isArray(parsedData)) {
            jsonData = parsedData;
          } else if (parsedData && typeof parsedData === 'object') {
            // Objenin içinde bir dizi alanı aramaya çalış
            const possibleArrays = Object.values(parsedData).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              jsonData = possibleArrays[0] as ApiOrder[];
            }
          }
        } catch (err) {
          // Belki JSON pasted from console, [{ ... }] formatında olabilir, bracket ekleyip deneyelim
          try {
            const formattedInput = `[${ordersInput}]`;
            jsonData = JSON.parse(formattedInput);
          } catch (innerErr) {
            addLog(`JSON parse hatası: ${(err as Error).message}`);
            return [];
          }
        }
        
        // API verilerini standart formata dönüştür
        jsonData.forEach(item => {
          if (item.external_id && item.start_count !== undefined && item.count && item.link_url) {
            orders.push({
              id: item.external_id,
              mainID: item.id,
              startCount: item.start_count,
              count: item.count,
              link: item.link_url
            });
          }
        });
      } else {
        // CSV verisi parse etme
        const orderLines = ordersInput.split('\n').filter(line => line.trim() !== '');
        
        for (const line of orderLines) {
          const parts = line.split(',');
          if (parts.length >= 5) {
            orders.push({
              id: parts[0].trim(),
              mainID: parts[1].trim(),
              startCount: parts[2].trim(),
              count: parts[3].trim(),
              link: parts[4].trim()
            });
          }
        }
      }
    } catch (error) {
      addLog(`Veri parse hatası: ${(error as Error).message}`);
    }
    
    return orders;
  };

  const checkOrders = async () => {
    if (!apiKey) {
      alert('Lütfen bir YouTube API anahtarı girin.');
      return;
    }
    
    if (!ordersInput) {
      alert('Lütfen sipariş bilgilerini girin.');
      return;
    }

    setIsLoading(true);
    setLogs([]);
    setRefillContent('');
    setShowResults(true);
    
    addLog('🚀 Bot başlatılıyor...');
    
    // Sipariş verilerini parse et
    const orders = parseOrders();
    
    if (orders.length === 0) {
      addLog('Hiç geçerli sipariş bulunamadı. Lütfen format kontrolü yapın.');
      setIsLoading(false);
      return;
    }
    
    addLog(`Toplam ${orders.length} sipariş işlenecek.`);
    
    // Refill ihtiyacı olanlara topla
    const refillNeeded: Array<{id: string; mainID: string; views: number; count: string | number}> = [];
    
    // Her siparişi kontrol et
    for (const order of orders) {
      addLog(`\nKontrol ediliyor: ${order.id}`);
      
      try {
        const expectedTotal = parseInt(order.startCount.toString()) + parseInt(order.count.toString());
        addLog(`Beklenen toplam: ${expectedTotal}`);
        
        const currentViews = await getViewsCount(order.link);
        
        if (currentViews === null) {
          addLog(`Video bulunamadı, atlanıyor! ID: ${order.id}`);
          continue;
        }
        
        addLog(`Mevcut izlenme: ${currentViews}`);
        
        if (currentViews >= expectedTotal) {
          addLog(`✅ Başarılı! ID: ${order.id}`);
        } else {
          addLog(`❌ Başarısız! ID: ${order.id}`);
          refillNeeded.push({
            id: order.id,
            mainID: order.mainID,
            views: currentViews,
            count: order.count
          });
        }
      } catch (error) {
        addLog(`Hata (ID: ${order.id}): ${(error as Error).message}`);
      }
    }
    
    // Refill sonuçlarını hazırla
    if (refillNeeded.length > 0) {
      // 1. Format: "id refill(views)"
      const refillLines = refillNeeded
        .map(item => `${item.id} refill(${item.views})`)
        .join('\n');
      
      // 2. Format: "id1,id2,id3"
      const idList = refillNeeded.map(item => item.mainID).join(',');
      
      // 3. Format: "id count tarih"
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}.${month}.${year}`;
      
      const idCountDate = refillNeeded
        .map(item => `${item.id} ${item.count} ${formattedDate}`)
        .join('\n');
      
      // Tüm içerikleri birleştir
      const finalContent = `${refillLines}\n\n${idList}\n\n${idCountDate}`;
      setRefillContent(finalContent);
      
      addLog(`\nRefill gereken ${refillNeeded.length} ID bulundu ve formatlar hazırlandı.`);
    } else {
      addLog('\nRefill gereken ID bulunamadı.');
    }
    
    addLog('\nİşlem tamamlandı! ✨');
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Youtube className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">YouTube İzlenme Kontrol Aracı</h1>
        <p className="text-gray-300">YouTube API kullanarak video izlenmelerini kontrol edin</p>
      </div>
      
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          YouTube API Anahtarı
        </h2>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="YouTube API Anahtarınızı Girin"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SOL SÜTUN - Sipariş Bilgileri */}
        <div className="w-full lg:w-1/2">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Sipariş Bilgileri</h2>
              
              <div className="flex bg-gray-900 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setInputMode('json')}
                  className={`px-4 py-2 text-sm ${
                    inputMode === 'json' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  JSON
                </button>
                <button 
                  onClick={() => setInputMode('csv')}
                  className={`px-4 py-2 text-sm ${
                    inputMode === 'csv' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>
            
            {inputMode === 'csv' ? (
              <>
                <p className="text-gray-300 mb-2">Her satıra bir sipariş olacak şekilde aşağıdaki formatta girin:</p>
                <code className="block bg-gray-900 p-3 rounded-lg text-sm font-mono text-gray-300 mb-4">
                  ID,mainID,startCount,count,link
                </code>
                
                <textarea
                  value={ordersInput}
                  onChange={(e) => setOrdersInput(e.target.value)}
                  placeholder="Örnek:&#10;4119760,1001,400,123,https://youtu.be/GPVd86Ipc5k&#10;4119761,1002,500,200,https://youtu.be/anotherVideoID"
                  rows={12}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 font-mono"
                />
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-2">API'den alınan JSON verisini yapıştırın:</p>
                <code className="block bg-gray-900 p-3 rounded-lg text-sm font-mono text-gray-300 mb-4 overflow-auto max-h-32">
                  {`[{
  "id": "59012088",
  "external_id": "4119725",
  "start_count": 23,
  "count": "1050",
  "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D-Fv0u9RJ_ig"
}]`}
                </code>
                
                <textarea
                  value={ordersInput}
                  onChange={(e) => setOrdersInput(e.target.value)}
                  placeholder="JSON verisi yapıştırın..."
                  rows={12}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 font-mono text-sm"
                />
              </>
            )}
            
            <button
              onClick={checkOrders}
              disabled={isLoading}
              className={`w-full px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-blue-500/50 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 transition-colors'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              {isLoading ? 'Kontrol Ediliyor...' : 'İzlenmeleri Kontrol Et'}
            </button>
          </div>
        </div>
        
        {/* SAĞ SÜTUN - Sonuçlar */}
        <div className="w-full lg:w-1/2">
          {showResults ? (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Sonuçlar</h2>
              
              {/* Log Çıktıları */}
              <div className="bg-gray-900 rounded-lg p-4 mb-4 h-64 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`${
                      log.includes('Başarılı') ? 'text-green-400' :
                      log.includes('Başarısız') ? 'text-red-400' :
                      log.includes('Kontrol ediliyor') ? 'text-yellow-400 font-bold mt-2' :
                      log.includes('Bot başlatılıyor') || log.includes('İşlem tamamlandı') 
                        ? 'text-blue-400 font-bold' 
                        : 'text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
              
              {/* Refill İçeriği */}
              {refillContent && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Refill İçeriği</h3>
                  <textarea
                    value={refillContent}
                    readOnly
                    rows={6}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-4 font-mono"
                  />
                  
                  <button
                    onClick={downloadRefillFile}
                    className="w-full px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Refill.txt İndir
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full border border-gray-700 flex flex-col items-center justify-center text-center">
              <div className="text-gray-400 mb-4">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Sonuçlar Burada Görünecek</h3>
                <p className="text-sm">
                  Sol taraftaki siparişleri kontrol ettiğinizde sonuçlar ve refill bilgileri burada gösterilecektir.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YoutubeViewerCheck;