import { useState } from "react"
import axios from "axios"

interface Order {
  id: number
  link: string
  start_count: number
  quantity: number
  external_id:number
}

interface TikTokData {
  url: string
  count: number | null
  error?: string
}

interface TikTokAnalyticsTabProps {
  serviceType: string
  endpoint: string
  label: string
}

export function TikTokAnalyticsTab({ serviceType, endpoint, label }: TikTokAnalyticsTabProps) {
  const [ids, setIds] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [tikTokData, setTikTokData] = useState<TikTokData[]>([])
 const handleLinkClick = (link: string) => {
    // TikTok link'i ise direkt aç, değilse TikTok profil URL'si oluştur
    const url = link.startsWith("http") ? link : `https://www.tiktok.com/@${link}`
    window.open(url, "_blank", "noopener,noreferrer")
  }
  const [loading, setLoading] = useState(false)
const handleDownload = () => {
  if (orders.length === 0 || tikTokData.length === 0) return;

  const belowTargetData: {
    id: number;
    link: string;
    missing: number;
    external_id:number
    currentCount:number
  }[] = [];

  const aboveTargetIds: number[] = [];

  orders.forEach((order) => {
    const username = order.link;
    const tikTokInfo = tikTokData.find((t) => t.url === username);

    if (!tikTokInfo || tikTokInfo.count === null) return;

    const targetCount = order.quantity + order.start_count;
    const currentCount = tikTokInfo.count;

    if (currentCount < targetCount) {
      const missing = targetCount - currentCount;
      belowTargetData.push({
        currentCount:currentCount,
        id: order.id,
        link: order.link,
        missing,
        external_id:order.external_id
      });
    } else {
      aboveTargetIds.push(order.id);
    }
  });

  const downloadTxt = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
 const missingtotal = Number(belowTargetData
  .filter(item => item.currentCount !== -1)
  .reduce((total, item) => total + item.missing, 0)) * 0.00045
  console.log(missingtotal,"missingtotal")

    const aboveContent = aboveTargetIds.join(",") || "x"
    const notFound = belowTargetData.filter(item => item.currentCount === - 1).map((d) => d.id).join(",") || "x"
    const idsLine = belowTargetData.filter(item => item.currentCount !== - 1).map((d) => d.id).join(",") || "x"
    const refillExternal = belowTargetData.filter(item => item.currentCount !== - 1).map((d) => d.external_id).join(",") || "x"
    const refillLines = belowTargetData.filter(item => item.currentCount !== - 1).map((d) => `${d.external_id} refill(${d.currentCount}) => missing amount(${d.missing})`).join("\n") || "x"
    const detailLines = belowTargetData.filter(item => item.currentCount !== - 1).map((d) => `3 | ${d.link} | ${d.missing}`)
    
      .join("\n") || "x"

    const finalContent = `refill main ids\n--------------------\n${idsLine}\n\nrefill provider ids\n--------------------\n${refillExternal}\n\nrefill provider format\n--------------------\n${refillLines}\n\nrefill mass order format - ($${missingtotal})\n--------------------\n${detailLines}\n\nnot found ids\n--------------------\n${notFound}\n\nsuccess main id\n--------------------\n${aboveContent}`;
    downloadTxt("results.txt", finalContent);
};

  const fetchOrdersFromApi = async (ids: string) => {
    setLoading(true)

    try {
      const formattedIdsArray = ids
        .trim()
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "")

      if (formattedIdsArray.length === 0) {
        throw new Error("No valid IDs found")
      }

      const chunkSize = 100
      const chunks = []

      // ID'leri 100'erli gruplara ayır
      for (let i = 0; i < formattedIdsArray.length; i += chunkSize) {
        chunks.push(formattedIdsArray.slice(i, i + chunkSize))
      }

      const allResults = []

      for (let i = 0; i < chunks.length; i++) {
        const response = await axios.post("https://youtuberefill-1.onrender.com/api/orders", {
          ids: chunks[i].join(","),
        })

        if (!response.data || !Array.isArray(response?.data?.data?.list)) {
          throw new Error(`API returned invalid data for chunk ${i + 1}`)
        }

        const chunkResults = response.data.data.list

        // Doğru indexlerde ekle
        for (let j = 0; j < chunkResults.length; j++) {
          const resultIndex = i * chunkSize + j
          allResults[resultIndex] = chunkResults[j]
        }
      }

      setOrders(allResults)
      return allResults
    } catch (err) {
      console.error("Order fetch error", err)
      return []
    } finally {
      setLoading(false)
    }
  }
  const fetchTikTokData = async (links: string[]) => {
    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        links,
      })
      setTikTokData(response.data.data)
    } catch (err) {
      console.error(`${serviceType} API fetch error:`, err)
    }
  }

  const handleFetch = async () => {
    const orderData = await fetchOrdersFromApi(ids)
    const usernames = Array.from(
      new Set(
        orderData.map((order: Order) => order.link),
      ),
    )
    await fetchTikTokData(usernames)
  }

  const getMetricLabel = () => {
    switch (serviceType) {
      case "followers":
        return "Followers"
      case "likes":
        return "Likes"
      case "views":
        return "Views"
      case "saves":
        return "Saves"
      case "shares":
        return "Shares"
      default:
        return "Count"
    }
  }

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
              />
            </svg>
            {label} Orders Analysis
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Order ID'leri (virgül ile ayırın)</label>
            <textarea
              rows={3}
              value={ids}
              onChange={(e) => setIds(e.target.value)}
              placeholder="Order IDs (e.g. 12345,67890)"
              className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <button
            onClick={handleFetch}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Fetch {label} Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {label} Results
          </h2>
          {orders.length > 0 && (
            <div className="flex items-center gap-4">
              <button
  onClick={handleDownload}
  className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-500 flex items-center gap-2 transition duration-200"
>
  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
  result.txt indir
</button>

            </div>
          )}
        </div>

        
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No data yet</h3>
              <p className="text-gray-500">Enter Order IDs and start the {label.toLowerCase()} analysis</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Order ID</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Link</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Start Count</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Quantity</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Current {getMetricLabel()}</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Drop Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const username = order.link
                    const tikTokInfo = tikTokData.find((t) => t.url === username)
                    const targetCount = order.quantity + order.start_count
                    const currentCount = tikTokInfo?.count || -1
                    const isBelowTarget = tikTokInfo?.count !== -1 && currentCount < targetCount
                    const difference = targetCount - currentCount
                    const dropRate = isBelowTarget ? (difference / order.quantity) * 100 : 0

                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-gray-700 transition-colors duration-200 ${
                          isBelowTarget
                            ? dropRate >= 100
                              ? "bg-purple-950 hover:bg-purple-800"
                              : "bg-red-900/30 hover:bg-red-900/40"
                            : "hover:bg-gray-700/50"
                        }`}
                      >
                        <td className="py-4 px-4">
                          <span className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                            #{order.id}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleLinkClick(order.link)}
                            className="max-w-xs truncate text-blue-400 hover:text-blue-300 transition-colors cursor-pointer underline hover:no-underline"
                          >
                            {order.link}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300 font-medium">{order.start_count}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-green-400 font-medium">+{order.quantity}</span>
                        </td>
                        <td className="py-4 px-4">
                          {tikTokInfo ? (
                            tikTokInfo.count !== null ? (
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold">{tikTokInfo.count === -1 ? "not found":tikTokInfo.count.toLocaleString()}</span>
                                {isBelowTarget &&  (
                                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                      />
                                    </svg>
                                    -{difference}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-red-400">❌</span>
                                <span className="text-red-400 text-sm">{tikTokInfo.error}</span>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-gray-400 text-sm">Loading...</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {tikTokInfo ? (
                            isBelowTarget ? (
                              <div className="flex items-center gap-2">
                                <span className="text-red-400 font-semibold">{dropRate.toFixed(1)}%</span>
                                <div className="w-20 bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(dropRate, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : tikTokInfo?.count === -1 ? (
                              <span className="text-red-400 font-semibold">❌</span>
                            ) : (
                              <span className="text-green-400 font-semibold">✓ Target Met</span>
                            )
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-gray-400 text-sm">Loading...</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}