// controllers/serviceController.js
import { getServicesWithPagination,getTwitterServices } from '../services/serviceService.js'

export async function getPaginatedServices(req, res) {
  try {
    const limit = 1000

    const services = await getTwitterServices()

    res.json({
      
      services

    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Sunucu hatası' })
  }
}
