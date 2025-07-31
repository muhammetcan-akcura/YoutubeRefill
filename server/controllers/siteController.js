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
