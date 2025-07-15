import express from "express"
import axios from "axios"
import ExcelJS from "exceljs"
import path from "path"

const router = express.Router()

// Verilen service_id ile profit dizisindeki servisi bulur
const findServiceById = (id, profitData) => {
  for (const category of profitData) {
    if (!category.services) continue
    for (const service of category.services) {
      if (String(service.id) === String(id)) {
        return service
      }
    }
  }
  return null
}

router.post("/custom-rates", async (req, res) => {
  const { site, profit } = req.body

  if (!profit || !site) {
    return res.status(400).json({ message: "profit ve site zorunludur." })
  }

  // Sağlıklı url oluştur
  const platform = `https://${site}/adminapi/v2`
  const apikey = site === 'socialpanel.app' ? process.env.API_KEY_SOCIAL : site === 'youtubee.net'? process.env.API_KEY_YOUTUBEE : process.env.API_KEY_EXCLUSIVE
  const ids = site === 'socialpanel.app' ? process.env.RATES_IDS_SOCIALPANEL : site === 'youtubee.net'? process.env.RATES_IDS_YOUTUBEE : process.env.RATES_IDS_SMMEXCLUSIVE
  
  try {
    // Kullanıcıları çek
    const response = await axios.get(`${platform}/users`, {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apikey,
      },
      params: {
        limit: 0,
        offset: 0,
        ids: ids,
      },
    })

    const users = response.data?.data?.list || []
    const allOutputData = []
    const userGroupedData = {}

    // Debug logs
    console.log('Profit categories:', profit?.length || 0)
    console.log('Users found:', users?.length || 0)

    for (const user of users) {
      const username = user.username
      const customRates = user.custom_rates || []

      console.log(`Processing user: ${username}, custom rates: ${customRates.length}`)

      for (const rate of customRates) {
        // profit parametresini fonksiyona geç
        const service = findServiceById(rate.service_id, profit)
        if (!service) {
          console.log(`Service not found for ID: ${rate.service_id}`)
          continue
        }

        const providerRate = parseFloat(service.provider_rate)
        const price = parseFloat(service.price)
        const percent = parseFloat(rate.percent)
        const customRate = parseFloat(rate.custom_rate)

        // Satış fiyatı hesapla
        let salePrice
        if (percent === 0) {
          salePrice = customRate
        } else {
          salePrice = (price / 100) * customRate
        }

        // Kar marjı hesapla
        let profitPercent = null
        if (!isNaN(providerRate) && providerRate > 0) {
          profitPercent = ((salePrice - providerRate) / providerRate) * 100
        }

        const record = {
          username,
          service_id: rate.service_id,
          service_name: rate.service_name,
          sale_price: Number(salePrice.toFixed(4)),
          cost_price: isNaN(providerRate) ? null : Number(providerRate.toFixed(4)),
          profit_percent: profitPercent !== null ? Number(profitPercent.toFixed(2)) : null,
        }

        // %10 ve üzeri kar olanları ekleme
        if (record.profit_percent !== null && record.profit_percent >= 10) continue

        allOutputData.push(record)
        if (!userGroupedData[username]) userGroupedData[username] = []
        userGroupedData[username].push(record)
      }
    }

    console.log('Total records processed:', allOutputData.length)

    // Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook()

    // Ortak kolon yapısı
    const columns = [
      { header: "Username", key: "username", width: 20 },
      { header: "Service ID", key: "service_id", width: 15 },
      { header: "Service Name", key: "service_name", width: 40 },
      { header: "Sale Price", key: "sale_price", width: 15 },
      { header: "Cost Price", key: "cost_price", width: 15 },
      { header: "Profit %", key: "profit_percent", width: 12 },
    ]

    // Sayfa oluşturma fonksiyonu
    const createSheet = (sheetName, data) => {
      const sheet = workbook.addWorksheet(sheetName)
      sheet.columns = columns

      const valid = data.filter((d) => d.cost_price !== null)
      const invalid = data.filter((d) => d.cost_price === null)

      valid.sort((a, b) => a.profit_percent - b.profit_percent)

      // Kar marjına göre renklendir
      for (const record of valid) {
        const row = sheet.addRow(record)
        const percent = record.profit_percent

        if (percent === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFA500" }, // Turuncu
            }
          })
        } else if (percent < 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF0000" }, // Kırmızı
            }
          })
        }
        // 0 < percent < 10 için stil yok (beyaz)
      }

      // Eksik provider_rate olanları sarı renkle ekle
      for (const record of invalid) {
        const row = sheet.addRow(record)
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF00" }, // Sarı
          }
        })
      }
    }

    // All sayfası
    createSheet("All", allOutputData)

    // Her kullanıcı için ayrı sayfa
    for (const [username, data] of Object.entries(userGroupedData)) {
      const cleanName = username.substring(0, 31).replace(/[\[\]:*?/\\]/g, "")
      createSheet(cleanName, data)
    }

    // Excel'i kaydet
    const outputPath = path.join(process.cwd(), "custom_rates_profit_report.xlsx")
    await workbook.xlsx.writeFile(outputPath)

    // İstek yapan client'a JSON veri dön
    res.status(200).json({ 
      data: allOutputData,
      summary: {
        totalRecords: allOutputData.length,
        totalUsers: Object.keys(userGroupedData).length
      }
    })
  } catch (err) {
    console.error("Hata:", err.message)
    res.status(500).json({ message: err.message })
  }
})

export default router