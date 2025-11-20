// routes/refillBatch.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// yardımcı: bekle
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// yardımcı: random ms arası (inclusive)
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


router.post('/refill-batch', async (req, res) => {
  try {
    const {
      ids,
      domain,
      cookie,
      minDelay = 300,
      maxDelay = 1000,
      concurrency = 1
    } = req.body ?? {};

    // validation
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids alanı boş olamaz. Array olmalı.' });
    }
    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ error: 'domain alanı gerekli.' });
    }
    if (!cookie || typeof cookie !== 'string') {
      return res.status(400).json({ error: 'cookie alanı gerekli.' });
    }

    // sonuçları topla
    const results = [];

    // Worker fonksiyonu: tek bir id için istek atar
    const sendRequest = async (orderId) => {
      try {
        const resAxios = await axios.get(`https://${domain}/orders/${orderId}/refill`, {
          headers: {
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
            "Connection": "keep-alive",
            "Referer": `https://${domain}/orders?search=${orderId}`,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "sec-ch-ua":
              `"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"`,
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": `"Windows"`,
            Cookie: cookie
          },
          timeout: 15000 // 15s timeout
        });

        return { id: orderId, ok: true, status: resAxios.status, data: resAxios.data };
      } catch (err) {
        return {
          id: orderId,
          ok: false,
          status: err.response?.status ?? null,
          error: err.response?.data ?? err.message
        };
      }
    };

    // Basit concurrency kontrolü (seri veya sınırlı paralel)
    if (concurrency <= 1) {
      // seri
      for (const id of ids) {
        const r = await sendRequest(id);
        results.push(r);

        const wait = randomBetween(minDelay, maxDelay);
        // log için konsola yazalım
        console.log(`Processed ${id} -> ${r.ok ? 'OK' : 'ERR'}, waiting ${wait}ms`);
        await sleep(wait);
      }
    } else {
      // sınırlı paralel (basit havuz)
      const pool = [];
      let i = 0;

      const runNext = async () => {
        if (i >= ids.length) return;
        const id = ids[i++];
        const result = await sendRequest(id);
        results.push(result);

        const wait = randomBetween(minDelay, maxDelay);
        console.log(`Processed ${id} -> ${result.ok ? 'OK' : 'ERR'}, waiting ${wait}ms`);
        await sleep(wait);
        // devam et
        await runNext();
      };

      // başlangıç concurrency kadar işi başlat
      for (let j = 0; j < Math.min(concurrency, ids.length); j++) {
        pool.push(runNext());
      }

      // hepsi bitene kadar bekle
      await Promise.all(pool);
    }

    return res.json({
      domain,
      total: ids.length,
      results
    });

  } catch (err) {
    console.error('refill-batch hata:', err);
    return res.status(500).json({ error: err?.message ?? 'Bilinmeyen hata' });
  }
});

export default router;
