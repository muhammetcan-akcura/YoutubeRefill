import express from "express";
import axios from "axios";
import fetch from "node-fetch";

const router = express.Router();

const RAPIDAPI_KEYS = [
  "9f0e55eb4cmshaadaa2017367e34p176ef6jsnc6c8f9065d3b"
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

async function fetchVideoLikes(videoId, originalUrl) {
  if (!videoId) {
    return {
      url: originalUrl,
      videoId: null,
      count: 0,
      success: false,
      error: "Invalid Instagram URL format"
    };
  }

  const cached = cache.get(videoId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      ...cached.data,
      url: originalUrl
    };
  }

  let attempts = 0;
  const maxAttempts = RAPIDAPI_KEYS.length;

  while (attempts < maxAttempts) {
    const apiKey = getNextApiKey();
    if (!apiKey) {
      return {
        url: originalUrl,
        videoId,
        count: 0,
        success: false,
        error: "All API keys are rate limited (429). Try later.",
      };
    }

    try {
      const response = await axios.get(`https://instagram-fastest.p.rapidapi.com/media/by_url`, {
        params: {
          url: videoId
        },
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "instagram-fastest.p.rapidapi.com",
        },
      });

      // Burada special kontrol
      if (response.data?.like_and_view_counts_disabled === true) {
        // Beğeni ve görüntüleme sayıları gizli ise -2 dön
        const result = {
          url: originalUrl,
          videoId,
          count: -2,
          success: false,
          error: "Like and view counts are disabled"
        };
        cache.set(videoId, { data: result, timestamp: Date.now() });
        return result;
      }

      const likes = response.data?.edge_media_preview_comment?.count ?? -1;

      const result = {
        url: originalUrl,
        videoId,
        count: likes,
        success: true,
      };

      cache.set(videoId, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (err) {
      if (err.response?.status === 429) {
        blockedKeys.set(apiKey, Date.now() + 60 * 60 * 1000);
        attempts++;
      } else {
        const status = err.response?.status || null;
        const rawData = err.response?.data || null;
        const isNotFound = status === 404 && rawData?.error === "Not found";

        const result = {
          url: originalUrl,
          videoId,
          count: isNotFound ? -1 : 0,
          success: false,
          status,
          error: err.message,
          rawData,
        };

        cache.set(videoId, {
          data: result,
          timestamp: Date.now()
        });

        return result;
      }
    }
  }

  return {
    url: originalUrl,
    videoId,
    count: 0,
    success: false,
    error: "All API keys are rate limited (429). Try later.",
  };
}

router.post("/api/instagram/comments", async (req, res) => {
  const { links } = req.body;

  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: "No Instagram links provided" });
  }

  try {
    const results = [];

    for (let i = 0; i < links.length; i++) {
      const url = links[i];
      const videoId = url;
      const result = await fetchVideoLikes(videoId, url);
      results.push(result);
    }

    res.json({
      data: results,
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      totalLikes: results.reduce((sum, r) =>
        typeof r.count === "number" ? sum + r.count : sum, 0)
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
