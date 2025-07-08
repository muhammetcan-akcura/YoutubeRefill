import express from "express";
import axios from "axios";
import fetch from "node-fetch";

const router = express.Router();

// RapidAPI anahtarları (birden fazla anahtar kullanarak rate limit'i aşabilirsin)
const RAPIDAPI_KEYS = [
  "cdb2001d49msh2a45d9fef1b322ep1b3a56jsnaf70b1052ca1"
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

// Redirect linkler için video ID bulma (kısa linkler için)
async function resolveRedirectAndExtractId(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow'
    });

    const finalUrl = response.url;

    const match = finalUrl.match(/(?:video|photo|live|story|playlist)\/(\d{10,20})|[?&](?:item_id|share_item_id)=(\d{10,20})/);

    const videoId = match?.[1] || match?.[2];

    if (videoId) {
      return videoId;
    } else {
      console.warn("ID bulunamadı, final URL:", finalUrl);
      return null;
    }
  } catch (err) {
    console.error('Redirect resolve error:', err.message);
    return null;
  }
}
async function extractVideoIdFromUrl(url) {
  if (url.includes('vm.tiktok.com') || url.includes('tiktok.com/t/') || url.length < 50) {
    const redirectId = await url;
    if (redirectId) {
      return redirectId;
    }
  }

  if (!url || typeof url !== 'string') {
    return null;
  }

  // TikTok link formatları için regex patterns
  const patterns = [
    // vm.tiktok.com/xxx veya vm.tiktok.com/ZMxxx
    /(?:vm\.tiktok\.com\/)([\w\d]+)/i,
    
    // tiktok.com/@username/video/1234567890123456789
    /(?:tiktok\.com\/)@[\w\d._-]+\/video\/(\d+)/i,
    
    // m.tiktok.com/v/1234567890123456789.html
    /(?:m\.tiktok\.com\/v\/)(\d+)(?:\.html)?/i,
    
    // www.tiktok.com/@username/video/1234567890123456789
    /(?:www\.tiktok\.com\/)@[\w\d._-]+\/video\/(\d+)/i,
    
    // tiktok.com/t/xxx
    /(?:tiktok\.com\/t\/)([\w\d]+)/i,
    
    // Sadece video ID (19 haneli sayı)
    /^(\d{19})$/,
    
    // Diğer olası formatlar
    /(?:tiktok\.com.*?\/video\/?)(\d+)/i,
    /(?:tiktok\.com.*?v=)(\d+)/i,
    /(?:\/video\/)(\d+)/i
  ];

  // Önce regex ile dene
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Regex başarısız olursa ve kısa link gibi görünüyorsa redirect takip et
  
  return null;
}

// Sleep fonksiyonu
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchVideoLikes(videoId, originalUrl) {
  // Geçersiz video ID kontrolü
  if (!videoId) {
    return {
      url: originalUrl,
      videoId: null,
      count: 0,
      success: false,
      error: "Invalid TikTok URL format"
    };
  }

  // Cache kontrolü
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
      // Tüm API keyler blocked, bekle ya da hata ver
      return {
        url: originalUrl,
        videoId,
        count: 0,
        success: false,
        error: "All API keys are rate limited (429). Try later.",
      };
    }

    try {
      const response = await axios.get("https://tokapi-mobile-version.p.rapidapi.com/v1/post", {
        params: { video_url: videoId },
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "tokapi-mobile-version.p.rapidapi.com",
        },
      });
      const likes = response.data?.aweme_detail?.statistics?.collect_count || -1;

      const result = {
        url: originalUrl,
        videoId,
        count: likes,
        success: true,
      };

      cache.set(videoId, { 
        data: {
          videoId,
          count: likes,
          success: true
        }, 
        timestamp: Date.now() 
      });

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
          url: originalUrl,
          videoId,
          count: 0,
          success: false,
          status,
          error: err.message,
          rawData,
        };

        cache.set(videoId, { 
          data: {
            videoId,
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
    videoId,
    count: 0,
    success: false,
    error: "All API keys are rate limited (429). Try later.",
  };
}

router.post("/api/tiktok/saves", async (req, res) => {
  const { links } = req.body;

  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: "No TikTok links provided" });
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
      totalLikes: results.reduce((sum, r) => sum + (r.likes || 0), 0)
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;