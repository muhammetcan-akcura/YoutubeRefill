import express from "express";
import axios from "axios";

const router = express.Router();

// RapidAPI anahtarları (birden fazla anahtar kullanarak rate limit'i aşabilirsin)
const RAPIDAPI_KEYS = [
 "9f0e55eb4cmshaadaa2017367e34p176ef6jsnc6c8f9065d3b"
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
      const response = await axios.get("https://tiktok-api23.p.rapidapi.com/api/user/info", {
        params: { uniqueId: username },
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "tiktok-api23.p.rapidapi.com",
        },
      });
      const count =response.data?.userInfo?.stats?.followerCount || null;

      const result = {
        username,
        count: count,
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

  
  return {
    username,
    count: null,
    success: false,
    error: "All API keys are rate limited (429). Try later.",
  };
}

router.post("/api/tiktok/followers", async (req, res) => {
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
