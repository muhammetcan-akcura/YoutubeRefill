// api/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast' // veya hangi toast library kullanıyorsan

// Types
export interface Service {
  site: string
  id: string
  name: string
  price: string
  min: string
  max: string
}

export interface Site {
  id: string
  domain: string
  path: string            // 👈 EKLENDİ
  categoryClass: string
}

export interface CreateSiteData {
  domain: string
  path: string            // 👈 EKLENDİ
  categoryClass: string
}

export interface UpdateSiteData {
  id: string
  domain?: string
  path?: string           // 👈 EKLENDİ
  categoryClass?: string
}


// API Base URL - Environment variable olarak tanımla
const API_BASE_URL = 'http://localhost:5000'

// API Client
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

      // Handle empty responses
      const text = await response.text()
      return text ? JSON.parse(text) as T : {} as T
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Sites API methods
  async getSites(): Promise<Site[]> {
    return this.request<Site[]>('/sites')
  }

  async getSiteById(id: string): Promise<Site> {
    return this.request<Site>(`/site/${id}`)
  }

  async createSite(data: CreateSiteData): Promise<Site> {
    return this.request<Site>('/add-site', {
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

  // Services API methods
  async getServices(): Promise<Service[]> {
    return this.request<Service[]>('/services')
  }

  async getServiceById(id: string): Promise<Service> {
    return this.request<Service>(`/service/${id}`)
  }
}

// API client instance
const apiClient = new ApiClient()

// Query Keys
export const queryKeys = {
  sites: ['sites'] as const,
  site: (id: string) => ['site', id] as const,
  services: ['services'] as const,
  service: (id: string) => ['service', id] as const,
}

// Sites Hooks
export const useSites = () => {
  return useQuery({
    queryKey: queryKeys.sites,
    queryFn: apiClient.getSites,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

export const useSite = (id: string) => {
  return useQuery({
    queryKey: queryKeys.site(id),
    queryFn: () => apiClient.getSiteById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateSite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.createSite,
    onSuccess: (newSite) => {
      // Invalidate and refetch sites list
      queryClient.invalidateQueries({ queryKey: queryKeys.sites })
      
      // Optionally update the cache optimistically
      queryClient.setQueryData(queryKeys.sites, (oldData: Site[] | undefined) => {
        return oldData ? [...oldData, newSite] : [newSite]
      })

      toast.success('Site başarıyla eklendi!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Site eklenirken bir hata oluştu')
    },
  })
}

export const useUpdateSite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.updateSite,
    onSuccess: (updatedSite) => {
      // Update specific site in cache
      queryClient.setQueryData(queryKeys.site(updatedSite.id), updatedSite)
      
      // Update sites list
      queryClient.setQueryData(queryKeys.sites, (oldData: Site[] | undefined) => {
        return oldData?.map(site => 
          site.id === updatedSite.id ? updatedSite : site
        ) || []
      })

      toast.success('Site başarıyla güncellendi!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Site güncellenirken bir hata oluştu')
    },
  })
}

export const useDeleteSite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.deleteSite,
    onSuccess: (_, deletedId) => {
      // Remove from sites list
      queryClient.setQueryData(queryKeys.sites, (oldData: Site[] | undefined) => {
        return oldData?.filter(site => site.id !== deletedId) || []
      })

      // Remove individual site cache
      queryClient.removeQueries({ queryKey: queryKeys.site(deletedId) })

      toast.success('Site başarıyla silindi!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Site silinirken bir hata oluştu')
    },
  })
}

// Services Hooks
export const useServices = () => {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: apiClient.getServices,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

export const useService = (id: string) => {
  return useQuery({
    queryKey: queryKeys.service(id),
    queryFn: () => apiClient.getServiceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Optimistic Updates Helper
export const useOptimisticSiteUpdate = () => {
  const queryClient = useQueryClient()

  return {
    optimisticUpdate: (siteId: string, updates: Partial<Site>) => {
      queryClient.setQueryData(queryKeys.site(siteId), (oldData: Site | undefined) => {
        return oldData ? { ...oldData, ...updates } : undefined
      })

      queryClient.setQueryData(queryKeys.sites, (oldData: Site[] | undefined) => {
        return oldData?.map(site => 
          site.id === siteId ? { ...site, ...updates } : site
        ) || []
      })
    },
    
    rollback: (siteId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.site(siteId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.sites })
    }
  }
}

// Bulk operations
export const useBulkDeleteSites = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (siteIds: string[]) => {
      const deletePromises = siteIds.map(id => apiClient.deleteSite(id))
      await Promise.all(deletePromises)
      return siteIds
    },
    onSuccess: (deletedIds) => {
      queryClient.setQueryData(queryKeys.sites, (oldData: Site[] | undefined) => {
        return oldData?.filter(site => !deletedIds.includes(site.id)) || []
      })

      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: queryKeys.site(id) })
      })

      toast.success(`${deletedIds.length} site başarıyla silindi!`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Siteler silinirken bir hata oluştu')
    },
  })
}

// Cache utilities
export const useCacheUtils = () => {
  const queryClient = useQueryClient()

  return {
    // Prefetch a site
    prefetchSite: (id: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.site(id),
        queryFn: () => apiClient.getSiteById(id),
        staleTime: 5 * 60 * 1000,
      })
    },

    // Clear all cache
    clearAllCache: () => {
      queryClient.clear()
    },

    // Refetch all sites
    refetchSites: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites })
    },

    // Get cached site data
    getCachedSite: (id: string): Site | undefined => {
      return queryClient.getQueryData(queryKeys.site(id))
    },

    // Get cached sites data
    getCachedSites: (): Site[] | undefined => {
      return queryClient.getQueryData(queryKeys.sites)
    },
  }
}