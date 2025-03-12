import React, { useState } from 'react';
import { TabType, Order, RefillItem } from './types';
import { getViewsCount, getLikesCount, getSubscriberCount, parseOrders, checkVideoAccessibility } from './utils/youtubeUtils';

import Header from './components/header';
import TabSelector from './components/TabSelector';
import ApiKeyInput from './components/apiKeyInput';
import OrdersInput from './components/ordersInput';
import ResultsPanel from './components/resultsPanel';
import InfoPanel from './components/infoPanel';

const YoutubeStatsChecker: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [ordersInput, setOrdersInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [refillContent, setRefillContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [inputMode, setInputMode] = useState<'csv' | 'json'>('json');
  const [activeTab, setActiveTab] = useState<TabType>('views');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
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
    
    let serviceLabel = '';
    switch (activeTab) {
      case 'views': serviceLabel = 'İzlenme'; break;
      case 'likes': serviceLabel = 'Beğeni'; break;
      case 'subscribers': serviceLabel = 'Abone'; break;
      case 'embed': serviceLabel = 'embed'; break;
    }
    
    addLog(`🚀 Bot başlatılıyor... (${serviceLabel} kontrolü)`);
    
    // Sipariş verilerini parse et
    const orders = parseOrders(ordersInput, inputMode, addLog);
    
    if (orders.length === 0) {
      addLog('Hiç geçerli sipariş bulunamadı. Lütfen format kontrolü yapın.');
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
                    mainLink:order.mainLink,
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
                          activeTab === 'subscribers'? 'abone' : 'embed'
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
        addLog(`Hata (1ID: ${order.id}): ${(error as Error).message}`);
      }
    }
    
    // Refill sonuçlarını hazırla
if (refillNeeded.length > 0) {
    if (activeTab === 'embed') {
      // Embed için hata sebepleriyle birlikte liste oluştur
      const errorDetails = refillNeeded.map(item => {
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
      const idList = refillNeeded.map(item => item.id).join(',');
      
      // Tarihli detaylı liste
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${currentDate.getFullYear()}`;
      
      const detailedList = refillNeeded.map(item => {
        return `${item.mainID} - Error: [ ${item.errorReason || 'Unkown'} ] - ${item.mainLink}`;
      }).join('\n');
      
      //const finalContent = `Erişilemeyen Videolar:\n${errorDetails}\n\nID Listesi:\n${idList}\n\nReports Detail (${formattedDate}):\n${detailedList}`;
      const finalContent = `\nReports Detail (${formattedDate}):\n${detailedList}`;
      
      setRefillContent(finalContent);
      addLog(`\nErişilemeyen ${refillNeeded.length} video tespit edildi ve rapor hazırlandı.`);
    } else {
      // Diğer sekmeler için normal refill formatı
      const countLabel = activeTab === 'views' ? 'views' : 
                        activeTab === 'likes' ? 'likes' : 'subs';
      
      const refillLines = refillNeeded
        .map(item => `${item.id} refill(${item.currentCount})`)
        .join('\n');
      
      const idList = refillNeeded.map(item => item.mainID).join(',');
      
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}.${month}.${year}`;
      
      const idCountDate = refillNeeded
        .map(item => `${item.id} ${item.count} ${formattedDate}`)
        .join('\n');
      
      const finalContent = `${refillLines}\n\n${idList}\n\n${idCountDate}`;
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
}

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
          <OrdersInput 
            ordersInput={ordersInput}
            setOrdersInput={setOrdersInput}
            inputMode={inputMode}
            setInputMode={setInputMode}
            activeTab={activeTab}
            isLoading={isLoading}
            checkOrders={checkOrders}
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

export default YoutubeStatsChecker;