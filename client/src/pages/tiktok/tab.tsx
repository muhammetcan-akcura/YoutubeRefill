"use client"
import { useState, useMemo } from "react"
import type React from "react"

import axios from "axios"
import {
  Search,
  ExternalLink,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
} from "lucide-react"

interface Order {
  id: number
  link: string
  start_count: number
  quantity: number
  external_id: number
}

interface TikTokData {
  url: string
  count: number | null
  error?: string
  status: number
}

interface TikTokAnalyticsTabProps {
  serviceType: string
  endpoint: string
  label: string
}

export function TikTokAnalyticsTab({ serviceType, endpoint, label }: TikTokAnalyticsTabProps) {
  const [ids, setIds] = useState("")
   const [massorderID, setMassOrderID] = useState("3")
  const [orders, setOrders] = useState<Order[]>([])
  const [tikTokData, setTikTokData] = useState<TikTokData[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("refill-main")
  const [copiedTab, setCopiedTab] = useState<string | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(100) // Default to 100 as requested

  // Sorting states
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null)

  const handleLinkClick = (link: string) => {
    const url = link.startsWith("http") ? link : `https://www.tiktok.com/@${link}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleCopyToClipboard = async (content: string, tabId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedTab(tabId)
      setTimeout(() => setCopiedTab(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const getResultsData = () => {
    if (orders.length === 0 || tikTokData.length === 0) return null

    const belowTargetData: {
      id: number
      link: string
      missing: number
      external_id: number
      currentCount: number
      quantity:number
      status:number
    }[] = []
    const aboveTargetIds: number[] = []

    orders.forEach((order) => {
      const username = order.link
      const tikTokInfo = tikTokData.find((t) => t.url === username)
      if (!tikTokInfo || tikTokInfo.count === null) return
      

      const targetCount = order.quantity + order.start_count
      const currentCount = tikTokInfo.count
      const status = tikTokInfo.status
      if (currentCount < targetCount) {
        const missing = targetCount - currentCount
        belowTargetData.push({
          currentCount: currentCount,
          id: order.id,
          link: order.link,
          missing,
          external_id: order.external_id,
          quantity:order.quantity,
          status:status
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
        .filter((item) => item.currentCount !== -1 && item.missing  > 100 && item.status !== 400 && item.missing / (item.quantity / 100) < 100   )
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
         .filter((item) => item.currentCount !== -1 && item.missing  > 100 && item.status !== 400 && item.missing / (item.quantity / 100) < 100   )
        .map((d) => `${d.missing}——${d.link}`)
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

  const fetchTikTokData = async (links: string[]) => {
    try {
      const response = await axios.post(`https://youtuberefill-1.onrender.com${endpoint}`, {
        links,
      })
      setTikTokData(response.data.data)
    } catch (err) {
      console.error(`${serviceType} API fetch error:`, err)
    }
  }

  const handleFetch = async () => {
    setCurrentPage(1) // Reset to first page on new fetch
    setSortColumn(null) // Reset sorting
    setSortDirection(null) // Reset sorting
    const orderData = await fetchOrdersFromApi(ids)
    const usernames = Array.from(new Set(orderData.map((order: Order) => order.link)))
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

  // Process orders with TikTok data and calculate drop rate
  const processedOrders = useMemo(() => {
    return orders
      .map((order) => {
        const username = order.link
        const tikTokInfo = tikTokData.find((t) => t.url === username)
        const targetCount = order.quantity + order.start_count
        const currentCount = tikTokInfo?.count || -1
        const isBelowTarget = tikTokInfo?.count !== -1 && currentCount < targetCount
        const difference = targetCount - currentCount
        const dropRate = isBelowTarget && order.quantity > 0 ? (difference / order.quantity) * 100 : 0

        return {
          ...order,
          tikTokInfo,
          targetCount,
          currentCount,
          isBelowTarget,
          difference,
          dropRate,
        }
      })
      .sort((a, b) => {
        if (!sortColumn) return 0

        let aValue: any
        let bValue: any

        if (sortColumn === "dropRate") {
          aValue = a.dropRate
          bValue = b.dropRate
        } else {
          // Fallback for other columns if needed, though only dropRate is sortable now
          aValue = a[sortColumn as keyof typeof a]
          bValue = b[sortColumn as keyof typeof b]
        }

        if (aValue === undefined || aValue === null) return sortDirection === "asc" ? 1 : -1
        if (bValue === undefined || bValue === null) return sortDirection === "asc" ? -1 : 1

        if (sortDirection === "asc") {
          return aValue - bValue
        } else if (sortDirection === "desc") {
          return bValue - aValue
        }
        return 0
      })
  }, [orders, tikTokData, sortColumn, sortDirection])

  // Pagination logic
  const totalPages = Math.ceil(processedOrders.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPaginatedOrders = processedOrders.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when items per page changes
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc") // Default to descending for drop rate (higher first)
    }
  }

  const renderSortIcon = (column: string) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
    }
    return null
  }

  const resultsData = getResultsData() // This still uses the original orders and tikTokData for the summary tabs

  const tabs = [
    {
      id: "refill-main",
      label: "Refill Main",
      content: resultsData?.refillMainIds,
      color: "text-emerald-400",
      icon: "🔄",
    },
    {
      id: "refill-provider",
      label: "Provider IDs",
      content: resultsData?.refillProviderIds,
      color: "text-blue-400",
      icon: "🔗",
    },
    {
      id: "provider-format",
      label: "Provider Format",
      content: resultsData?.refillProviderFormat,
      color: "text-amber-400",
      icon: "📋",
    },
    {
      id: "mass-order",
      label: "Mass Order",
      content: resultsData?.refillMassOrderFormat,
      color: "text-purple-400",
      icon: "📦",
    },
    { id: "not-found", label: "Not Found", content: resultsData?.notFoundIds, color: "text-red-400", icon: "❌" },
    { id: "success", label: "Success", content: resultsData?.successMainIds, color: "text-green-400", icon: "✅" },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Order IDs <span className="text-slate-500">(comma separated)</span>
              </label>
              <textarea
                rows={4}
                value={ids}
                onChange={(e) => setIds(e.target.value)}
                placeholder="Enter order IDs separated by commas (e.g., 12345,67890,11223)"
                className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              onClick={handleFetch}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze {label} Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Results Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Analysis Results
          </h2>
          {orders.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          )}
        </div>
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No Analysis Yet</h3>
              <p className="text-slate-500">Enter order IDs above to start analyzing your {label.toLowerCase()} data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pagination and Items per page controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="items-per-page" className="text-slate-400 text-sm">
                    Items per page:
                  </label>
                  <select
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="bg-slate-700 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={1000}>1000</option>
                    <option value={10000}>10000</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  Page {currentPage} of {totalPages}
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Order ID</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Link</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Start Count</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">Quantity</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">{getMetricLabel()}</th>
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                        <button
                          onClick={() => handleSort("dropRate")}
                          className="flex items-center text-slate-300 hover:text-white transition-colors"
                        >
                          Drop Rate
                          {renderSortIcon("dropRate")}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPaginatedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className={`border-b border-slate-700 transition-colors duration-200 ${
                          order.isBelowTarget
                            ? order.dropRate >= 100
                              ? "bg-amber-900/20 hover:bg-amber-800/30"
                              : "bg-red-900/20 hover:bg-red-800/30"
                            : "hover:bg-slate-700/50"
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
                            {order.link}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-slate-300 font-medium">{order.start_count}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-green-400 font-medium">+{order.quantity}</span>
                        </td>
                        <td className="py-4 px-4">
                          {order.tikTokInfo ? (
                            order.tikTokInfo.count !== null ? (
                              <div className="flex items-center gap-2">
                                {order.tikTokInfo.count === -1 ? (
                                  <>
                                    <XCircle className="w-4 h-4 text-yellow-400" />
                                    <span className="text-yellow-400 font-medium text-sm">Not Found</span>
                                  </>
                                ) : order.tikTokInfo.status === 400 ? (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-red-500 font-medium text-sm">Account Not Found</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-white font-semibold text-sm">{order.tikTokInfo.count}</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-red-400 text-sm">{order.tikTokInfo.error || "Hata oluştu"}</span>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-slate-400 text-sm">Yükleniyor...</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {order.tikTokInfo ? (
                            order.isBelowTarget ? (
                              <div className="flex items-center gap-2">
                                {order.tikTokInfo.count !== 0 &&
                                  order.tikTokInfo.status !== 400 &&
                                  order.isBelowTarget && (
                                    <span className="bg-red-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                      -{order.difference}
                                    </span>
                                  )}
                                <span
                                  className={`font-semibold text-sm px-3 py-1 rounded-full border ${
                                    order.dropRate >= 100
                                      ? "text-amber-500 border-amber-500"
                                      : "text-red-500 border-red-500"
                                  }`}
                                >
                                  {order.tikTokInfo.count === -1
                                    ? "Not Found"
                                    : order.tikTokInfo.status === 400
                                      ? "Account Not Found"
                                      : `${order.dropRate.toFixed(1)}%`}
                                </span>
                              </div>
                            ) : order.tikTokInfo?.count === -1 ? (
                              <span className="text-red-400 font-semibold flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                Not Found
                              </span>
                            ) : (
                              <span className="text-green-400 font-semibold flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Success
                              </span>
                            )
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-slate-400 text-sm">Loading...</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {currentPaginatedOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`border border-slate-600 rounded-lg p-4 ${
                      order.isBelowTarget
                        ? order.dropRate >= 100
                          ? "bg-amber-900/20 border-amber-600/30"
                          : "bg-red-900/20 border-red-600/30"
                        : "bg-slate-900/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                        #{order.id}
                      </span>
                      <button
                        onClick={() => handleLinkClick(order.link)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Link:</span>
                        <span className="text-white font-medium truncate ml-2">{order.link}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Start Count:</span>
                        <span className="text-slate-300">{order.start_count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Quantity:</span>
                        <span className="text-green-400">+{order.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Current:</span>
                        <div className="flex items-center gap-2">
                          {order.tikTokInfo ? (
                            order.tikTokInfo.count !== null ? (
                              <>
                                <span className="text-white font-semibold">
                                  {order.tikTokInfo.count === -1
                                    ? "Not Found"
                                    : order.tikTokInfo.status === 400
                                      ? "Account Not Found"
                                      : order.tikTokInfo.count}
                                </span>
                                {order.tikTokInfo.count !== 0 &&
                                  order.tikTokInfo.status !== 400 &&
                                  order.isBelowTarget && (
                                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                      -{order.difference}
                                    </span>
                                  )}
                              </>
                            ) : (
                              <span className="text-red-400 text-sm">{order.tikTokInfo.error}</span>
                            )
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-slate-400 text-sm">Loading...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Status:</span>
                        <div>
                          {order.tikTokInfo ? (
                            order.isBelowTarget ? (
                              <span
                                className={`font-semibold ${order.dropRate >= 100 ? "text-amber-400" : "text-red-400"}`}
                              >
                                {order.dropRate.toFixed(1)}% Drop
                              </span>
                            ) : order.tikTokInfo?.count === -1 ? (
                              <span className="text-red-400 font-semibold flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                Not Found
                              </span>
                            ) : (
                              <span className="text-green-400 font-semibold flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Success
                              </span>
                            )
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-slate-400 text-sm">Loading...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        currentPage === page ? "bg-blue-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Improved Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{label} Analysis Results</h2>
                  <p className="text-slate-400 text-sm">Export and review your data</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="flex flex-col h-full max-h-[calc(90vh-88px)]">
              {/* Mobile Tab Navigation */}
              <div className="md:hidden border-b border-slate-700 bg-slate-800/50">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full p-3 bg-slate-800 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.icon} {tab.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Desktop Tab Navigation */}
              <div className="hidden md:flex border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "text-blue-400 border-b-2 border-blue-400 bg-slate-700/50"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {tabs.map((tab) => (
                  <div key={tab.id} className={activeTab === tab.id ? "block" : "hidden"}>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
                      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <span>{tab.icon}</span>
                          {tab.label}
                          {tab.id === "mass-order" && resultsData && (
                            <span className="text-sm text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                              ${resultsData.missingTotal.toFixed(5)}
                            </span>
                          )}
                        </h3>
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
                        <button
                          onClick={() => handleCopyToClipboard(tab.content || "", tab.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                          {copiedTab === tab.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                          <pre className={`${tab.color} text-sm whitespace-pre-wrap font-mono leading-relaxed`}>
                            {tab.content || "No data available"}
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
