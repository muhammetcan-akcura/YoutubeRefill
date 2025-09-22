// scrapers/scraper.js
import axios from 'axios'
import axiosRetry from 'axios-retry'
import * as cheerio from 'cheerio'
import Bottleneck from 'bottleneck'
import { HttpsProxyAgent } from 'https-proxy-agent'

// —— Ayarlar (ENV ile de yönetebilirsin) ——
const HTTP_TIMEOUT_MS = parseInt(process.env.SCRAPE_TIMEOUT_MS || '30000', 10) // 30s
const RETRIES = parseInt(process.env.SCRAPE_RETRIES || '5', 10)               // 5 deneme
const MAX_CONCURRENT_HTTP = parseInt(process.env.SCRAPE_MAX_CONCURRENT_HTTP || '5', 10) // aynı anda 5 istek
const MIN_TIME_MS = parseInt(process.env.SCRAPE_MIN_TIME_MS || '200', 10)     // istekler arası 200ms

// Proxy listesi (opsiyonel). Örn: HTTP(S) proxy URL'lerini virgülle koy: http://user:pass@host:port,https://host2:port
const PROXIES = (process.env.SCRAPE_PROXIES || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

// Basit UA havuzu
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
]

// —— Bottleneck: HTTP isteklerini sınırlama ——
const httpLimiter = new Bottleneck({
  maxConcurrent: MAX_CONCURRENT_HTTP,
  minTime: MIN_TIME_MS,
})

// —— Axios instance + Retry ——
const http = axios.create({
  timeout: HTTP_TIMEOUT_MS,
  // 4xx'lerde de HTML dönebileceği için 499'a kadar kabul edelim, 5xx retry'e düşecek:
  validateStatus: s => s >= 200 && s < 500,
})

axiosRetry(http, {
  retries: RETRIES,
  retryDelay: (retryCount, error) => {
    // exponential backoff + jitter
    const base = Math.min(1000 * 2 ** (retryCount - 1), 8000) // 1s, 2s, 4s, 8s cap
    const jitter = Math.floor(Math.random() * 500)            // 0-500ms
    return base + jitter
  },
  retryCondition: (error) => {
    // Ağ/timeouts, 5xx ve 429'da tekrar dene
    if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return true
    const status = error?.response?.status
    return status >= 500 || status === 429 || axiosRetry.isNetworkOrIdempotentRequestError(error)
  },
})

let proxyIndex = 0
function getNextProxyAgent() {
  if (!PROXIES.length) return undefined
  const url = PROXIES[proxyIndex++ % PROXIES.length]
  try {
    return new HttpsProxyAgent(url)
  } catch (e) {
    console.error('Invalid proxy URL:', url, e?.message)
    return undefined
  }
}

function pickUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

async function httpGet(url) {
  const agent = getNextProxyAgent() // undefined ise proxy kullanılmaz
  const headers = {
    'User-Agent': pickUA(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
  }

  // Bottleneck ile sıraya al
  return httpLimiter.schedule(async () => {
    try {
      const res = await http.get(url, {
        headers,
        httpAgent: agent,
        httpsAgent: agent,
      })
      return res
    } catch (err) {
      // axiosRetry denemeleri bittiyse düşer
      throw err
    }
  })
}

function getText($, cols, idx) {
  const el = cols.get(idx)
  return el ? $(el).text().trim() : ''
}

export async function scrapeServices({ domain, path, categoryClass }) {
  const url = `https://${domain}/${path}`

  try {
    const response = await httpGet(url)

    if (response.status >= 400) {
      console.error(`HTTP ${response.status} at ${url}`)
      return []
    }

    const $ = cheerio.load(response.data)
    const services = []

    $('table tr').each((_, row) => {
      const $row = $(row)
      if (categoryClass && $row.find(`.${categoryClass}`).length > 0) return

      const cols = $row.find('td')
      if (cols.length === 0) return

      const id = getText($, cols, 0)
      const name = getText($, cols, 1)
      const price = getText($, cols, 2)
      const min = getText($, cols, 3)
      const max = getText($, cols, 4)

      if (id && name) {
        services.push({
          site: domain,
          id,
          name,
          price,
          min,
          max,
        })
      }
    })

    return services
  } catch (err) {
    // Burada throw ETMİYORUZ — controller devam edebilsin
    console.error(`Scrape exception at ${url}:`, err?.message || err)
    return []
  }
}
