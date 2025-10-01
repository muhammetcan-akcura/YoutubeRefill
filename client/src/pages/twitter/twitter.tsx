import { useState, useMemo } from "react"
import axios from "axios"
import { Search, BarChart3, AlertCircle, CheckCircle, ExternalLink, X, Copy, Download } from "lucide-react"

interface Order {
  id: number
  link: string
  start_count: number
  quantity: number
  partial?: boolean | number
  status: string
  external_id: number
}

interface TwitterData {
  username: string
  followers_count: number | null
  error?: string
}

interface TwitterAnalyticsTabProps {
  serviceType: string
  endpoint: string
  label: string
}

function TwitterAnalyticsTab({ serviceType, endpoint, label }: TwitterAnalyticsTabProps) {
  const [ids, setIds] = useState("")
  const [massorderID, setMassOrderID] = useState("2483")
  const [orders, setOrders] = useState<Order[]>([])
  const [twitterData, setTwitterData] = useState<TwitterData[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("refill-main")
  const [copiedTab, setCopiedTab] = useState<string | null>(null)
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

  const handleCopy = async (content: string, tabId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedTab(tabId)
      setTimeout(() => setCopiedTab(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Güncellenmiş fonksiyon - serviceType'a göre username veya tweet ID döndürür
  const extractIdentifierFromLink = (link: string): string | null => {
    try {
      const url = new URL(link.startsWith("http") ? link : `https://${link}`)
      
      if (url.hostname.includes("x.com") || url.hostname.includes("twitter.com")) {
        const parts = url.pathname.split("/").filter(Boolean)
        
        // Like ve Retweet için tweet ID'si çıkar
        if (serviceType === "likes" || serviceType === "retweet") {
          const statusIndex = parts.indexOf("status")
          if (statusIndex !== -1 && parts[statusIndex + 1]) {
            return parts[statusIndex + 1] // Tweet ID
          }
        }
        // Followers için username çıkar
        else if (serviceType === "followers") {
          if (parts.length > 0) {
            return parts[0].replace(/^@/, "") // Username
          }
        }
      } else if (link.startsWith("@")) {
        return link.slice(1)
      } else if (!link.includes("http")) {
        return link
      }
    } catch {
      if (link.startsWith("@")) return link.slice(1)
      if (!link.includes("http")) return link
    }
    return null
  }

  // Eski fonksiyon - sadece username için kullanılacak (display amaçlı)
  const extractUsernameFromLink = (link: string): string | null => {
    try {
      const url = new URL(link.startsWith("http") ? link : `https://${link}`)
      if (url.hostname.includes("x.com") || url.hostname.includes("twitter.com")) {
        const parts = url.pathname.split("/").filter(Boolean)
        if (parts.length > 0) {
          return parts[0].replace(/^@/, "")
        }
      } else if (link.startsWith("@")) {
        return link.slice(1)
      } else if (!link.includes("http")) {
        return link
      }
    } catch {
      if (link.startsWith("@")) return link.slice(1)
      if (!link.includes("http")) return link
    }
    return null
  }

  const { totalBelowTarget, averageDropRate } = useMemo(() => {
    const belowTargetOrders = orders.filter(order => {
      const identifier = extractIdentifierFromLink(order.link)
      const twitterInfo = twitterData.find((t) => t.username === identifier)
      const targetCount = order.quantity + order.start_count
      const currentCount = twitterInfo?.followers_count || 0
      return currentCount < targetCount * 0.80 && twitterInfo?.followers_count !== null
    })

    const dropRates = belowTargetOrders
      .map(order => {
        const identifier = extractIdentifierFromLink(order.link)
        const twitterInfo = twitterData.find((t) => t.username === identifier)
        const targetCount = order.quantity + order.start_count
        const currentCount = twitterInfo?.followers_count || 0
        const difference = targetCount - currentCount
        const dropRate = (difference / order.quantity) * 100
        return dropRate
      })
      .filter(rate => rate <= 120)
      .map(rate => Math.min(rate, 100))

    const totalBelowTarget = belowTargetOrders.length
    const averageDropRate = dropRates.length > 0 ? dropRates.reduce((sum, rate) => sum + rate, 0) / dropRates.length : 0

    return { totalBelowTarget, averageDropRate }
  }, [orders, twitterData])

  const getResultsData = () => {
    if (orders.length === 0 || twitterData.length === 0) return null

    const belowTargetData: {
      id: number
      link: string
      missing: number
      external_id: number
      currentCount: number
      start_count: number
      username: string
    }[] = []
    const aboveTargetIds: number[] = []
    const bellowStartCountIds: number[] = []

    orders.forEach((order) => {
      const identifier = extractIdentifierFromLink(order.link)
      const twitterInfo = twitterData.find((t) => t.username === identifier)
      if (!twitterInfo || twitterInfo.followers_count === null) return

      const targetCount = order.quantity + order.start_count
      const currentCount = twitterInfo.followers_count

      // Başlangıç sayısının altında olanlar
      if (currentCount < order.start_count) {
        bellowStartCountIds.push(order.id)
      }
      // Target'a ulaşanlar
      else if (currentCount >= targetCount) {
        aboveTargetIds.push(order.id)
      }
      // Target'ın altında olanlar
      else if (currentCount < targetCount) {
        const missing = targetCount - currentCount
        belowTargetData.push({
          currentCount: currentCount,
          id: order.id,
          link: order.link,
          missing,
          external_id: order.external_id,
          start_count: order.start_count,
          username: identifier || ""
        })
      }
    })

    // Toplam eksik maliyet
    const missingTotal = Number(
      belowTargetData.filter((item) => item.currentCount !== -1).reduce((total, item) => total + item.missing, 0)
    ) * 0.00045

    const successMainIds = aboveTargetIds.join(",") || "x"
    const notFoundIds = belowTargetData.filter((item) => item.currentCount === -1).map((d) => d.id).join(",") || "x"
    const bellowStartCountIdsStr = bellowStartCountIds.join(",") || "x"
    const refillMainIds = belowTargetData.filter((item) => item.currentCount !== -1).map((d) => d.id).join(",") || "x"
    const refillProviderIds = belowTargetData.filter((item) => item.currentCount !== -1).map((d) => d.external_id).join(",") || "x"
    
    const refillProviderFormat = belowTargetData
      .filter((item) => item.currentCount !== -1)
      .map((d) => `${d.external_id} refill(${d.currentCount}) => missing amount(${d.missing})`)
      .join("\n") || "x"

    const refillMassOrderFormat = belowTargetData
      .filter((item) => item.currentCount !== -1)
      .map((d) => `${massorderID} | ${d.link} | ${d.missing}`)
      .join("\n") || "x"

    return {
      refillMainIds,
      refillProviderIds,
      refillProviderFormat,
      refillMassOrderFormat,
      missingTotal,
      notFoundIds,
      successMainIds,
      bellowStartCountIds: bellowStartCountIdsStr,
    }
  }

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

  const fetchTwitterData = async (identifiers: string[]) => {
    try {
      // ServiceType'a göre farklı parametre isimleri kullan
      const requestBody = serviceType === "followers" 
        ? { usernames: identifiers }
        : { tweet_ids: identifiers } // likes ve retweet için tweet_ids

      const response = await axios.post(`https://youtuberefill-1.onrender.com${endpoint}`, requestBody)
      setTwitterData(response.data.data)
    } catch (err) {
      console.error("Twitter API fetch error:", err)
    }
  }

  const handleFetch = async () => {
    const orderData = await fetchOrdersFromApi(ids)
    const identifiers = Array.from(
      new Set(
        orderData
          .map((order: any) => extractIdentifierFromLink(order.link))
          .filter((identifier: any): identifier is string => !!identifier)
      )
    )
    await fetchTwitterData(identifiers)
  }

  const resultsData = getResultsData()

  // Başlık serviceType'a göre değişsin
  const getAnalysisTitle = () => {
    switch (serviceType) {
      case "followers":
        return "Twitter Followers Analysis"
      case "likes":
        return "Twitter Likes Analysis"
      case "retweet":
        return "Twitter Retweets Analysis"
      default:
        return "Twitter Analysis"
    }
  }

  const tabs = [
    { id: "refill-main", label: "Refill Main", content: resultsData?.refillMainIds, color: "text-emerald-400", icon: CheckCircle },
    { id: "refill-provider", label: "Provider IDs", content: resultsData?.refillProviderIds, color: "text-blue-400", icon: BarChart3 },
    { id: "provider-format", label: "Provider Format", content: resultsData?.refillProviderFormat, color: "text-amber-400", icon: Search },
    { id: "mass-order", label: "Mass Order", content: resultsData?.refillMassOrderFormat, color: "text-purple-400", icon: Download },
    { id: "not-found", label: "Not Found", content: resultsData?.notFoundIds, color: "text-red-400", icon: AlertCircle },
    { id: "success", label: "Success", content: resultsData?.successMainIds, color: "text-green-400", icon: CheckCircle },
    { id: "bellow-start-count", label: "Bellow Start Count", content: resultsData?.bellowStartCountIds, color: "text-orange-400", icon: X },
  ]

  const OrderCard = ({ order }: { order: Order }) => {
    const username = extractUsernameFromLink(order.link)
    const identifier = extractIdentifierFromLink(order.link)
    const twitterInfo = twitterData.find((t) => t.username === identifier)
    const targetCount = order.quantity + order.start_count
    const currentCount = twitterInfo?.followers_count || 0
    const isBelowTarget = twitterInfo?.followers_count !== null && currentCount < targetCount
    const difference = targetCount - currentCount
    const dropRate = isBelowTarget ? (difference / order.quantity) * 100 : 0

    return (
      <div className={`bg-gray-800 rounded-lg p-4 border transition-all duration-200 hover:shadow-lg ${isBelowTarget
        ? dropRate >= 100
          ? "border-amber-500/50 bg-amber-900/20"
          : "border-red-500/50 bg-red-900/20"
        : "border-gray-700 hover:border-gray-600"
        }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              #{order.id}
            </span>
            <button
              onClick={() => handleLinkClick(order.link)}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{order.link}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Start:</span>
            <span className="text-white font-medium ml-2">{order.start_count}</span>
          </div>
          <div>
            <span className="text-gray-400">Quantity:</span>
            <span className="text-emerald-400 font-medium ml-2">+{order.quantity}</span>
          </div>
          <div>
            <span className="text-gray-400">
              {serviceType === "followers" ? "Username:" : "Tweet ID:"}
            </span>
            {identifier ? (
              <span className="text-blue-400 font-medium ml-2">
                {serviceType === "followers" ? `@${username}` : identifier}
              </span>
            ) : (
              <span className="text-gray-500 italic ml-2">N/A</span>
            )}
          </div>
          <div>
            <span className="text-gray-400">
              {serviceType === "followers" ? "Followers:" : "Count:"}
            </span>
            {twitterInfo ? (
              twitterInfo.followers_count !== null ? (
                <span className={`font-medium ml-2 ${isBelowTarget ? 'text-red-400' : 'text-emerald-400'}`}>
                  {twitterInfo.followers_count}
                </span>
              ) : (
                <span className="text-red-400 text-xs ml-2">{twitterInfo.error}</span>
              )
            ) : (
              <div className="inline-flex items-center gap-1 ml-2">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 text-xs">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {isBelowTarget && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Drop: {dropRate.toFixed(1)}% ({difference} missing)</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${dropRate >= 100 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(dropRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Input Section */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">{getAnalysisTitle()}</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Enter Order IDs (comma separated)
            </label>
            <textarea
              rows={4}
              value={ids}
              onChange={(e) => setIds(e.target.value)}
              placeholder="12345,67890,11111,22222..."
              className="w-full p-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={loading || !ids.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5" />
                Start Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {orders.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Drop Statistics */}
            {totalBelowTarget > 0 && (
              <div className="mb-6 p-4 border border-red-500/50 bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600 p-3 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-white" />
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-sm">Total Orders</span>
                </div>
                <span className="text-2xl font-bold text-white">{orders.length}</span>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-sm">Successful</span>
                </div>
                <span className="text-2xl font-bold text-emerald-400">
                  {resultsData?.successMainIds !== "x" ? resultsData?.successMainIds.split(",").length : 0}
                </span>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-sm">Need Refill</span>
                </div>
                <span className="text-2xl font-bold text-red-400">
                  {resultsData?.refillMainIds !== "x" ? resultsData?.refillMainIds.split(",").length : 0}
                </span>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Order</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Link</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Start</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Quantity</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">
                        {serviceType === "followers" ? "Username" : "Tweet ID"}
                      </th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">
                        {serviceType === "followers" ? "Followers" : "Count"}
                      </th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Drop Rate</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Partial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const username = extractUsernameFromLink(order.link)
                      const identifier = extractIdentifierFromLink(order.link)
                      const twitterInfo = twitterData.find((t) => t.username === identifier)
                      const targetCount = order.quantity + order.start_count
                      const currentCount = twitterInfo?.followers_count || 0
                      const isBelowTarget = twitterInfo?.followers_count !== null && currentCount < targetCount
                      const difference = targetCount - currentCount
                      const dropRate = isBelowTarget ? (difference / order.quantity) * 100 : 0
                      const status = order.status

                      return (
                        <tr
                          key={order.id}
                          className={`border-b border-gray-700 transition-colors duration-200 hover:bg-gray-800/50 ${isBelowTarget
                            ? dropRate >= 100
                              ? "bg-amber-900/20"
                              : "bg-red-900/20"
                            : ""
                            }`}
                        >
                          <td className="py-4 px-4">
                            <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                              #{order.id}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleLinkClick(order.link)}
                              className="max-w-xs truncate text-blue-400 hover:text-blue-300 transition-colors cursor-pointer underline hover:no-underline text-sm flex items-center gap-1"
                            >
                              <span className="truncate">{order.link}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-300 font-medium text-sm">{order.start_count}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-emerald-400 font-medium text-sm">+{order.quantity}</span>
                          </td>
                          <td className="py-4 px-4">
                            {identifier ? (
                              <span className="text-blue-400 font-medium text-sm">
                                {serviceType === "followers" ? `@${username}` : identifier}
                              </span>
                            ) : (
                              <span className="text-gray-500 italic text-sm">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {twitterInfo ? (
                              twitterInfo.followers_count !== null ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-semibold text-sm">
                                    {twitterInfo.followers_count}
                                  </span>
                                  {isBelowTarget && (
                                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                      -{difference}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-red-400 text-xs">{twitterInfo.error}</span>
                              )
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-gray-400 text-xs">Loading...</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {isBelowTarget ? (
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold text-sm ${dropRate >= 100 ? "text-amber-400" : "text-red-400"}`}>
                                  {dropRate.toFixed(1)}%
                                </span>
                                <div className="w-16 bg-gray-700 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${dropRate >= 100 ? "bg-amber-500" : "bg-red-500"}`}
                                    style={{ width: `${Math.min(dropRate, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-emerald-400 font-semibold text-sm">✓ Target Met</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {isBelowTarget && dropRate < 100 ? (
                              <button
                                onClick={() => handlePartial(order.id, difference)}
                                disabled={partialLoadingId === order.id || partialDone[order.id] || difference <= 0}
                                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors
                                  ${status !== "completed" ? "bg-red-600 text-white cursor-default" : partialDone[order.id]
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
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="grid gap-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{label} Analysis Results</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col h-full max-h-[calc(90vh-100px)]">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-700 bg-gray-800 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab.id
                      ? "text-blue-400 border-b-2 border-blue-400 bg-gray-700"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
             <div className="flex-1 overflow-y-auto p-6">
  {tabs.map((tab) => (
    <div key={tab.id} className={activeTab === tab.id ? "block" : "hidden"}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-4">
          {/* Left: icon + title + optional small badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <tab.icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-white truncate">{tab.label}</h3>
            </div>

            {tab.id === "mass-order" && typeof resultsData?.missingTotal === "number" && (
              <span className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded ml-2">
                ${resultsData.missingTotal.toFixed(5)}
              </span>
            )}
          </div>

          {/* Middle: mass-order input (only visible for mass-order). Limited width so it won't push the copy button */}
          {tab.id === "mass-order" ? (
            <div className="flex-1 max-w-xs mx-4">
              <div className="relative">
                <input
                  id="massorder"
                  onChange={(e) => setMassOrderID(e.target.value)}
                  value={massorderID}
                  type="text"
                  placeholder="Mass order id"
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder-gray-400 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoComplete="off"
                  aria-label="Mass order id"
                />
                {/* Clear button */}
                {massorderID ? (
                  <button
                    onClick={() => setMassOrderID("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 rounded hover:bg-gray-800"
                    aria-label="Clear mass order id"
                    title="Temizle"
                    type="button"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            // keep spacing consistent when input absent
            <div className="mx-4 flex-1 max-w-xs" />
          )}

          {/* Right: copy button */}
          <div className="flex items-center">
            <button
              onClick={() => handleCopy(tab.content || "", tab.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
              aria-label={`Copy ${tab.label}`}
              type="button"
            >
              {copiedTab === tab.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTab === tab.id ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <pre className={`${tab.color} text-sm whitespace-pre-wrap font-mono break-all`}>
              {tab.content || "No data"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TwitterAnalyticsTab