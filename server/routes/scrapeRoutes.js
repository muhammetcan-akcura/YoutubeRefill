// routes/scrapeRoutes.js
import express from 'express'
import { scrapeAllSites } from '../controllers/scrapeController.js'

const router = express.Router()

router.post('/scrape', scrapeAllSites)

export default router
