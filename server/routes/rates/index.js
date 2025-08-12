import express from 'express';
import axios from 'axios';
import ExcelJS from 'exceljs';
import path from 'path';

const router = express.Router();
const profit = []

const findServiceById = (id) => {
  for (const category of profit) {
    for (const service of category.services) {
      if (String(service.id) === String(id)) {
        return service;
      }
    }
  }
  return null;
};

router.get('/custom-rates', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.PLATFORM3}/users`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.API_KEY_SOCIAL
      },
      params: {
        limit: 0,
        offset: 0,
        ids: process.env.RATES_IDS_SOCIALPANEL
      }
    });



    const users = response.data.data.list;
    const allOutputData = [];
    const userGroupedData = {};

    for (const user of users) {
      const username = user.username;
      const customRates = user.custom_rates || [];

      for (const rate of customRates) {
        const service = findServiceById(rate.service_id);
        if (!service) continue;

        const providerRate = parseFloat(service.provider_rate);
        const price = parseFloat(service.price);
        const percent = parseFloat(rate.percent);
        const customRate = parseFloat(rate.custom_rate);

        let salePrice;
        if (percent === 0) {
          salePrice = customRate;
        } else {
          salePrice = (price / 100) * customRate;
        }

        let profitPercent = null;
        if (!isNaN(providerRate) && providerRate > 0) {
          profitPercent = ((salePrice - providerRate) / providerRate) * 100;
        }

        const record = {
          username,
          service_id: rate.service_id,
          service_name: rate.service_name,
          sale_price: Number(salePrice.toFixed(4)),
          cost_price: isNaN(providerRate) ? null : Number(providerRate.toFixed(4)),
          profit_percent: profitPercent !== null ? Number(profitPercent.toFixed(2)) : null
        };

        // ❌ %10 ve üzeri kâr olanları hiç ekleme
        if (record.profit_percent !== null && record.profit_percent >= 10) continue;

        allOutputData.push(record);
        if (!userGroupedData[username]) userGroupedData[username] = [];
        userGroupedData[username].push(record);
      }
    }

    // 📘 Yeni Excel dosyası
    const workbook = new ExcelJS.Workbook();

    // 🧱 Ortak sütun yapısı
    const columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Service ID', key: 'service_id', width: 15 },
      { header: 'Service Name', key: 'service_name', width: 40 },
      { header: 'Sale Price', key: 'sale_price', width: 15 },
      { header: 'Cost Price', key: 'cost_price', width: 15 },
      { header: 'Profit %', key: 'profit_percent', width: 12 }
    ];

    // 🔁 Sayfa oluştur
    const createSheet = (sheetName, data) => {
      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = columns;

      const valid = data.filter(d => d.cost_price !== null);
      const invalid = data.filter(d => d.cost_price === null);

      // Kar marjına göre sırala
      valid.sort((a, b) => a.profit_percent - b.profit_percent);

      // ✅ Geçerli kayıtları renklendirerek ekle
      for (const record of valid) {
        const row = sheet.addRow(record);
        const percent = record.profit_percent;

        if (percent === 0) {
          // 🟧 Turuncu
          row.eachCell(cell => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFA500' } // turuncu
            };
          });
        } else if (percent < 0) {
          // 🔴 Kırmızı
          row.eachCell(cell => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF0000' } // kırmızı
            };
          });
        }
        // 0 < percent < 10 → beyaz, yani hiç stil verilmez
      }

      // ⚠️ Eksik provider_rate olanları ekle (sarı)
      for (const record of invalid) {
        const row = sheet.addRow(record);
        row.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF00' } // sarı
          };
        });
      }
    };

    // 🟡 All sayfası
    createSheet('All', allOutputData);

    for (const [username, data] of Object.entries(userGroupedData)) {
      const cleanName = username.substring(0, 31).replace(/[\[\]:*?/\\]/g, '');
      createSheet(cleanName, data);
    }

    const outputPath = path.join(process.cwd(), 'custom_rates_profit_report.xlsx');
    await workbook.xlsx.writeFile(outputPath);

    res.status(200).json({
      message: 'Kâr raporu başarıyla oluşturuldu.',
      file: '/custom_rates_profit_report.xlsx'
    });

  } catch (err) {
    console.error('Hata:', err.message);
    res.status(500).json({ message: 'Veri alınamadı veya işlenemedi.' });
  }
});

export default router;