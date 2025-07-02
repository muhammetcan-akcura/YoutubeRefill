// server.js (veya api.js)
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const apikey = process.env.apikey;
async function getAllOrders() {
  let allResults = [];
  let sayac = 0;
const now = Math.floor(new Date('2025-06-12T00:00:00Z').getTime() / 1000);
const oneMonthAgo = Math.floor(new Date('2025-05-31T00:00:00Z').getTime() / 1000);
  while (true) {
    try {
      const response = await axios.get('https://smmexclusive.com/adminapi/v2/orders', {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apikey,
        },
        params: {
          limit: 0,
          offset: sayac * 100,
          created_from: oneMonthAgo,
          created_to: now,
          provider:"fastpanel.io",
          order_status:"completed"
        },
      });

      const data = response.data?.data?.list.map(item=>item.id);
      allResults.push(...data);

      console.log(`Sayfa ${sayac + 1}: ${data.length} kayıt alındı`);

      if (data.length < 99) {
        break; // 99'dan küçükse artık yeni veri yok demektir
      }

      sayac++; // bir sonraki sayfaya geç
    } catch (error) {
      console.error('API Hatası:', error.response?.data || error.message);
      break;
    }
  }

  const resultText = allResults.join(",");

  try {
    await fs.writeFile('siparisler.txt', resultText); // 👈 dosyaya yaz
    console.log('siparisler.txt dosyasına yazıldı');
  } catch (err) {
    console.error('Dosya yazılırken hata oluştu:', err);
  }

  return resultText;
}

getAllOrders()