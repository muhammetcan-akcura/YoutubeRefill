import { useMemo } from "react"
import axios from "axios"
import type React from "react"
import { useState } from "react"

interface Order {
  id: number
  link: string
  start_count: number
  quantity: number
  partial?: boolean | number
  status: string
}

interface TwitterData {
  username: string
  followers_count: number | null
  error?: string
}

const App: React.FC = () => {
  const [ids, setIds] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [twitterData, setTwitterData] = useState<TwitterData[]>([])
  const [loading, setLoading] = useState(false)
  const [partialLoadingId, setPartialLoadingId] = useState<number | null>(null)
  const [partialDone, setPartialDone] = useState<Record<number, boolean>>({})

  const PARTIAL_API = "https://youtuberefill-1.onrender.com/api/twitter/partial"

  async function handlePartial(orderId: number, remains: number) {
    if (remains <= 0) return
    try {
      setPartialLoadingId(orderId)
      const res = await axios.post(PARTIAL_API, { orderId, remains })
      if (res.data?.success) {
        setPartialDone((m) => ({ ...m, [orderId]: true }))
      } else {
        console.error("Partial failed:", res.data)
        alert("Partial isteği başarısız oldu.")
      }
    } catch (e: any) {
      console.error("Partial API error:", e?.response?.data || e?.message)
      alert("Partial API hatası: " + (e?.response?.data?.error || e?.message))
    } finally {
      setPartialLoadingId(null)
    }
  }
  const handleLinkClick = (link: string) => {
    const url = link.startsWith("http") ? link : `https://www.x.com/${link}`
    window.open(url, "_blank", "noopener,noreferrer")
  }
  const fetchOrdersFromApi = async (ids: any) => {
    setLoading(true);

    try {
      const formattedIdsArray = ids
        .trim()
        .split(',')
        .map((id: any) => id.trim())
        .filter((id: any) => id !== '');

      if (formattedIdsArray.length === 0) {
        throw new Error('No valid IDs found');
      }

      const chunkSize = 100;
      const chunks = [];

      // ID'leri 100'erli gruplara ayır
      for (let i = 0; i < formattedIdsArray.length; i += chunkSize) {
        chunks.push(formattedIdsArray.slice(i, i + chunkSize));
      }

      const allResults = [];

      for (let i = 0; i < chunks.length; i++) {
        const response = await axios.post("https://youtuberefill-1.onrender.com/api/orders", {
          ids: chunks[i].join(","),
        });

        if (!response.data || !Array.isArray(response?.data?.data?.list)) {
          throw new Error(`API returned invalid data for chunk ${i + 1}`);
        }

        const chunkResults = response.data.data.list;

        // Doğru indexlerde ekle
        for (let j = 0; j < chunkResults.length; j++) {
          const resultIndex = i * chunkSize + j;
          allResults[resultIndex] = chunkResults[j];
        }

        // Saniyede 1 istek limiti istiyorsan (opsiyonel)
        // await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setOrders(allResults);
      return allResults;

    } catch (err) {
      console.error("Order fetch error", err);
      return [];
    } finally {
      setLoading(false);
    }
  };


  const extractUsernameFromLink = (link: string): string | null => {
    try {
      const url = new URL(link.startsWith("http") ? link : `https://${link}`)
      if (url.hostname.includes("x.com") || url.hostname.includes("twitter.com")) {
        const parts = url.pathname.split("/").filter(Boolean)
        if (parts.length > 0) {
          return parts[0].replace(/^@/, "") // @ ile başlıyorsa sil
        }
      } else if (link.startsWith("@")) {
        return link.slice(1) // sadece @username formatı
      } else if (!link.includes("http")) {
        return link // Belki direkt kullanıcı adı
      }
    } catch {
      // URL parse edilemiyorsa
      if (link.startsWith("@")) return link.slice(1)
      if (!link.includes("http")) return link
    }
    return null
  }

  const fetchTwitterData = async (usernames: string[]) => {
    try {
      const response = await axios.post("https://youtuberefill-1.onrender.com/api/twitter", {
        usernames,
      })
      setTwitterData(response.data.data)
    } catch (err) {
      console.error("Twitter API fetch error:", err)
    }
  }

  const handleFetch = async () => {
    const orderData = await fetchOrdersFromApi(ids)
    const usernames: any = Array.from(
      new Set(
        orderData
          .map((order: any) => extractUsernameFromLink(order.link))
          .filter((name: any): name is string => !!name),
      ),
    )
    await fetchTwitterData(usernames)
  }

  const { totalBelowTarget, averageDropRate } = useMemo(() => {
    const belowTargetOrders = orders.filter(order => {
      const username = extractUsernameFromLink(order.link)
      const twitterInfo = twitterData.find((t) => t.username === username)
      const targetCount = order.quantity + order.start_count
      const currentCount = twitterInfo?.followers_count || 0
      return currentCount < targetCount * 0.80 && twitterInfo?.followers_count !== null
    })

    console.log(belowTargetOrders.map((item: any) => item.id).join(","))

    const dropRates = belowTargetOrders
      .map(order => {
        const username = extractUsernameFromLink(order.link)
        const twitterInfo = twitterData.find((t) => t.username === username)
        const targetCount = order.quantity + order.start_count
        const currentCount = twitterInfo?.followers_count || 0
        const difference = targetCount - currentCount
        const dropRate = (difference / order.quantity) * 100
        return dropRate
      })
      .filter(rate => rate <= 120) // %130 üstündekileri hesaptan çıkar
      .map(rate => Math.min(rate, 100)) // %129 ve altını %100'e kadar sınırla

    const totalBelowTarget = belowTargetOrders.length
    const averageDropRate = dropRates.length > 0 ? dropRates.reduce((sum, rate) => sum + rate, 0) / dropRates.length : 0

    return { totalBelowTarget, averageDropRate }
  }, [orders, twitterData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            Order Fetcher with Twitter Data
          </h1>
          <p className="text-gray-400">Sipariş verilerini çekin ve Twitter takipçi sayılarını kontrol edin</p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl mb-8">
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
              Sipariş ID'leri
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
                  Fetch Orders and Twitter Data
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
              Results
            </h2>
            {orders.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {orders.length} orders
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Below target
                </div>
              </div>
            )}
          </div>

          {/* Drop Statistics */}
          {orders.length > 0 && totalBelowTarget > 0 && (
            <div className="p-6 border-b border-gray-700 bg-red-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-red-600 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400">Drop Analysis</h3>
                    <p className="text-sm text-gray-400">Below target orders statistics</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{totalBelowTarget}</div>
                    <div className="text-xs text-gray-400">Below Target</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{averageDropRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">Avg Drop Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                <p className="text-gray-500">Enter Order IDs and start the analysis</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                        <div className="flex items-center gap-2">
                          Order ID
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                        <div className="flex items-center gap-2">
                          Link
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                        <div className="flex items-center gap-2">
                          Start_Count
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                        <div className="flex items-center gap-2">
                          Quantity
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                        <div className="flex items-center gap-2">
                          Twitter Username
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                        <div className="flex items-center gap-2">
                          Followers
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                        <div className="flex items-center gap-2">
                          Drop Rate
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                        <div className="flex items-center gap-2">
                          Partial
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const username = extractUsernameFromLink(order.link)
                      const twitterInfo: any = twitterData.find((t) => t.username === username)
                      const targetCount = order.quantity + order.start_count
                      const status = order.status
                      const currentCount = twitterInfo?.followers_count || 0
                      const isBelowTarget = twitterInfo?.followers_count !== null && currentCount < targetCount
                      const difference = targetCount - currentCount
                      const dropRate = isBelowTarget ? (difference / order.quantity) * 100 : 0

                      return (
                        <tr
                          key={order.id}
                          className={`border-b border-gray-700 transition-colors duration-200 ${isBelowTarget
                              ? dropRate >= 100
                                ? "border-amber-500/50 bg-amber-900/20"
                                : "border-red-500/50 bg-red-900/20"
                              : "border-gray-700 hover:border-gray-600"
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
                              className="max-w-xs truncate text-blue-400 hover:text-blue-300 transition-colors cursor-pointer underline hover:no-underline flex items-center gap-1"
                            >
                              <span className="truncate">{order.link}</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-300 font-medium">{order.start_count}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-green-400 font-medium">+{order.quantity}</span>
                          </td>
                          <td className="py-4 px-4">
                            {username ? (
                              <div className="flex items-center gap-2">
                                <span className="text-blue-400 font-medium">@{username}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {twitterInfo ? (
                              twitterInfo.followers_count !== null ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-semibold">{twitterInfo.followers_count}</span>
                                  {isBelowTarget && (
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
                                  <span className="text-red-400 text-sm">{twitterInfo.error}</span>
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
                            {isBelowTarget ? (
                              <div className="flex items-center gap-2">
                                <span className="text-red-400 font-semibold">{dropRate.toFixed(1)}%</span>
                                <div className="w-20 bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(dropRate, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-green-400 font-semibold">✓ Target Met</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {isBelowTarget && dropRate < 100 ? (
                              <button
                                onClick={() => handlePartial(order.id, difference)}
                                disabled={partialLoadingId === order.id || partialDone[order.id] || difference <= 0}
                                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors
                                  ${status !== "completed" ? "bg-red-700 text-white cursor-default" : partialDone[order.id]
                                    ? "bg-emerald-700 text-white cursor-default"
                                    : partialLoadingId === order.id
                                      ? "bg-gray-600 text-white cursor-wait"
                                      : "bg-amber-600 hover:bg-amber-700 text-white"}`}
                                title={`Send partial: remains=${difference}`}
                              >
                                {status !== "completed" ? "Already Partial" : partialDone[order.id]
                                  ? "Sent ✓"
                                  : partialLoadingId === order.id
                                    ? "Sending..."
                                    : `Partial (${difference})`}
                              </button>
                            ) : (
                              <span className="text-gray-500 text-sm">—</span>
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
    </div>
  )
}

export default App