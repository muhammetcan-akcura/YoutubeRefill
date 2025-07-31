// controllers/scrapeController.js
import { getAllSites } from '../services/siteService.js'
import { insertServices } from '../services/serviceService.js'
import { scrapeServices } from '../scrapers/scraper.js'

export async function scrapeAllSites(req, res) {
  try {
    const sites = await getAllSites()
    let allResults = []

    for (const site of sites) {
      const services = await scrapeServices(site)
      await insertServices(services)
      allResults.push({ domain: site.domain, count: services.length })
    }

    res.json({ success: true, scraped: allResults })
  } catch (err) {
    console.error('Scrape error:', err)
    res.status(500).json({ message: 'Scrape failed', error: err.message })
  }
}
