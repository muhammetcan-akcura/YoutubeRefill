// server.js (veya api.js)
import express from 'express'
import axios from 'axios'
import cors from 'cors'

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/orders', async (req, res) => {
  const { ids,apikey } = req.body;
  console.log(apikey)

  try {
    const response = await axios.get('https://smmexclusive.com/adminapi/v2/orders', {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apikey,
      },
      params: {
        limit: 0,
        offset: 0,
        ids: ids,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('API Hatası:', error.response?.data || error.message);
    res.status(500).json({ error: 'Veri alınırken bir hata oluştu' });
  }
});

const PORT = "https://youtuberefill-1.onrender.com" || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
