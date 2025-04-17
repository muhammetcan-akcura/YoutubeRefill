import React, { useState } from 'react';
import axios from 'axios';
import { TabType, Order, RefillItem } from './types';
import { getViewsCount, getLikesCount, getSubscriberCount, checkVideoAccessibility } from './utils/youtubeUtils';

import Header from './components/header';
import TabSelector from './components/tabSelector';
import ApiKeyInput from './components/apiKeyInput';
import ResultsPanel from './components/resultsPanel';
import InfoPanel from './components/infoPanel';

const YoutubeStatsChecker: React.FC = () => {
  const [apiKey, setApiKey] = useState('AIzaSyDV0NEOodg0b55bp-HctMYuDWmIFq318K8');
  const [orderIds, setOrderIds] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [refillContent, setRefillContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('views');
  const [adminApiKey, setAdminApiKey] = useState('');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const downloadRefillFile = () => {
    const blob = new Blob([refillContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonuçlar_${activeTab}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  };

  const fetchOrdersFromApi = async (ids: string) => {
    try {
      addLog(`🔍 API'den sipariş verileri alınıyor...`);
      
      const formattedIds = ids.trim().split(',').map(id => id.trim()).filter(id => id !== '').join(',');
      
      if (!formattedIds) {
        throw new Error('Geçerli ID bulunamadı');
      }
    
    const response = await axios.post('https://youtuberefill-1.onrender.com/api/orders', {
      ids: formattedIds,
      apikey:adminApiKey,
      limit:1000
    });
  
      
      if (!response.data || !Array.isArray(response?.data?.data?.list)) {
        throw new Error('API geçersiz veri döndürdü');
      }
      return response.data;
    } catch (error) {
      let errorMessage = 'API isteği başarısız';
      if (error instanceof Error) {
        errorMessage = `API isteği başarısız: ${error.message}`;
      }
      addLog(`❌ ${errorMessage}`);
      throw error;
    }
  };

  const checkOrders = async () => {
    if (!apiKey) {
      alert('Lütfen bir YouTube API anahtarı girin.');
      return;
    }
    
    if (!orderIds) {
      alert('Lütfen sipariş ID\'lerini girin.');
      return;
    }

    setIsLoading(true);
    setLogs([]);
    setRefillContent('');
    setShowResults(true);
    
    let serviceLabel = '';
    switch (activeTab) {
      case 'views': serviceLabel = 'İzlenme'; break;
      case 'likes': serviceLabel = 'Beğeni'; break;
      case 'subscribers': serviceLabel = 'Abone'; break;
      case 'embed': serviceLabel = 'embed'; break;
    }
    
    addLog(`🚀 Bot başlatılıyor... (${serviceLabel} kontrolü)`);
    
    try {
      const apiOrdersData = await fetchOrdersFromApi(orderIds);
      console.log(apiOrdersData)
      
      const orders: Order[] = apiOrdersData?.data?.list?.map((apiOrder: any) => ({
        id: apiOrder.external_id || apiOrder.id,
        mainID: apiOrder.id,
        startCount: apiOrder.start_count,
        count: apiOrder.quantity,
        link: apiOrder.link_url || apiOrder.link,
        mainLink: apiOrder.link
      }));
      console.log(orders)
      
      if (orders.length === 0) {
        addLog('Hiç geçerli sipariş bulunamadı.');
        setIsLoading(false);
        return;
      }
      
      addLog(`Toplam ${orders.length} sipariş işlenecek.`);
      
      // Refill ihtiyacı olanlara topla
      const refillNeeded: RefillItem[] = [];
      
      // Her siparişi kontrol et
      for (const order of orders) {
        addLog(`\nKontrol ediliyor: ${order.id}`);
        
        try {
          const expectedTotal = parseInt((order.startCount || 0).toString()) + parseInt((order.count || 0).toString());
          addLog(`Beklenen toplam: ${expectedTotal}`);
          
          let currentCount = null;
          
          // Aktif sekmeye göre farklı kontroller yap
          switch (activeTab) {
            case 'views':
              currentCount = await getViewsCount(order.link, apiKey, addLog);
              break;
            case 'likes':
              currentCount = await getLikesCount(order.link, apiKey, addLog);
              break;
            case 'subscribers':
              currentCount = await getSubscriberCount(order.link, apiKey, addLog);
              break;
            case 'embed':
              const accessResult = await checkVideoAccessibility(order.link, addLog);
              if (accessResult.accessible) {
                addLog(`✅ Başarılı! Video erişilebilir: ${accessResult.title}`);
              } else {
                addLog(`❌ Başarısız! Video erişilemez. Sebep: ${accessResult.error}`);
                
                // Hata bilgisi ile birlikte refill listesine ekle
                refillNeeded.push({
                  id: order.id,
                  mainID: order.mainID,
                  count: order.count,
                  currentCount: 0,
                  errorReason: accessResult.error,
                  link: order.link,
                  mainLink: order.mainLink
                });
              }
              continue; // Diğer işlemleri atla
          }
          
          if (currentCount === null) {
            const itemType = activeTab === 'subscribers' ? 'Kanal' : 'Video';
            addLog(`${itemType} bulunamadı, atlanıyor! ID: ${order.id}`);
            continue;
          }
          
          const countLabel = activeTab === 'views' ? 'izlenme' : 
                           activeTab === 'likes' ? 'beğeni' :
                           activeTab === 'subscribers'? 'abone' : 'embed';
          addLog(`Mevcut ${countLabel}: ${currentCount}`);
          
          if (currentCount >= expectedTotal) {
            addLog(`✅ Başarılı! ID: ${order.id}`);
          } else {
            addLog(`❌ Başarısız! ID: ${order.id}`);
            refillNeeded.push({
              id: order.id,
              mainID: order.mainID,
              count: order.count,
              currentCount
            });
          }
        } catch (error) {
          addLog(`Hata (ID: ${order.id}): ${(error as Error).message}`);
        }
      }
      
      // Refill sonuçlarını hazırla
      if (refillNeeded.length > 0) {
        if (activeTab === 'embed') {
          // Embed için hata sebepleriyle birlikte liste oluştur
         refillNeeded.map(item => {
            // Hata sebeplerini error field'ından alıp daha kullanıcı dostu hale getir
            let errorReason = '';
            if (item.errorReason === 'not_found') {
              errorReason = 'not_found';
            } else if (item.errorReason === 'embedding_disabled') {
              errorReason = 'embedding_disabled';
            } else if (item.errorReason === 'invalid_url') {
              errorReason = 'invalid_url';
            } else if (item.errorReason === 'api_error') {
              errorReason = 'api_error';
            } else {
              errorReason = 'Unknown error';
            }
            
            return `${item.mainID} - [${errorReason}] - ${item.mainLink}`;
          }).join('\n');
          
          // ID listesi
          
          
          // Tarihli detaylı liste
          const currentDate = new Date();
          const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${currentDate.getFullYear()}`;
          
          const detailedList = refillNeeded.map(item => {
            return `${item.mainID} - Error: [ ${item.errorReason || 'Unknown'} ] - ${item.mainLink}`;
          }).join('\n');
          
          const finalContent = `\nReports Detail (${formattedDate}):\n${detailedList}`;
          
          setRefillContent(finalContent);
          addLog(`\nErişilemeyen ${refillNeeded.length} video tespit edildi ve rapor hazırlandı.`);
        } else {

        
          
          const refillLines = refillNeeded
            .map(item => `${item.id} refill(${item.currentCount})`)
            .join('\n');
          
          const idList = refillNeeded.map(item => item.mainID).join(',');
          const finalContent = `${refillLines}\n\n${idList}\n`;
          setRefillContent(finalContent);
          
          addLog(`\nRefill gereken ${refillNeeded.length} ID bulundu ve formatlar hazırlandı.`);
        }
      } else {
        if (activeTab === 'embed') {
          addLog('\nTüm videolar erişilebilir durumda.');
        } else {
          addLog('\nRefill gereken ID bulunamadı.');
        }
      }
    } catch (error) {
      addLog(`İşlem sırasında hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedApiKeys = [
    { 
      id: '1', 
      value: 'AIzaSyDV0NEOodg0b55bp-HctMYuDWmIFq318K8', 
      label: '(1) API Anahtarı' 
    },
    { 
      id: '2', 
      value: 'AIzaSyBlNj54R7YYNwco8hbV_njjxLR3uLkKMGA', 
      label: '(2) API Anahtarı' 
    },
    {
      id: '3', 
      value: 'AIzaSyD-py3Wl5kn3UPZ0VRgU-2Da9XH0S5mHRs', 
      label: '(3) API Anahtarı' 
    },
    {
      id: '4', 
      value: 'AIzaSyBtBIXjPHa3UnZ1mS5igeycAHbrOfZaaDA', 
      label: '(4) API Anahtarı' 
    },
    {
      id: '5', 
      value: 'AIzaSyC86HtI48jCMFSOw3ib7XjmgvaYibaHYUk', 
      label: '(5) API Anahtarı' 
    },
    {
      id: '6', 
      value: ' AIzaSyBjBAdDGbN7ttYxC-sdnqV2q1rkUEwdQfc', 
      label: '(6) API Anahtarı' 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <ApiKeyInput 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
        apiKeys={predefinedApiKeys} 
      />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SOL SÜTUN - Sipariş Bilgileri */}
        <div className="w-full lg:w-1/2">
          <OrdersIdInput 
            orderIds={orderIds}
            setOrderIds={setOrderIds}
            activeTab={activeTab}
            isLoading={isLoading}
            checkOrders={checkOrders}
            adminApiKey={adminApiKey}
            setAdminApiKey={setAdminApiKey}
          />
        </div>
        
        {/* SAĞ SÜTUN - Sonuçlar */}
        <div className="w-full lg:w-1/2">
          <ResultsPanel
            showResults={showResults}
            logs={logs}
            refillContent={refillContent}
            downloadRefillFile={downloadRefillFile}
            activeTab={activeTab}
          />
        </div>
      </div>
      
      <InfoPanel />
    </div>
  );
};

// New component for Order IDs input
interface OrdersIdInputProps {
  orderIds: string;
  setOrderIds: (value: string) => void;
  activeTab: TabType;
  isLoading: boolean;
  checkOrders: () => void;
  adminApiKey: string;
  setAdminApiKey: (key: string) => void;
}

const OrdersIdInput: React.FC<OrdersIdInputProps> = ({
  orderIds,
  setOrderIds,
  activeTab,
  isLoading,
  checkOrders,
  adminApiKey,
  setAdminApiKey
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'views': return 'İzlenme Kontrolü';
      case 'likes': return 'Beğeni Kontrolü';
      case 'subscribers': return 'Abone Kontrolü';
      case 'embed': return 'Embed Kontrolü';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">{getTabTitle()} - Sipariş ID'leri</h2>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Admin API Anahtarı</label>
        <input
          type="text"
          value={adminApiKey}
          onChange={(e) => setAdminApiKey(e.target.value)}
          placeholder="Admin API anahtarını girin"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
        />
      </div>
      
      <div>
        <label className="block text-gray-300 mb-2">Sipariş ID'leri (virgülle ayırın)</label>
        <textarea
          value={orderIds}
          onChange={(e) => setOrderIds(e.target.value)}
          placeholder="Örnek: 656565, 65656565, 656566"
          rows={8}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 font-mono"
        />
      </div>
      
      <button
        onClick={checkOrders}
        disabled={isLoading}
        className={`w-full px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
          isLoading 
          ? 'bg-blue-500/50 cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-600 transition-colors'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            İşlem Devam Ediyor...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {
              activeTab === 'views' ? 'İzlenmeleri Kontrol Et' :
              activeTab === 'likes' ? 'Beğenileri Kontrol Et' :
              activeTab === 'subscribers' ? 'Aboneleri Kontrol Et' :
              'Embed Kontrol Et'
            }
          </>
        )}
      </button>
    </div>
  );
};

export default YoutubeStatsChecker;