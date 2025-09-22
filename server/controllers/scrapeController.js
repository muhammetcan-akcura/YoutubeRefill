// controllers/scrapeController.js
import pLimit from 'p-limit'
import { getAllSites } from '../services/siteService.js'
import { insertServices } from '../services/serviceService.js'
import { scrapeServices } from '../scrapers/scraper.js'

// Aynı anda en fazla kaç site işlensin (HTTP istekleri zaten scraper içinde Bottleneck ile sınırlı)
const MAX_CONCURRENT_SITES = parseInt(process.env.SCRAPE_MAX_CONCURRENT_SITES || '3', 10)

export async function scrapeAllSites(req, res) {
  try {
    const sites = await getAllSites()
    const limit = pLimit(MAX_CONCURRENT_SITES)

    const tasks = sites.map(site =>
      limit(async () => {
        // Her site bağımsız try/catch
        try {
          const services = await scrapeServices(site)
          if (services.length > 0) {
            try {
              await insertServices(services)
              return { domain: site.domain, count: services.length }
            } catch (dbErr) {
              console.error(`DB insert failed for ${site.domain}:`, dbErr.message)
              return { domain: site.domain, error: `insert_failed: ${dbErr.message}`, count: services.length }
            }
          } else {
            return { domain: site.domain, count: 0 }
          }
        } catch (scrapeErr) {
          // scrapeServices zaten [] döndürüyor ama yine de güvenli
          console.error(`Scrape failed for ${site.domain}:`, scrapeErr.message)
          return { domain: site.domain, error: `scrape_failed: ${scrapeErr.message}` }
        }
      })
    )

    const settled = await Promise.allSettled(tasks)
    const allResults = settled.map((r, i) => {
      const domain = sites[i]?.domain || 'unknown'
      if (r.status === 'fulfilled') return r.value
      console.error(`Unhandled failure for ${domain}:`, r.reason?.message || r.reason)
      return { domain, error: 'unhandled_failure' }
    })

    res.json({ success: true, scraped: allResults })
  } catch (err) {
    console.error('scrapeAllSites fatal error:', err.message)
    res.status(500).json({ success: false, message: 'Scrape failed', error: err.message })
  }
}
