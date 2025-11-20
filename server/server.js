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
import InstagramWiewsRouters from './routes/instagram/views.js'
import InstagramLikesRouters from './routes/instagram/like.js'
import InstagramFollowRouters from './routes/instagram/follow.js'
import InstagramCommentRouters from './routes/instagram/comments.js'
import InstagramPartialRouters from './routes/instagram/partial.js'
import TwitterPartialRouters from './routes/twitter/partial.js'
import ratesRouters from './routes/rates/index.js'
import siteRoutes from './routes/siteRoutes.js'
import scrapeRoutes from './routes/scrapeRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import refillRoutes from './refillRoutes.js'
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
app.use(InstagramWiewsRouters)
app.use(InstagramLikesRouters)
app.use(InstagramFollowRouters)
app.use(InstagramCommentRouters)
app.use(ratesRouters)
app.use(siteRoutes)
app.use(scrapeRoutes)
app.use(serviceRoutes)
app.use(refillRoutes)
app.use(InstagramPartialRouters)
app.use(TwitterPartialRouters)
const apikey = process.env.apikey;
console.log(apikey)
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

const PORT = process.env.PORT1 || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

