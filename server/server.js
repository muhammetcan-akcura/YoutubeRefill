// server.js (veya api.js)
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv';
import TicketRouters from './ticketRouter.js';
import TwitterRouters from './twitterRouters.js';
import TiktokFollowRouters from './routes/tiktok/follow.js';
import TiktokLikeRouters from './routes/tiktok/like.js'
import TiktokWiewsRouters from './routes/tiktok/views.js'
import TiktokSharesRouters from './routes/tiktok/share.js'
import TiktokSavesRouters from './routes/tiktok/save.js'
import TiktokCommentRouters from './routes/tiktok/comments.js'
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(TicketRouters)
app.use(TwitterRouters)
app.use(TiktokFollowRouters)
app.use(TiktokLikeRouters)
app.use(TiktokWiewsRouters)
app.use(TiktokSharesRouters)
app.use(TiktokSavesRouters)
app.use(TiktokCommentRouters)
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

const PORT = process.env.PORT1 ;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
