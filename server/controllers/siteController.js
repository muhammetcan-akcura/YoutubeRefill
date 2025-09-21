// controllers/siteController.js
import * as SiteService from '../services/siteService.js'

export async function getSites(req, res) {
  const sites = await SiteService.getAllSites();
  res.json(sites);
}

export async function getSite(req, res) {
  const site = await SiteService.getSiteById(req.params.id);
  if (!site) return res.status(404).json({ message: 'Site not found' });
  res.json(site);
}

export async function addSite(req, res) {
  const { domain, path, categoryClass } = req.body;

  // Basit alan kontrolü (opsiyonel)
  if (!domain || !path || !categoryClass) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newSite = await SiteService.createSite({ domain, path, categoryClass });
  res.status(201).json(newSite);
}

// 🆕 YENİ: Multi site ekleme endpoint'i
export async function addMultipleSites(req, res) {
  try {
    const { domains, path = "services", categoryClass = "services-list-category-title" } = req.body;

    // Domains array kontrolü
    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ message: 'Domains array is required and cannot be empty' });
    }

    // Boş domainleri filtrele ve temizle
    const cleanDomains = domains
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    if (cleanDomains.length === 0) {
      return res.status(400).json({ message: 'No valid domains provided' });
    }

    // Tüm siteleri toplu olarak ekle
    const createdSites = [];
    const errors = [];

    for (const domain of cleanDomains) {
      try {
        const newSite = await SiteService.createSite({ 
          domain, 
          path, 
          categoryClass 
        });
        createdSites.push(newSite);
      } catch (error) {
        errors.push({
          domain,
          error: error.message
        });
      }
    }

    // Sonuç döndür
    res.status(201).json({
      success: true,
      created: createdSites.length,
      errors: errors.length,
      sites: createdSites,
      failedSites: errors,
      message: `${createdSites.length} site başarıyla eklendi${errors.length > 0 ? `, ${errors.length} site eklenemedi` : ''}`
    });

  } catch (error) {
    console.error('Multi site creation error:', error);
    res.status(500).json({ 
      message: 'Internal server error during multi site creation',
      error: error.message 
    });
  }
}

export async function updateSite(req, res) {
  const { id, domain, path, categoryClass } = req.body;

  if (!id || !domain || !path || !categoryClass) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const updated = await SiteService.updateSite({ id, domain, path, categoryClass });
  res.json(updated);
}

export async function deleteSite(req, res) {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'Missing id' });

  await SiteService.deleteSite(id);
  res.status(204).send();
}