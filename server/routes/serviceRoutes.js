// routes/serviceRoutes.js
import express from 'express'
import { getPaginatedServices } from '../controllers/serviceListControllers.js'

const router = express.Router()

router.get('/services', getPaginatedServices)

export default router
