// server.js (veya api.js)
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv';
import TicketRouters from './ticketRouter.js';
import TwitterRouters from './twitterRouters.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(TicketRouters)
app.use(TwitterRouters)
const apikey = process.env.apikey;
app.post('/api/orders', async (req, res) => {
  const { ids } = req.body;


  try {
    const response = await axios.get('https://smmexclusive.com/adminapi/v2/orders', {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apikey
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

const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
