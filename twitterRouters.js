// import express from "express";
// import axios from "axios";
// import pLimit from "p-limit";

// const router = express.Router();

// const BEARER_TOKENS = [
// "AAAAAAAAAAAAAAAAAAAAAAIw2AEAAAAAsktHT3GByvweOQcBXi1n4iF4IR4%3DM906ehVOhnMYAiKpYma0SzbXt3nIcYv5GrDGwDfz8Au246NsiZ",
// "AAAAAAAAAAAAAAAAAAAAAKwx2AEAAAAAOCP29MpfWHgvYMVbC4cnckNwSpQ%3DQwIfWQVjNHC5AK9dB4KbIwb9P5Flhl9fTR5QWIU8GO0JegBCUu",
// "AAAAAAAAAAAAAAAAAAAAAL0x2AEAAAAAcHF8KsShjCsZNj%2Fx3JQZ70cJiSU%3DAlVRpWiMIUFSYajiLe29ZkepCl0veRjsVPj7M9auhoq1qjgT69"
// ];

// // Basit in-memory cache (RAM’de tutuluyor)
// const cache = new Map();

// // Cache süresi (10 dakika)
// const CACHE_TTL = 10 * 60 * 1000;

// // Token rotasyonu için index
// let currentTokenIndex = 0;

// // Token seçici (round-robin)
// function getNextToken() {
//   const token = BEARER_TOKENS[currentTokenIndex];
//   currentTokenIndex = (currentTokenIndex + 1) % BEARER_TOKENS.length;
//   return token;
// }

// // İstek limiti: Aynı anda max 5 istek
// const limit = pLimit(5);

// async function fetchUserData(username) {
//   // Cache kontrolü
//   const cached = cache.get(username);
//   if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//     return cached.data;
//   }

//   const token = getNextToken();

//   try {
//     const response = await axios.get(
//       `https://api.twitter.com/2/users/by/username/${username}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         params: {
//           "user.fields": "public_metrics",
//         },
//       }
//     );

//     const user = response.data.data;

//     const result = {
//       username,
//       followers_count: user?.public_metrics?.followers_count ?? null,
//       success: true,
//     };

//     // Cache’e kaydet
//     cache.set(username, { data: result, timestamp: Date.now() });

//     return result;
//   } catch (err) {
//     // Hata detaylarını yakala
//     const status = err.response?.status || null;
//     const rawData = err.response?.data || null;

//     const result = {
//       username,
//       followers_count: null,
//       success: false,
//       status,
//       error: err.message,
//       rawData,
//     };

//     // Cache’e kaydet (hatalı sonuç da cache’de tutulabilir)
//     cache.set(username, { data: result, timestamp: Date.now() });

//     return result;
//   }
// }

// router.post("/api/twitter", async (req, res) => {
//   const { usernames } = req.body;

//   if (!Array.isArray(usernames) || usernames.length === 0) {
//     return res.status(400).json({ error: "No usernames provided" });
//   }

//   if (usernames.length > 100) {
//     return res.status(400).json({ error: "Maximum 100 usernames allowed" });
//   }

//   try {
//     const results = await Promise.all(
//       usernames.map((username) => limit(() => fetchUserData(username)))
//     );

//     res.json({
//       data: results,
//       total: results.length,
//       successful: results.filter((r) => r.success).length,
//       failed: results.filter((r) => !r.success).length,
//     });
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;


// import express from "express";
// import pLimit from "p-limit";
// import puppeteer from "puppeteer";

// const router = express.Router();

// const limit = pLimit(1); // concurrency 1, sırayla yapıyoruz

// const cache = new Map();
// const CACHE_TTL = 10 * 60 * 1000; // 10 dakika

// let browser = null;
// async function getBrowser() {
//   if (!browser) {
//     browser = await puppeteer.launch({
//       headless: false,
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     });
//   }
//   return browser;
// }

// // 6-12 saniye arası random delay
// function delay(min = 6000, max = 12000) {
//   return new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));
// }

// async function autoScroll(page) {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 100;
//       const timer = setInterval(() => {
//         const scrollHeight = document.body.scrollHeight;
//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         if (totalHeight >= scrollHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 300);
//     });
//   });
// }

// async function fetchUserData(username) {
//   const cached = cache.get(username);
//   if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//     return cached.data;
//   }

//   try {
//     const browser = await getBrowser();
//     const page = await browser.newPage();

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
//     );

//     const url = `https://twitter.com/${username}`;
//     await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

//     await delay(2000, 4000);

//     await autoScroll(page);

//     await delay(2000, 4000);

//     // Kullanıcı bulunamadı kontrolü
//     const isNotFound = await page.$('div[data-testid="emptyState"]') !== null;
//     if (isNotFound) {
//       await page.close();
//       const result = {
//         username,
//         followers_count: null,
//         success: false,
//         error: "User not found or suspended",
//       };
//       cache.set(username, { data: result, timestamp: Date.now() });
//       return result;
//     }

//     const followersSelector = `a[href="/${username}/followers"] > span > span`;
//     await page.waitForSelector(followersSelector, { timeout: 8000 });

//     const followersText = await page.$eval(followersSelector, (el) => el.textContent);
//     const followers_count = parseFollowersCount(followersText);

//     await page.close();

//     const result = {
//       username,
//       followers_count,
//       success: true,
//     };

//     cache.set(username, { data: result, timestamp: Date.now() });
//     return result;
//   } catch (err) {
//     const result = {
//       username,
//       followers_count: null,
//       success: false,
//       error: err.message,
//     };
//     cache.set(username, { data: result, timestamp: Date.now() });
//     return result;
//   } finally {
//     // Her istekten sonra 6-12 saniye bekle, rate limit kontrolü için
//     await delay();
//   }
// }

