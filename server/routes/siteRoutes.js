// routes/siteRoutes.js
import express from 'express'
import {
  getSites,
  getSite,
  addSite,
  updateSite,
  deleteSite,
} from '../controllers/siteController.js'

const router = express.Router()

router.get('/sites', getSites)
router.get('/site/:id', getSite)
router.post('/add-site', addSite)
router.put('/update-sites', updateSite)
router.delete('/delete-sites', deleteSite)

export default router
