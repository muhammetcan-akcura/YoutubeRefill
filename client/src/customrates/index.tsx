import { useState, useEffect } from "react"
import axios from "axios"

interface RateData {
  username: string
  service_id: string
  service_name: string
  sale_price: number
  cost_price: number
  profit_percent: number
}

interface ApiResponse {
  data: RateData[]
}

const sites = [
  { value: "socialpanel.app", label: "socialpanel.app" },
  { value: "smmexclusive.com", label: "smmexclusive.com" },
  { value: "youtubee.net", label: "youtubee.net" },
]

export default function RatesDashboard() {
  const [ratesData, setRatesData] = useState<RateData[]>([])
  const [filteredData, setFilteredData] = useState<RateData[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedSite, setSelectedSite] = useState("")
  const [selectedUser, setSelectedUser] = useState("all")
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "">("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState("")

  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => {
      setToastMessage("")
      setToastType("")
    }, 3000)
  }

  // Unique usernames for filter
  const uniqueUsernames = Array.from(new Set((ratesData ?? []).map((item) => item.username)))

  // Fetch rates data
  const fetchRates = async () => {
    setLoading(true)
    try {
      const response = await axios.get<ApiResponse>("http://localhost:5000/custom-rates")
      const list = response.data?.data ?? []
      setRatesData(list)
      setFilteredData(list)
      showToast("Rates verileri başarıyla yüklendi.", "success")
    } catch (error) {
      console.error("Error fetching rates:", error)
      showToast("Rates verileri yüklenirken bir hata oluştu.", "error")
    } finally {
      setLoading(false)
    }
  }

  // Submit profit data — **TEK İSTEKTE** profit + site gönder ve dönen listeyi tabloya set et
  const submitProfit = async () => {
  if (!jsonInput.trim() || !selectedSite) {
    showToast("Lütfen JSON verisi ve site seçimi yapın.", "error")
    return
  }

  try {
    const rawData = JSON.parse(jsonInput)
    setSubmitting(true)

    // ✅ Sadece gerekli alanları bırak
    const cleanedProfit = rawData.map((category: any) => ({
  services: (category.services ?? []).map((service: any) => ({
    id: service.id,
    service_name: service.service_name,
    price: service.price,
    provider_rate: service.provider_rate,
  }))
}))

    const payload = {
      site: selectedSite,
      profit: cleanedProfit,
    }

    const response = await axios.post<ApiResponse>("http://localhost:5000/custom-rates", payload)

    const updatedRates = response.data?.data ?? []

    setRatesData(updatedRates)
    setFilteredData(updatedRates)

    showToast("Profit verisi başarıyla gönderildi ve tablo güncellendi.", "success")
    setIsModalOpen(false)
    setJsonInput("")
    setSelectedSite("")
  } catch (error) {
    console.error("Error submitting profit:", error)
    if (error instanceof SyntaxError) {
      showToast("Geçersiz JSON formatı.", "error")
    } else {
      showToast("Profit verisi gönderilirken bir hata oluştu.", "error")
    }
  } finally {
    setSubmitting(false)
  }
}


  // Filter data based on selected user
  useEffect(() => {
    if (selectedUser === "all") {
      setFilteredData(ratesData)
    } else {
      setFilteredData(ratesData.filter((item) => item.username === selectedUser))
    }
  }, [selectedUser, ratesData])

  // Get row color based on profit percentage
  const getRowColor = (profitPercent: number) => {
    if (profitPercent < 0) return "bg-red-950/50 border-l-red-500"
    if (profitPercent >= 0 && profitPercent <= 1) return "bg-yellow-950/50 border-l-yellow-500"
    return "bg-slate-800/50 border-l-green-500"
  }

  // Get profit badge color
  const getProfitBadgeColor = (profitPercent: number) => {
    if (profitPercent < 0) return "bg-red-600 text-red-100"
    if (profitPercent >= 0 && profitPercent <= 1) return "bg-yellow-600 text-yellow-100"
    return "bg-green-600 text-green-100"
  }

  // Get profit icon
  const getProfitIcon = (profitPercent: number) => {
    if (profitPercent < 0) return "↓"
    if (profitPercent >= 0 && profitPercent <= 1) return "→"
    return "↑"
  }

  useEffect(() => {
    fetchRates()
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              toastType === "success"
                ? "bg-green-600 text-white border border-green-500"
                : "bg-red-600 text-white border border-red-500"
            }`}
          >
            {toastMessage}
          </div>
        )}

        {/* Header with Profit Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Custom Rates Dashboard</h1>
            <p className="text-slate-400 mt-1">Kullanıcı bazlı service rates ve profit bilgileri</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Profit Verisi Ekle
          </button>
        </div>

        {/* Statistics Cards */}
        {filteredData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-2xl font-bold text-slate-100">{filteredData.length}</div>
              <p className="text-xs text-slate-400">Toplam Kayıt</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-2xl font-bold text-red-400">
                {filteredData.filter((item) => item.profit_percent < 0).length}
              </div>
              <p className="text-xs text-slate-400">Zararda</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-2xl font-bold text-yellow-400">
                {filteredData.filter((item) => item.profit_percent >= 0 && item.profit_percent <= 1).length}
              </div>
              <p className="text-xs text-slate-400">Düşük Kar</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-2xl font-bold text-green-400">
                {filteredData.filter((item) => item.profit_percent > 1).length}
              </div>
              <p className="text-xs text-slate-400">Karlı</p>
            </div>
          </div>
        )}

        {/* Rates Data Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-6 border-b border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-100">Rates Verileri</h2>
                <p className="text-slate-400 mt-1">Kullanıcı bazlı service rates ve profit bilgileri</p>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-48 bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tüm Kullanıcılar</option>
                  {uniqueUsernames.map((username) => (
                    <option key={username} value={username}>
                      {username}
                    </option>
                  ))}
                </select>
                <button
                  onClick={fetchRates}
                  disabled={loading}
                  className="border border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                  Yenile
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <svg className="h-8 w-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Service ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Service Adı
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Satış Fiyatı
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Maliyet
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Profit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                          Veri bulunamadı
                        </td>
                      </tr>
                    ) : (
                      (filteredData ?? []).map((item, index) => (
                        <tr
                          key={`${item.username}-${item.service_id}-${index}`}
                          className={`${getRowColor(item.profit_percent)} border-l-4 hover:bg-slate-700/30 transition-colors`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                            {item.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-200">
                              {item.service_id}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-200 max-w-xs truncate" title={item.service_name}>
                            {item.service_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 text-right font-mono">
                            ${item.sale_price.toFixed(3)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 text-right font-mono">
                            ${item.cost_price.toFixed(3)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${getProfitBadgeColor(item.profit_percent)}`}
                            >
                              {getProfitIcon(item.profit_percent)}
                              {item.profit_percent.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-slate-100">Profit Verisi Gönder</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="site-select" className="block text-sm font-medium text-slate-200">
                    Site Seçimi
                  </label>
                  <select
                    id="site-select"
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Seçiniz --</option>
                    {sites.map((site) => (
                      <option key={site.value} value={site.value}>
                        {site.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="json-input" className="block text-sm font-medium text-slate-200">
                    JSON Verisi
                  </label>
                  <textarea
                    id="json-input"
                    placeholder='[{"username":"test","service_id":"123","service_name":"Instagram","sale_price":5,"cost_price":3,"profit_percent":40}]'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] font-mono text-sm"
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="border border-slate-600 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    İptal
                  </button>
                  <button
                    onClick={submitProfit}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    Gönder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
