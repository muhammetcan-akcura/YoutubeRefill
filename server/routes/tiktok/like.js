import express from "express";
import axios from "axios";
import fetch from "node-fetch";

const router = express.Router();

// ---- RapidAPI Keys ----
const RAPIDAPI_KEYS = [
  "cdb2001d49msh2a45d9fef1b322ep1b3a56jsnaf70b1052ca1"
];

// ---- Rate limit ----
const MAX_REQUESTS_PER_MINUTE = 175;
const WINDOW_MS = 60 * 1000;

// ---- Cache ----
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

// ---- Key blocking/rotation ----
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

// ---- (Opsiyonel) Redirect çözümleyici ----
async function resolveRedirectAndExtractId(url) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    const finalUrl = response.url;
    const match = finalUrl.match(
      /(?:video|photo|live|story|playlist)\/(\d{10,20})|[?&](?:item_id|share_item_id)=(\d{10,20})/
    );
    const videoId = (match && (match[1] || match[2])) || null;
    return videoId;
  } catch (err) {
    console.error("Redirect resolve error:", err.message);
    return null;
  }
}

// ---- (Opsiyonel) Basit ID çıkarıcı ----
async function extractVideoIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  const patterns = [
    /(?:vm\.tiktok\.com\/)([\w\d]+)/i,
    /(?:tiktok\.com\/)@[\w\d._-]+\/video\/(\d+)/i,
    /(?:m\.tiktok\.com\/v\/)(\d+)(?:\.html)?/i,
    /(?:www\.tiktok\.com\/)@[\w\d._-]+\/video\/(\d+)/i,
    /(?:tiktok\.com\/t\/)([\w\d]+)/i,
    /^(\d{19})$/,
    /(?:tiktok\.com.*?\/video\/?)(\d+)/i,
    /(?:tiktok\.com.*?v=)(\d+)/i,
    /(?:\/video\/)(\d+)/i
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }

  if (url.includes("vm.tiktok.com") || url.includes("tiktok.com/t/")) {
    return await resolveRedirectAndExtractId(url);
  }
  return null;
}

// ---- TikTok likes çekme ----
async function fetchVideoLikes(videoUrlOrId, originalUrl) {
  const videoIdOrUrl = videoUrlOrId;

  const cached = cache.get(videoIdOrUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.data, url: originalUrl };
  }

  let attempts = 0;
  const maxAttempts = RAPIDAPI_KEYS.length;

  while (attempts < maxAttempts) {
    const apiKey = getNextApiKey();
    if (!apiKey) {
      return {
        url: originalUrl,
        videoId: videoIdOrUrl,
        count: 0,
        success: false,
        error: "All API keys are rate limited (429). Try later."
      };
    }

    try {
      const response = await axios.get(
        "https://tokapi-mobile-version.p.rapidapi.com/v1/post",
        {
          params: { video_url: videoIdOrUrl },
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "tokapi-mobile-version.p.rapidapi.com"
          },
          timeout: 20000
        }
      );

      const likes = (response.data &&
        response.data.aweme_detail &&
        response.data.aweme_detail.statistics &&
        response.data.aweme_detail.statistics.digg_count) ?? -1;

      const result = {
        url: originalUrl,
        videoId: videoIdOrUrl,
        count: likes,
        success: true
      };

      cache.set(videoIdOrUrl, {
        data: { videoId: videoIdOrUrl, count: likes, success: true },
        timestamp: Date.now()
      });

      return result;
    } catch (err) {
      if (err.response && err.response.status === 429) {
        blockedKeys.set(apiKey, Date.now() + 60 * 60 * 1000); // 1 saat block
        attempts++;
      } else {
        const status = (err.response && err.response.status) || null;
        const rawData = (err.response && err.response.data) || null;

        const result = {
          url: originalUrl,
          videoId: videoIdOrUrl,
          count: 0,
          success: false,
          status,
          error: err.message,
          rawData
        };

        cache.set(videoIdOrUrl, {
          data: {
            videoId: videoIdOrUrl,
            count: 0,
            success: false,
            error: err.message
          },
          timestamp: Date.now()
        });

        return result;
      }
    }
  }

  return {
    url: originalUrl,
    videoId: videoIdOrUrl,
    count: 0,
    success: false,
    error: "All API keys are rate limited (429). Try later."
  };
}

// ---- Yardımcı: dizi parçalama ----
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ---- Rate-limited koşucu ----
async function runRateLimited(tasks, perMinute = MAX_REQUESTS_PER_MINUTE) {
  if (tasks.length === 0) return [];

  // <175 ise hepsi paralel (en hızlı)
  if (tasks.length <= perMinute) {
    return Promise.all(tasks.map((fn) => fn()));
  }

  // >=175 ise 175'lik partiler—her partiyi 1 dakikalık pencereyle çalıştır
  const parts = chunk(tasks, perMinute);
  const results = [];

  for (let p = 0; p < parts.length; p++) {
    const part = parts[p];
    const start = Date.now();

    const partResults = await Promise.all(part.map((fn) => fn()));
    results.push(...partResults);

    if (p < parts.length - 1) {
      const elapsed = Date.now() - start;
      const remaining = WINDOW_MS - elapsed;
      if (remaining > 0) await sleep(remaining);
    }
  }

  return results;
}

// ---- Route ----
router.post("/api/tiktok/likes", async (req, res) => {
  const { links } = req.body;

  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: "No TikTok links provided" });
  }

  try {
    const tasks = links.map((url) => {
      // İstersen burada extractVideoIdFromUrl(url) ile ID çıkarabilirsin.
      const videoIdOrUrl = url; // TokAPI tam URL kabul ediyor
      return () => fetchVideoLikes(videoIdOrUrl, url);
    });

    const results = await runRateLimited(tasks, MAX_REQUESTS_PER_MINUTE);

    res.json({
      data: results,
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      totalLikes: results.reduce(
        (sum, r) => (typeof r.count === "number" ? sum + r.count : sum),
        0
      )
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
