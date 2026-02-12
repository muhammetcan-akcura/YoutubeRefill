import React, { useState } from 'react';
import axios from 'axios';
import { TabType, Order, RefillItem } from './types';
import { getViewsCount, getLikesCount, getSubscriberCount, checkVideoAccessibility } from './utils/youtubeUtils';
import Header from './components/header';
import TabSelector from './components/tabSelector';
import ResultsPanel from './components/resultsPanel';


const YoutubeStatsChecker: React.FC = () => {
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
    a.download = `results_${activeTab}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const fetchOrdersFromApi = async (ids: string) => {
    try {
      addLog(`🔍 Fetching order data from API...`);

      const formattedIdsArray = ids
        .trim()
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '');

      if (formattedIdsArray.length === 0) {
        throw new Error('No valid IDs found');
      }

      const chunkSize = 100;
      const chunks: string[][] = [];

      // ID'leri 100'erli gruplara ayır
      for (let i = 0; i < formattedIdsArray.length; i += chunkSize) {
        chunks.push(formattedIdsArray.slice(i, i + chunkSize));
      }

      const allResults: any[] = [];

      // Her bir grubu sırayla API'ye gönder
      for (let i = 0; i < chunks.length; i++) {
        addLog(`📦 Sending chunk ${i + 1}/${chunks.length} to API...`);

        const response = await axios.post(`https://youtuberefill-1.onrender.com/api/orders`, {
          ids: chunks[i].join(','),
        });

        if (!response.data || !Array.isArray(response?.data?.data?.list)) {
          throw new Error(`API returned invalid data for chunk ${i + 1}`);
        }

        // Her chunk için gelen sonuçları doğru sırada ekle
        let chunkResults = response.data.data.list;

        // Gelen diziyi ters çevir
        chunkResults = chunkResults.reverse();

        // Sonuçları 'chunkResults' dizisinden sırasıyla 'allResults' dizisine ekle
        for (let j = 0; j < chunkResults.length; j++) {
          const resultIndex = i * chunkSize + j;  // Her chunk'ın sonucu için doğru index hesapla
          allResults[resultIndex] = chunkResults[j];  // Sıralama korunarak ekle
        }
      }



      return {
        data: {
          list: allResults,
        },
      };
    } catch (error) {
      let errorMessage = 'API request failed';
      if (error instanceof Error) {
        errorMessage = `API request failed: ${error.message}`;
      }
      addLog(`❌ ${errorMessage}`);
      throw error;
    }
  };


  const checkOrders = async () => {

    if (!orderIds) {
      alert('Please enter order IDs.');
      return;
    }

    setIsLoading(true);
    setLogs([]);
    setRefillContent('');
    setShowResults(true);

    let serviceLabel = '';
    switch (activeTab) {
      case 'views': serviceLabel = 'Views'; break;
      case 'likes': serviceLabel = 'Likes'; break;
      case 'subscribers': serviceLabel = 'Subscribers'; break;
      case 'embed': serviceLabel = 'Embed'; break;
    }

    addLog(`🚀 Starting bot... (${serviceLabel} check)`);

    try {
      const apiOrdersData = await fetchOrdersFromApi(orderIds);

      const orders: Order[] = apiOrdersData?.data?.list?.map((apiOrder: any) => ({
        id: apiOrder.external_id || apiOrder.id,
        mainID: apiOrder.id,
        startCount: apiOrder.start_count,
        count: apiOrder.quantity,
        link: apiOrder.link_url || apiOrder.link,
        mainLink: apiOrder.link

      }));
    //  console.log(orders[0].startCount)

      if (orders.length === 0) {
        addLog('No valid orders found.');
        setIsLoading(false);
        return;
      }

      addLog(`Processing ${orders.length} orders in total.`);

      // Collect items that need refill
      const refillNeeded: RefillItem[] = [];
      const refillNotNeed :any = []





      // Check each order
      for (const order of orders) {
        addLog(`\nChecking: ${order.mainID}`);

        try {
          const expectedTotal = parseInt((order.startCount || 0).toString()) + parseInt((order.count || 0).toString());
          addLog(`Expected total: ${expectedTotal}`);

          let currentCount = null;

          // Different checks based on active tab
          switch (activeTab) {
            case 'views':
              currentCount = await getViewsCount(order.link, addLog);
              break;
            case 'likes':
              currentCount = await getLikesCount(order.link, addLog);
              break;
            case 'subscribers':
              currentCount = await getSubscriberCount(order.link, addLog);
              break;
            case 'embed':
              const accessResult = await checkVideoAccessibility(order.link, addLog);
              if (accessResult.accessible) {
                addLog(`✅ Success! Video is accessible`);
                 refillNotNeed.push({
                  id: order.id,
                  mainID: order.mainID,
                  count: order.count,
                  currentCount: 0,
               
                  link: order.link,
                  mainLink: order.mainLink,
                  startCount: order.startCount
                });

              } else {
                addLog(`❌ Failed! Video not accessible`);

                // Add to refill list with error information
                refillNeeded.push({
                  id: order.id,
                  mainID: order.mainID,
                  count: order.count,
                  currentCount: 0,
                 
                  link: order.link,
                  mainLink: order.mainLink,
                  startCount: order.startCount
                });
              }
              continue; // Skip other operations
          }

          if (currentCount === null) {
            const itemType = activeTab === 'subscribers' ? 'Channel' : 'Video';
            addLog(`⚠️ ${itemType} not found, skipping! ID: ${order.id}`);
            continue;
          }

          const countLabel = activeTab === 'views' ? 'views' :
            activeTab === 'likes' ? 'likes' :
              activeTab === 'subscribers' ? 'subscribers' : 'embed';
          addLog(`Current ${countLabel}: ${currentCount}`);

          if (currentCount >= expectedTotal) {
            addLog(`✅ Success! ID: ${order.id}`);
             refillNotNeed.push({
              id: order.id,
              mainID: order.mainID,
              count: order.count,
              startCount: order.startCount,
              link:order.link,
              currentCount
            });
            
          } else {
            addLog(`❌ Failed! ID: ${order.id}`);
            refillNeeded.push({
              id: order.id,
              mainID: order.mainID,
              count: order.count,
              startCount: order.startCount,
              link:order.link,
              currentCount
            });
          }
        } catch (error) {
          addLog(`Error (ID: ${order.id}): ${(error as Error).message}`);
        }
      }

      // Prepare refill results
      if (refillNeeded.length > 0) {
        if (activeTab === 'embed') {
          // Create list with error reasons for embed check
          refillNeeded.map(item => {
            // Transform error reasons to more user-friendly format
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

          // Date-formatted detailed list
          const currentDate = new Date();
          const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${currentDate.getFullYear()}`;

          const detailedList = refillNeeded.map(item => {
            return `${item.mainID},`
          })
          const successOrderId = refillNotNeed.map((item:any) => {
            return `${item.mainID},`
          })
          console.log(successOrderId,"successOrderId")

          const finalContent = `\nReports Detail (${formattedDate}):\n${detailedList}`;

          setRefillContent(finalContent);
          addLog(`\n${refillNeeded.length} inaccessible videos detected and report prepared.`);
        } else {

console.log(refillNeeded.map((item: any) => {
    return {
        link: item.link,
        quantity: (item.count + item.startCount) - item.currentCount
    }}))
    const successOrderId = refillNotNeed.map((item:any) => {
            return `${item.mainID}`
          })
          console.log(successOrderId.join(","),"successOrderId")
const missingOver90 :any= [];
const onlyrefill :any= [];
          const refillLines = refillNeeded
            //  .map(item => `${item.id} refill(${item.currentCount}) | missing amount: ${Number(item.startCount)+Number(item.count) - Number(item.currentCount)} | %${((100 / Number(item.count)) * (Number(item.startCount)+Number(item.count) - Number(item.currentCount))).toFixed(0)  }`)
            .map(item => {
  const totalNeeded = Number(item.count) + Number(item.startCount);
  const current = Number(item.currentCount);
  const missingAmount = totalNeeded - current;
  const missingPercent = missingAmount / (Number(item.count) / 100) 
  if (current < Number(item.startCount)) {
    return `${item.mainID}: bellow start count ${item.currentCount} - ${item.startCount}`;
  }

   if (current >= Number(item.startCount)) {
    onlyrefill.push(item.mainID); 
  }

  if (missingAmount >= 50) {
    missingOver90.push(item.mainID); 
  }

  return `${item.id} refill(${current}) | misssing amount: ${missingAmount} | %${missingPercent.toFixed(0)}`;
}).join('\n');


console.log('IDs with over 50> missing:', missingOver90.join(","));
let totalQuantity = 0;

const massorder = ""
// refillNeeded.map((item: any) => {
//   const quantity = (item.count + item.startCount) - item.currentCount;
//   totalQuantity += quantity;
//   return `1 | ${item.link} | ${quantity}`;
// }).join("\n");

console.log("Toplam Quantity:", totalQuantity);
          const idList = refillNeeded.map(item => item.mainID).join(',');
          const finalContent = `${refillLines}\n\n${idList}\n\n\n ${massorder}`;
          setRefillContent(finalContent);

          addLog(`\n${refillNeeded.length} IDs requiring refill found and formats prepared.`);
        }
      } else {
        if (activeTab === 'embed') {
          addLog('\nAll videos are accessible.');
        } else {
          addLog('\nNo IDs requiring refill found.');
        }
      }
    } catch (error) {
      addLog(`Error occurred during process: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />

      <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN - Order Information */}
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

        {/* RIGHT COLUMN - Results */}
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
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'views': return 'views control';
      case 'likes': return 'likes control';
      case 'subscribers': return 'subscribers control';
      case 'embed': return 'embed control';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">{getTabTitle()}</h2>
      </div>

      <div>
        <label className="block text-gray-300 mb-2">order Ids (separate by comma)</label>
        <textarea
          value={orderIds}
          onChange={(e) => setOrderIds(e.target.value)}
          placeholder="example: 656565, 65656565, 656566"
          rows={8}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 font-mono"
        />
      </div>

      <button
        onClick={checkOrders}
        disabled={isLoading}
        className={`w-full px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${isLoading
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
            Processing...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {
              activeTab === 'views' ? 'Check views' :
                activeTab === 'likes' ? 'Check likes' :
                  activeTab === 'subscribers' ? 'Check subscribers' :
                    'Check embed'
            }
          </>
        )}
      </button>
    </div>
  );
};

export default YoutubeStatsChecker;