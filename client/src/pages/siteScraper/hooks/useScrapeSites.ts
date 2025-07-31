import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

type ScrapeResponse = {
  success: boolean
  message: string
  scrapedCount?: number
}

export function useScrapeSites() {
  return useMutation<ScrapeResponse, Error, void>({
    mutationFn: async () => {
      const response = await axios.post('http://localhost:5000/scrape') // ✅ düzeltildi
      return response.data
    },
  })
}
