import { useState } from "react"
import { Search, Plus, Edit, Trash2, X, Loader2, FileText } from "lucide-react"
import { useScrapeSites } from './hooks/useScrapeSites'
// Types
interface Service {
  site: string
  id: string
  name: string
  price: string
  min: string
  max: string
  service_id: string
}

interface ServiceApiResponse {
  limit: number
  services: Service[]
}

interface Site {
  id: string
  domain: string
  path: string
  categoryClass: string
}

interface CreateSiteData {
  domain: string
  path: string
  categoryClass: string
}

interface UpdateSiteData {
  id: string
  domain?: string
  path?: string
  categoryClass?: string
}

interface MultiSiteData {
  domains: string[]
  path: string
  categoryClass: string
}

interface MultiSiteResponse {
  success: boolean
  created: number
  errors: number
  sites: Site[]
  failedSites: Array<{ domain: string, error: string }>
  message: string
}

// API Base URL
const API_BASE_URL = 'http://localhost:5000'

// Simple API client without external dependencies
class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      return text ? JSON.parse(text) as T : {} as T
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async getSites(): Promise<Site[]> {
    return this.request<Site[]>('/sites')
  }

  async createSite(data: CreateSiteData): Promise<Site> {
    return this.request<Site>('/add-site', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // 🆕 YENİ: Multi site ekleme
  async createMultipleSites(data: MultiSiteData): Promise<MultiSiteResponse> {
    return this.request<MultiSiteResponse>('/add-multiple-sites', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSite(data: UpdateSiteData): Promise<Site> {
    return this.request<Site>('/update-sites', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteSite(id: string): Promise<void> {
    return this.request<void>('/delete-sites', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
  }

  async getServices(): Promise<ServiceApiResponse> {
    return this.request<ServiceApiResponse>('/services')
  }
}

const apiClient = new ApiClient()

// Custom hooks for API operations
const useSites = () => {
  const [data, setData] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchSites = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const sites = await apiClient.getSites()
      setData(sites)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useState(() => {
    fetchSites()
  })

  return {
    data,
    isLoading,
    error,
    refetch: fetchSites
  }
}

const useServices = () => {
  const [data, setData] = useState<ServiceApiResponse | undefined>(undefined)

  const fetchServices = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const services = await apiClient.getServices()
      setData(services)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Initial fetch
  useState(() => {
    fetchServices()
  })

  return {
    data,
    isLoading,
    error,
    refetch: fetchServices
  }
}

const useCreateSite = (onSuccess?: () => void) => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (data: CreateSiteData) => {
    setIsPending(true)
    try {
      const result = await apiClient.createSite(data)
      onSuccess?.()
      return result
    } catch (error) {
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

// 🆕 YENİ: Multi site hook
const useCreateMultipleSites = (onSuccess?: () => void) => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (data: MultiSiteData) => {
    setIsPending(true)
    try {
      const result = await apiClient.createMultipleSites(data)
      onSuccess?.()
      return result
    } catch (error) {
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

const useUpdateSite = (onSuccess?: () => void) => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (data: UpdateSiteData) => {
    setIsPending(true)
    try {
      const result = await apiClient.updateSite(data)
      onSuccess?.()
      return result
    } catch (error) {
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

const useDeleteSite = (onSuccess?: () => void) => {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: string) => {
    setIsPending(true)
    try {
      await apiClient.deleteSite(id)
      onSuccess?.()
    } catch (error) {
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export default function SiteManagementDashboard() {
  const [activeTab, setActiveTab] = useState("sites")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMultiModalOpen, setIsMultiModalOpen] = useState(false) // 🆕 Multi modal state
  const [searchTerm, setSearchTerm] = useState("")
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const scrapeSites = useScrapeSites()

  const [newSite, setNewSite] = useState({
    domain: ".com",
    path: "services",
    categoryClass: "services-list-category-title",
  })

  // 🆕 Multi site state
  const [multiSiteData, setMultiSiteData] = useState({
    domains: "",
    path: "services",
    categoryClass: "services-list-category-title"
  })

  // API hooks with refetch callbacks
  const {
    data: sites = [],
    isLoading: sitesLoading,
    refetch: refetchSites
  } = useSites()

  const { data, isLoading: servicesLoading } = useServices()
  const services = data?.services ?? []

  const createSiteMutation = useCreateSite(refetchSites)
  const createMultipleSitesMutation = useCreateMultipleSites(refetchSites) // 🆕 Multi site mutation
  const updateSiteMutation = useUpdateSite(refetchSites)
  const deleteSiteMutation = useDeleteSite(refetchSites)

  // Loading states
  const isLoading = sitesLoading || servicesLoading
  const isMutating = createSiteMutation.isPending ||
    createMultipleSitesMutation.isPending ||
    updateSiteMutation.isPending ||
    deleteSiteMutation.isPending

  const handleAddSite = async () => {
    if (newSite.domain && newSite.path && newSite.categoryClass) {
      try {
        await createSiteMutation.mutateAsync(newSite)
        setNewSite({ domain: ".com", path: "services", categoryClass: "services-list-category-title" })
        setIsModalOpen(false)
        alert('Site başarıyla eklendi!')
      } catch (error) {
        console.error('Failed to create site:', error)
        alert('Site eklenirken hata oluştu: ' + (error as Error).message)
      }
    }
  }

  // 🆕 Multi site ekleme fonksiyonu
  const handleAddMultipleSites = async () => {
    if (multiSiteData.domains.trim()) {
      try {
        // Domainleri satır satır ayır ve temizle
        const domains = multiSiteData.domains
          .split('\n')
          .map(domain => domain.trim())
          .filter(domain => domain.length > 0)

        if (domains.length === 0) {
          alert('Lütfen en az bir domain girin!')
          return
        }

        const result = await createMultipleSitesMutation.mutateAsync({
          domains,
          path: multiSiteData.path,
          categoryClass: multiSiteData.categoryClass
        })

        // Sonuçları göster
        let message = result.message
        if (result.failedSites.length > 0) {
          message += '\n\nBaşarısız siteler:\n'
          result.failedSites.forEach(failed => {
            message += `• ${failed.domain}: ${failed.error}\n`
          })
        }

        alert(message)

        // Formu temizle ve modal'ı kapat
        setMultiSiteData({
          domains: "",
          path: "services",
          categoryClass: "services-list-category-title"
        })
        setIsMultiModalOpen(false)
      } catch (error) {
        console.error('Failed to create multiple sites:', error)
        alert('Siteler eklenirken hata oluştu: ' + (error as Error).message)
      }
    }
  }

  const handleUpdateSite = async () => {
    if (editingSite && newSite.domain && newSite.path && newSite.categoryClass) {
      try {
        await updateSiteMutation.mutateAsync({
          id: editingSite.id,
          ...newSite,
        })

        setNewSite({ domain: "", path: "", categoryClass: "" })
        setEditingSite(null)
        setIsModalOpen(false)
        alert('Site başarıyla güncellendi!')
      } catch (error) {
        console.error('Failed to update site:', error)
        alert('Site güncellenirken hata oluştu: ' + (error as Error).message)
      }
    }
  }

  const handleDeleteSite = async (id: string) => {
    if (window.confirm('Bu siteyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteSiteMutation.mutateAsync(id)
        alert('Site başarıyla silindi!')
      } catch (error) {
        console.error('Failed to delete site:', error)
        alert('Site silinirken hata oluştu: ' + (error as Error).message)
      }
    }
  }

  const handleEditSite = (site: Site) => {
    setEditingSite(site)
    setNewSite({
      domain: site.domain,
      path: site.path,
      categoryClass: site.categoryClass,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSite(null)
    setNewSite({
      domain: "",
      path: "",
      categoryClass: ""
    })
  }

  // 🆕 Multi modal kapatma
  const closeMultiModal = () => {
    setIsMultiModalOpen(false)
    setMultiSiteData({
      domains: "",
      path: "services",
      categoryClass: "services-list-category-title"
    })
  }

  const filteredSites = sites.filter(
    (site) =>
      site.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.categoryClass.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredServices = services.filter((service: Service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.id.toString().includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("sites")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "sites"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
              >
                Siteler ({filteredSites.length})
                {sitesLoading && <Loader2 className="inline ml-2 animate-spin" size={12} />}
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "services"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
              >
                Servisler ({filteredServices.length})
                {servicesLoading && <Loader2 className="inline ml-2 animate-spin" size={12} />}
              </button>
            </nav>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={activeTab === "sites" ? "Site ara..." : "Servis ara..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
            />
          </div>

          {/* Add Buttons - Only show for sites tab */}
          {activeTab === "sites" && (
            <div className="flex gap-2">
              {/* Tek Site Ekle Butonu */}
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isMutating}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                {isMutating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                <span>Tek Site Ekle</span>
              </button>

              {/* 🆕 Multi Site Ekle Butonu */}
              <button
                onClick={() => setIsMultiModalOpen(true)}
                disabled={isMutating}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                {isMutating ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                <span>Toplu Site Ekle</span>
              </button>

              {/* Scrape Et Butonu */}
              <button
                onClick={() => scrapeSites.mutate()}
                disabled={scrapeSites.isPending}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                {scrapeSites.isPending ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Plus size={20} />
                )}
                <span>Scrape Et</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="animate-spin text-blue-400" size={32} />
                <span className="text-gray-300 text-sm">Yükleniyor...</span>
              </div>
            </div>
          )}

          {activeTab === "sites" ? (
            <>
              {!isLoading && filteredSites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">
                    {searchTerm ? "Arama kriterinize uygun site bulunamadı" : "Henüz site eklenmemiş"}
                  </div>
                  {!searchTerm && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      İlk sitenizi ekleyin
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-750">
                      <tr>
                        <th className="text-left p-4 text-gray-300 font-semibold">ID</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Site Adı</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Path</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Kategori Class</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSites.map((site, index) => (
                        <tr
                          key={site.id}
                          className={`border-b border-gray-700 hover:bg-gray-750 transition-colors ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-825'
                            } ${deleteSiteMutation.isPending ? 'opacity-50' : ''}`}
                        >
                          <td className="p-4 text-gray-400 font-mono text-sm">{site.id}</td>
                          <td className="p-4">
                            <div className="text-white font-medium">{site.domain}</div>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-300 bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                              {site.path}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-300 bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                              {site.categoryClass}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditSite(site)}
                                disabled={isMutating}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteSite(site.id)}
                                disabled={isMutating}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                {deleteSiteMutation.isPending ? (
                                  <Loader2 className="animate-spin" size={16} />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              {!isLoading && filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">
                    {searchTerm ? "Arama kriterinize uygun servis bulunamadı" : "Henüz servis bulunmuyor"}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-750">
                      <tr>
                        <th className="text-left p-4 text-gray-300 font-semibold">ID</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Site</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Servis ID</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Servis Adı</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Fiyat</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Min</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service, index) => (
                        <tr key={service.id} className={`border-b border-gray-700 hover:bg-gray-750 transition-colors ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-825'}`}>
                          <td className="p-4 text-gray-400 font-mono text-sm">{service.id}</td>
                          <td className="p-4">
                            <span className="text-blue-400 font-medium">{service.site}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-blue-400 font-medium">{service.service_id}</span>
                          </td>
                          <td className="p-4 max-w-md">
                            <div className="text-gray-300 truncate" title={service.name}>
                              {service.name}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-green-400 font-bold">{service.price}</span>
                          </td>
                          <td className="p-4 text-gray-300 font-mono text-sm">{service.min}</td>
                          <td className="p-4 text-gray-300 font-mono text-sm">{service.max}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Single Site Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingSite ? 'Site Düzenle' : 'Yeni Site Ekle'}
              </h3>
              <button
                onClick={closeModal}
                disabled={isMutating}
                className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors p-1 rounded"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Site Alan Adı</label>
                <input
                  type="text"
                  value={newSite.domain}
                  onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                  disabled={isMutating}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="örnek: example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Site Path</label>
                <input
                  type="text"
                  value={newSite.path}
                  onChange={(e) => setNewSite({ ...newSite, path: e.target.value })}
                  disabled={isMutating}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="örnek: service-row"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Site Kategori Class</label>
                <input
                  type="text"
                  value={newSite.categoryClass}
                  onChange={(e) => setNewSite({ ...newSite, categoryClass: e.target.value })}
                  disabled={isMutating}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="örnek: category-main"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={closeModal}
                  disabled={isMutating}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={editingSite ? handleUpdateSite : handleAddSite}
                  disabled={isMutating || !newSite.domain || !newSite.categoryClass}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>{editingSite ? 'Güncelle' : 'Kaydet'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Multi Site Modal */}
      {isMultiModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Toplu Site Ekleme
              </h3>
              <button
                onClick={closeMultiModal}
                disabled={isMutating}
                className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors p-1 rounded"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Alan Adları (Her satıra bir domain)
                </label>
                <textarea
                  rows={8}
                  value={multiSiteData.domains}
                  onChange={(e) => setMultiSiteData({ ...multiSiteData, domains: e.target.value })}
                  disabled={isMutating}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none font-mono text-sm"
                  placeholder={`example1.com
example2.com
example3.com
example4.com`}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {multiSiteData.domains.split('\n').filter(d => d.trim()).length} site tespit edildi
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site Path (Tümü için)</label>
                  <input
                    type="text"
                    value={multiSiteData.path}
                    onChange={(e) => setMultiSiteData({ ...multiSiteData, path: e.target.value })}
                    disabled={isMutating}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    placeholder="services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kategori Class (Tümü için)</label>
                  <input
                    type="text"
                    value={multiSiteData.categoryClass}
                    onChange={(e) => setMultiSiteData({ ...multiSiteData, categoryClass: e.target.value })}
                    disabled={isMutating}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    placeholder="services-list-category-title"
                  />
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Önizleme:</h4>
                <div className="text-xs text-gray-400 space-y-1 max-h-32 overflow-y-auto">
                  {multiSiteData.domains.split('\n').filter(d => d.trim()).slice(0, 5).map((domain, index) => (
                    <div key={index} className="font-mono">
                      {domain.trim()} → path: {multiSiteData.path}, class: {multiSiteData.categoryClass}
                    </div>
                  ))}
                  {multiSiteData.domains.split('\n').filter(d => d.trim()).length > 5 && (
                    <div className="text-gray-500">... ve {multiSiteData.domains.split('\n').filter(d => d.trim()).length - 5} tane daha</div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={closeMultiModal}
                  disabled={isMutating}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddMultipleSites}
                  disabled={isMutating || !multiSiteData.domains.trim() || !multiSiteData.path || !multiSiteData.categoryClass}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>Toplu Kaydet ({multiSiteData.domains.split('\n').filter(d => d.trim()).length} site)</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}