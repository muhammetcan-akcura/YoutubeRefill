import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { TabType } from '../types';

interface OrdersInputProps {
  ordersInput: string;
  setOrdersInput: (value: string) => void;
  inputMode: 'csv' | 'json';
  setInputMode: (mode: 'csv' | 'json') => void;
  activeTab: TabType;
  isLoading: boolean;
  checkOrders: () => void;
}

const OrdersInput: React.FC<OrdersInputProps> = ({
  ordersInput,
  setOrdersInput,
  inputMode,
  setInputMode,
  activeTab,
  isLoading,
  checkOrders
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'views': return 'İzlenme Kontrolü';
      case 'likes': return 'Beğeni Kontrolü';
      case 'subscribers': return 'Abone Kontrolü';
      case 'embed': return 'Embed Kontrolü';
    }
  };

  // OrdersInput bileşenindeki getInputPlaceholder ve getJsonExample fonksiyonlarını güncelle
const getInputPlaceholder = () => {
    if (inputMode === 'csv') {
      if (activeTab === 'embed') {
        return `Örnek:
  4119760,1001,1,1,https://youtu.be/videoID
  4119761,1002,1,1,https://youtu.be/anotherVideoID`;
      }
      
      return `Örnek:
  4119760,1001,400,123,${activeTab === 'subscribers' ? 'https://youtube.com/channel/UCxxx' : 'https://youtu.be/videoID'}
  4119761,1002,500,200,${activeTab === 'subscribers' ? 'https://youtube.com/@username' : 'https://youtu.be/anotherVideoID'}`;
    } else {
      return "JSON verisi yapıştırın...";
    }
  };
  
  const getJsonExample = () => {
    let link;
    switch(activeTab) {
      case 'subscribers':
        link = "https://youtube.com/channel/UCxxx";
        break;
      case 'embed':
        link = "https://youtube.com/watch?v=videoID";
        break;
      default:
        link = "https://youtube.com/watch?v=-Fv0u9RJ_ig";
    }
    
    return `[{
    "id": "59012088",
    "external_id": "4119725",
    "start_count": ${activeTab === 'embed' ? '1' : '23'},
    "count": "${activeTab === 'embed' ? '1' : '1050'}",
    "link_url": "${link}"
  }]`;
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">{getTabTitle()} - Sipariş Bilgileri</h2>
        
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
            placeholder={getInputPlaceholder()}
            rows={12}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 font-mono"
          />
        </>
      ) : (
        <>
          <p className="text-gray-300 mb-2">API'den alınan JSON verisini yapıştırın:</p>
          <code className="block bg-gray-900 p-3 rounded-lg text-sm font-mono text-gray-300 mb-4 overflow-auto max-h-32">
            {getJsonExample()}
          </code>
          
          <textarea
            value={ordersInput}
            onChange={(e) => setOrdersInput(e.target.value)}
            placeholder={getInputPlaceholder()}
            rows={12}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 font-mono text-sm"
          />
        </>
      )}
      
      <button
        onClick={checkOrders}
        className={`w-full px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
          isLoading 
          ? 'bg-blue-500/50' 
            : 'bg-blue-500 hover:bg-blue-600 transition-colors'
        }`}
      >
        <CheckCircle2 className="w-5 h-5" />
        {
          activeTab === 'views' ? 'İzlenmeleri Kontrol Et' :
          activeTab === 'likes' ? 'Beğenileri Kontrol Et' :
          activeTab === 'subscribers' ? 'Aboneleri Kontrol Et' :
          'Embed Kontrol Et'
        }
      </button>
    </div>
  );
};

export default OrdersInput;