import express from "express";
import axios from "axios";

const router = express.Router();

const RAPIDAPI_KEYS = [
  "cdb2001d49msh2a45d9fef1b322ep1b3a56jsnaf70b1052ca1"
];
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;
const blockedKeys = new Map();
let currentKeyIndex = 0;

function isKeyBlocked(key) {
  const blockedUntil = blockedKeys.get(key);
  if (!blockedUntil) return false;
  if (Date.now() > blockedUntil) {
    blockedKeys.delete(key);
    return false;
  }
  return true;
}

function getNextApiKey() {
  const len = RAPIDAPI_KEYS.length;
  for (let i = 0; i < len; i++) {
    const key = RAPIDAPI_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % len;
    if (!isKeyBlocked(key)) return key;
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 👇 Instagram kullanıcı adını çıkaran fonksiyon
function extractUsernameFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  url = url.trim();

  // Eğer sadece username verildiyse
  if (/^@?[\w\d._]+$/.test(url)) {
    return url.replace(/^@/, "");
  }

  // instagram.com/username veya instagram.com/username/
  const match = url.match(/instagram\.com\/([\w\d._]+)/i);
  if (match) return match[1].replace(/\/$/, "");

  return null;
}

// 👇 RapidAPI üzerinden Instagram kullanıcısı istatistiklerini al
async function fetchUserStats(username, originalInput) {
  const cached = cache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      ...cached.data,
      input: originalInput
    };
  }

  let attempts = 0;
  const maxAttempts = RAPIDAPI_KEYS.length;

  while (attempts < maxAttempts) {
    const apiKey = getNextApiKey();
    if (!apiKey) {
      return {
        input: originalInput,
        username,
        count: 0,
        success: false,
        error: "Tüm API anahtarları limitte (429). Daha sonra tekrar deneyin.",
      };
    }

    try {
      const response = await axios.get(`https://instagram-fastest.p.rapidapi.com/user/by_username`, {
        params: {
          username: username
        },
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "instagram-fastest.p.rapidapi.com",
        },
      });

      const followers = response.data?.follower_count || -1;
      const result = {
        url: originalInput,
        username,
        count: followers,
        success: true
      };

      cache.set(username, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (err) {
      if (err.response?.status === 429) {
        blockedKeys.set(apiKey, Date.now() + 60 * 60 * 1000);
        attempts++;
      } else {
        const result = {
          url: originalInput,
          username,
          count: 0,
          success: false,
          status: err.response?.status || null,
          error: err.message,
          rawData: err.response?.data || null
        };

        cache.set(username, {
          data: result,
          timestamp: Date.now()
        });

        return result;
      }
    }
  }

  return {
    url: originalInput,
    username,
    count: 0,
    success: false,
    error: "Tüm API anahtarları limitte (429). Daha sonra tekrar deneyin.",
  };
}

// 👇 Route: Instagram follower sayısı alınır
router.post("/api/instagram/followers", async (req, res) => {
  const { links } = req.body;

  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: "Hiçbir Instagram linki gönderilmedi." });
  }

  try {
    const results = [];

    for (let i = 0; i < links.length; i++) {
      const input = links[i];
      const username = extractUsernameFromUrl(input);
      if (!username) {
        results.push({
          url: input,
          username: null,
          count: 0,
          success: false,
          error: "Geçersiz Instagram bağlantısı veya kullanıcı adı"
        });
        continue;
      }

      const result = await fetchUserStats(username, input);
      results.push(result);
    }

    res.json({
      data: results,
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      totalFollowers: results.reduce((sum, r) => sum + (r.count > 0 ? r.count : 0), 0)
    });
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

export default router;
