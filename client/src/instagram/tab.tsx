

import { useState } from "react"
import axios from "axios"
import { Search, BarChart3, AlertCircle, CheckCircle, ExternalLink, X, Copy, Download } from "lucide-react"

interface Order {
  id: number
  link: string
  start_count: number
  quantity: number
  external_id: number
}

interface InstagramData {
  url: string
  count: number | null
  error?: string
}

interface InstagramAnalyticsTabProps {
  serviceType: string
  endpoint: string
  label: string
}

export function InstagramAnalyticsTab({ serviceType, endpoint, label }: InstagramAnalyticsTabProps) {
  const [ids, setIds] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [instagramData, setInstagramData] = useState<InstagramData[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("refill-main")
  const [copiedTab, setCopiedTab] = useState<string | null>(null)

  const handleLinkClick = (link: string) => {
    const url = link.startsWith("http") ? link : `https://www.instagram.com/${link}`
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

  const getResultsData = () => {
    if (orders.length === 0 || instagramData.length === 0) return null

    const belowTargetData: {
      id: number
      link: string
      missing: number
      external_id: number
      currentCount: number
    }[] = []
    const aboveTargetIds: number[] = []

    orders.forEach((order) => {
      const username = order.link
      const instagramInfo = instagramData.find((t) => t.url === username)
      if (!instagramInfo || instagramInfo.count === null) return

      const targetCount = order.quantity + order.start_count
      const currentCount = instagramInfo.count

      if (currentCount < targetCount) {
        const missing = targetCount - currentCount
        belowTargetData.push({
          currentCount: currentCount,
          id: order.id,
          link: order.link,
          missing,
          external_id: order.external_id,
        })
      } else {
        aboveTargetIds.push(order.id)
      }
    })

    const missingtotal =
      Number(
        belowTargetData.filter((item) => item.currentCount !== -1).reduce((total, item) => total + item.missing, 0),
      ) * 0.00045

    const aboveContent = aboveTargetIds.join(",") || "x"
    const notFound =
      belowTargetData
        .filter((item) => item.currentCount === -1)
        .map((d) => d.id)
        .join(",") || "x"
    const idsLine =
      belowTargetData
        .filter((item) => item.currentCount !== -1)
        .map((d) => d.id)
        .join(",") || "x"
    const refillExternal =
      belowTargetData
        .filter((item) => item.currentCount !== -1)
        .map((d) => d.external_id)
        .join(",") || "x"
    const refillLines =
      belowTargetData
        .filter((item) => item.currentCount !== -1)
        .map((d) => `${d.external_id} refill(${d.currentCount}) => missing amount(${d.missing})`)
        .join("\n") || "x"
    const detailLines =
      belowTargetData
        .filter((item) => item.currentCount !== -1)
        .map((d) => `3 | ${d.link} | ${d.missing}`)
        .join("\n") || "x"

    return {
      refillMainIds: idsLine,
      refillProviderIds: refillExternal,
      refillProviderFormat: refillLines,
      refillMassOrderFormat: detailLines,
      missingTotal: missingtotal,
      notFoundIds: notFound,
      successMainIds: aboveContent,
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

  const fetchinstagramData = async (links: string[]) => {
    try {
      const response = await axios.post(`https://youtuberefill-1.onrender.com${endpoint}`, {
        links,
      })
      setInstagramData(response.data.data)
    } catch (err) {
      console.error(`${serviceType} API fetch error:`, err)
    }
  }

  const handleFetch = async () => {
    const orderData = await fetchOrdersFromApi(ids)
    const usernames = Array.from(new Set(orderData.map((order: Order) => order.link)))
    await fetchinstagramData(usernames)
  }

  const resultsData = getResultsData()

  const tabs = [
    { id: "refill-main", label: "Refill Main", content: resultsData?.refillMainIds, color: "text-emerald-400", icon: CheckCircle },
    { id: "refill-provider", label: "Provider IDs", content: resultsData?.refillProviderIds, color: "text-blue-400", icon: BarChart3 },
    {
      id: "provider-format",
      label: "Provider Format",
      content: resultsData?.refillProviderFormat,
      color: "text-amber-400",
      icon: Search,
    },
    { id: "mass-order", label: "Mass Order", content: resultsData?.refillMassOrderFormat, color: "text-purple-400", icon: Download },
    { id: "not-found", label: "Not Found", content: resultsData?.notFoundIds, color: "text-red-400", icon: AlertCircle },
    { id: "success", label: "Success", content: resultsData?.successMainIds, color: "text-green-400", icon: CheckCircle },
  ]

  const OrderCard = ({ order }: { order: Order }) => {
    const username = order.link
    const instagramInfo = instagramData.find((t) => t.url === username)
    const targetCount = order.quantity + order.start_count
    const currentCount = instagramInfo?.count || -1
    const isBelowTarget = instagramInfo?.count !== -1 && currentCount < targetCount
    const difference = targetCount - currentCount
    const dropRate = isBelowTarget ? (difference / order.quantity) * 100 : 0

    return (
      <div className={`bg-gray-800 rounded-lg p-4 border transition-all duration-200 hover:shadow-lg ${
        isBelowTarget
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
            <span className="text-white font-medium ml-2">{order.start_count.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-400">Quantity:</span>
            <span className="text-emerald-400 font-medium ml-2">+{order.quantity.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-400">Current:</span>
            {instagramInfo ? (
              instagramInfo.count !== null ? (
                <span className={`font-medium ml-2 ${isBelowTarget ? 'text-red-400' : 'text-emerald-400'}`}>
                  {instagramInfo.count === -1
                    ? "Not found"
                    : instagramInfo.count === -2
                      ? "Disabled"
                      : instagramInfo.count.toLocaleString()}
                </span>
              ) : (
                <span className="text-red-400 text-xs ml-2">{instagramInfo.error}</span>
              )
            ) : (
              <div className="inline-flex items-center gap-1 ml-2">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 text-xs">Loading...</span>
              </div>
            )}
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            {instagramInfo ? (
              isBelowTarget ? (
                <span className={`font-medium ml-2 ${dropRate >= 100 ? 'text-amber-400' : 'text-red-400'}`}>
                  {dropRate.toFixed(1)}% drop
                </span>
              ) : instagramInfo?.count === -1 ? (
                <span className="text-red-400 font-medium ml-2">❌ Error</span>
              ) : (
                <span className="text-emerald-400 font-medium ml-2">✓ Complete</span>
              )
            ) : (
              <span className="text-gray-400 text-xs ml-2">Loading...</span>
            )}
          </div>
        </div>
        
        {isBelowTarget && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Missing: {difference.toLocaleString()}</span>
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
            <h2 className="text-xl font-semibold text-white">Order Analysis</h2>
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

            {/* Orders Grid - Mobile Responsive */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Order</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Link</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Start</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Quantity</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Current</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const username = order.link
                      const instagramInfo = instagramData.find((t) => t.url === username)
                      const targetCount = order.quantity + order.start_count
                      const currentCount = instagramInfo?.count || -1
                      const isBelowTarget = instagramInfo?.count !== -1 && currentCount < targetCount
                      const difference = targetCount - currentCount
                      const dropRate = isBelowTarget ? (difference / order.quantity) * 100 : 0

                      return (
                        <tr
                          key={order.id}
                          className={`border-b border-gray-700 transition-colors duration-200 hover:bg-gray-800/50 ${
                            isBelowTarget
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
                            <span className="text-gray-300 font-medium text-sm">{order.start_count.toLocaleString()}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-emerald-400 font-medium text-sm">+{order.quantity.toLocaleString()}</span>
                          </td>
                          <td className="py-4 px-4">
                            {instagramInfo ? (
                              instagramInfo.count !== null ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-semibold text-sm">
                                    {instagramInfo.count === -1
                                      ? "Not found"
                                      : instagramInfo.count === -2
                                        ? "Disabled"
                                        : instagramInfo.count.toLocaleString()}
                                  </span>
                                  {isBelowTarget && (
                                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                      -{difference.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-red-400 text-xs">{instagramInfo.error}</span>
                              )
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-gray-400 text-xs">Loading...</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {instagramInfo ? (
                              isBelowTarget ? (
                                <span className={`font-semibold text-sm ${dropRate >= 100 ? "text-amber-400" : "text-red-400"}`}>
                                  {dropRate.toFixed(1)}% drop
                                </span>
                              ) : instagramInfo?.count === -1 ? (
                                <span className="text-red-400 font-semibold text-sm">❌</span>
                              ) : (
                                <span className="text-emerald-400 font-semibold text-sm">✓ Complete</span>
                              )
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              </div>
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
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
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
                      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <tab.icon className="w-5 h-5 text-blue-400" />
                          <h3 className="text-lg font-semibold text-white">{tab.label}</h3>
                          {tab.id === "mass-order" && resultsData && (
                            <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                              ${resultsData.missingTotal.toFixed(5)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopy(tab.content || "", tab.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                        >
                          {copiedTab === tab.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedTab === tab.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
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