// function parseFollowersCount(text) {
//   if (!text) return null;
//   text = text.replace(/,/g, '').trim();

//   const multipliers = { K: 1000, M: 1000000, B: 1000000000 };
//   const lastChar = text.slice(-1).toUpperCase();

//   if (multipliers[lastChar]) {
//     const num = parseFloat(text.slice(0, -1));
//     if (isNaN(num)) return null;
//     return Math.round(num * multipliers[lastChar]);
//   }

//   const num = parseInt(text, 10);
//   if (isNaN(num)) return null;
//   return num;
// }

// router.post("/api/twitter", async (req, res) => {
//   const { usernames } = req.body;

//   if (!Array.isArray(usernames) || usernames.length === 0) {
//     return res.status(400).json({ error: "No usernames provided" });
//   }

//   if (usernames.length > 100) {
//     return res.status(400).json({ error: "Maximum 100 usernames allowed" });
//   }

//   try {
//     const results = [];
//     for (const username of usernames) {
//       // concurrency 1 + delay ile zaten hız limiti ayarlanıyor
//       const result = await fetchUserData(username);
//       results.push(result);
//     }

//     res.json({
//       data: results,
//       total: results.length,
//       successful: results.filter((r) => r.success).length,
//       failed: results.filter((r) => !r.success).length,
//     });
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;

import express from "express";
import axios from "axios";

const router = express.Router();

// RapidAPI anahtarları (birden fazla anahtar kullanarak rate limit'i aşabilirsin)
const RAPIDAPI_KEYS = [
  "c96ea733acmshfa7985ac84b61ffp149b45jsn85e122d95c35",
  "cdb2001d49msh2a45d9fef1b322ep1b3a56jsnaf70b1052ca1",
  "9f0e55eb4cmshaadaa2017367e34p176ef6jsnc6c8f9065d3b",
  "4276ce9259mshe3bee36fb07fc77p1a5bd2jsn363b5e55dc4b",
  "8ea128e275msh83991b2c5fbda6bp1e5c7cjsn932305c346a4",
  "de9d44aa0amshd1cfcebd0f680e0p18d66cjsnce758f436f87",
  "fa9be3d3a6mshe8c61a1e418fbefp1de337jsn1a161d489ba4",
  "ee4b08c60dmshfe5a8787d5a7770p1446b1jsn66f78f7ffe18",
  "c864d66a79msh5084e58db113d78p12693bjsn3abb1880ae90",
  "c82405414fmsh9fc8e1f12bb51bfp1baf54jsn25cfc31a1f28"
];
const cache = new Map();

const CACHE_TTL = 10 * 60 * 1000;

const blockedKeys = new Map();

function isKeyBlocked(key) {
  const blockedUntil = blockedKeys.get(key);
  if (!blockedUntil) return false;
  if (Date.now() > blockedUntil) {
    blockedKeys.delete(key);
    return false;
  }
  return true;
}

// API key rotasyonu için index
let currentKeyIndex = 0;

// API key seçici (round-robin, blockedKeys'i atlar)
function getNextApiKey() {
  const len = RAPIDAPI_KEYS.length;
  for (let i = 0; i < len; i++) {
    const key = RAPIDAPI_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % len;
    if (!isKeyBlocked(key)) {
      return key;
    }
  }
  // Eğer tüm keyler blocked ise null döner
  return null;
}

// Sleep fonksiyonu
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUserData(username) {
  // Cache kontrolü
  const cached = cache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  let attempts = 0;
  const maxAttempts = RAPIDAPI_KEYS.length;

  while (attempts < maxAttempts) {
    const apiKey = getNextApiKey();
    if (!apiKey) {
      // Tüm API keyler blocked, bekle ya da hata ver
      return {
        username,
        followers_count: null,
        success: false,
        error: "All API keys are rate limited (429). Try later.",
      };
    }

    try {
      const response = await axios.get("https://twitter241.p.rapidapi.com/user", {
        params: { username: username },
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "twitter241.p.rapidapi.com",
        },
      });

      const userData = response.data?.result?.data?.user?.result;
      const followersCount = userData?.legacy?.followers_count || null;

      const result = {
        username,
        followers_count: followersCount,
        success: true,
      };

      cache.set(username, { data: result, timestamp: Date.now() });

      return result;
    } catch (err) {
      if (err.response?.status === 429) {
        // Bu API key rate limit yedi, blockedKeys'e ekle (örneğin 1 saat)
        blockedKeys.set(apiKey, Date.now() + 60 * 60 * 1000);
        attempts++;
        // Diğer API key ile devam etmek için döngü devam edecek
      } else {
        // Başka bir hata varsa direkt döndür
        const status = err.response?.status || null;
        const rawData = err.response?.data || null;

        const result = {
          username,
          followers_count: null,
          success: false,
          status,
          error: err.message,
          rawData,
        };

        cache.set(username, { data: result, timestamp: Date.now() });
        return result;
      }
    }
  }

  // Eğer tüm API keyler 429 verdi ve denendi ise
  return {
    username,
    followers_count: null,
    success: false,
    error: "All API keys are rate limited (429). Try later.",
  };
}

router.post("/api/twitter", async (req, res) => {
  const { usernames } = req.body;

  if (!Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: "No usernames provided" });
  }

  if (usernames.length > 100) {
    return res.status(400).json({ error: "Maximum 100 usernames allowed" });
  }

  try {
    const results = [];

    for (let i = 0; i < usernames.length; i++) {
      const username = usernames[i];
      const result = await fetchUserData(username);
      results.push(result);

      // Son istek değilse 1.15 saniye bekle
      if (i < usernames.length - 1) {
        await sleep(1150);
      }
    }

    res.json({
      data: results,
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
