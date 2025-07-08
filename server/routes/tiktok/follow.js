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

// 👇 Kullanıcı adını çıkaran fonksiyon
function extractUsernameFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  url = url.trim();

  // Eğer sadece username geldiyse
  if (/^@?[\w\d._-]+$/.test(url)) {
    return url.replace(/^@/, "");
  }

  // tiktok.com/@username
  const match = url.match(/tiktok\.com\/@([\w\d._-]+)/i);
  if (match) return match[1];

  // tiktok.com/@username/video/xxx
  const videoMatch = url.match(/tiktok\.com\/@([\w\d._-]+)\/video\//i);
  if (videoMatch) return videoMatch[1];

  // vm.tiktok.com kısa link ise -> resolve et
  if (url.includes("vm.tiktok.com") || url.includes("tiktok.com/t/")) {
    return null; // bu tür linkleri istersen redirect ile çözümle, şu an destek dışı
  }

  return null;
}

// 👇 RapidAPI üzerinden kullanıcıya ait istatistikleri al
async function fetchUserStats(username, originalInput) {
  if (!username) {
    return {
      input: originalInput,
      username: null,
      count: 0,
      success: false,
      error: "Invalid TikTok username or URL format"
    };
  }

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
        error: "All API keys are rate limited (429). Try later.",
      };
    }

    try {
      const response = await axios.get(`https://tokapi-mobile-version.p.rapidapi.com/v1/user/@${username}`, {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "tokapi-mobile-version.p.rapidapi.com",
        },
      });

      const likes = response.data?.user?.follower_count || 0;

      const result = {
        url: originalInput,
        videoId:username,
        count: likes,
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
          videoId:username,
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
   videoId: username,
    count: 0,
    success: false,
    error: "All API keys are rate limited (429). Try later.",
  };
}

router.post("/api/tiktok/followers", async (req, res) => {
  const { links } = req.body;

  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: "No TikTok links provided" });
  }

  try {
    const results = [];

    for (let i = 0; i < links.length; i++) {
      const input = links[i];
      const username = extractUsernameFromUrl(input);
      const result = await fetchUserStats(username, input);
      results.push(result);

      if (i < links.length - 1) {
        await sleep(1150);
      }
    }

    res.json({
      data: results,
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      totalLikes: results.reduce((sum, r) => sum + (r.count || 0), 0)
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
