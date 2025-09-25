import express from "express";
import axios from "axios";

const router = express.Router();

const RAPIDAPI_KEYS = [
  "cdb2001d49msh2a45d9fef1b322ep1b3a56jsnaf70b1052ca1"
];

// Separate cache for each endpoint type
const userCache = new Map();
const tweetCache = new Map();

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
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

let currentKeyIndex = 0;

function getNextApiKey() {
  const len = RAPIDAPI_KEYS.length;
  for (let i = 0; i < len; i++) {
    const key = RAPIDAPI_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % len;
    if (!isKeyBlocked(key)) {
      return key;
    }
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fixed fetchUserData function
async function fetchUserData(username) {
  const cached = userCache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  let attempts = 0;
  const maxAttempts = RAPIDAPI_KEYS.length;

  while (attempts < maxAttempts) {
    const apiKey = getNextApiKey();
    if (!apiKey) {
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
        timeout: 10000 // 10 second timeout
      });

      const userData = response.data?.result?.data?.user?.result;
      const followersCount = userData?.legacy?.followers_count || null;

      const result = {
        username,
        followers_count: followersCount,
        success: true,
      };

      userCache.set(username, { data: result, timestamp: Date.now() });
      return result;

    } catch (err) {
      if (err.response?.status === 429) {
        blockedKeys.set(apiKey, Date.now() + 60 * 60 * 1000); // Block for 1 hour
        attempts++;
      } else {
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

        userCache.set(username, { data: result, timestamp: Date.now() });
        return result;
      }
    }
  }

  return {
    username,
    followers_count: null,
    success: false,
    error: "All API keys are rate limited (429). Try later.",
  };
}

function extractTweetLegacyById(payload, tweetId) {
  const id = String(tweetId);

  // 1) Direkt tekil yapı
  if (payload?.tweet) {
    const t = payload.tweet;
    if (String(t?.rest_id) === id || String(t?.legacy?.id_str) === id) {
      return t.legacy ?? t;
    }
  }
  if (payload?.legacy && String(payload.legacy.id_str) === id) {
    return payload.legacy;
  }

  // 2) V2 threaded_conversation yapısı
  const tci = payload?.data?.threaded_conversation_with_injections_v2;
  const instructions = tci?.instructions || [];
  for (const ins of instructions) {
    const entries = ins?.entries || [];
    for (const entry of entries) {
      // entryId doğrudan eşleşmesi
      if (entry?.entryId === `tweet-${id}`) {
        const res = entry?.content?.itemContent?.tweet_results?.result;
        if (res?.legacy) return res.legacy;
      }
      // result/rest_id eşleşmesi
      const res = entry?.content?.itemContent?.tweet_results?.result;
      if (res) {
        if (String(res?.rest_id) === id) return res.legacy ?? res;
        if (String(res?.legacy?.id_str) === id) return res.legacy;
      }
    }
  }

  // 3) Güvenli geri dönüş: derin arama (son çare)
  let found = null;
  JSON.stringify(payload, (_k, v) => {
    if (!found && v && typeof v === 'object') {
      if (String(v?.legacy?.id_str) === id) found = v.legacy;
      else if (String(v?.id_str) === id) found = v;
      else if (String(v?.rest_id) === id) found = v.legacy ?? v;
    }
    return v;
  });
  return found;
}


// Fixed fetchTweetData function (for likes and retweets)
async function fetchTweetData(tweetId, dataType = 'favorite_count') {
  console.log(`🔍 [fetchTweetData] Starting request for tweetId: ${tweetId}, dataType: ${dataType}`);
  
  const cacheKey = `${tweetId}_${dataType}`;
  const cached = tweetCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`💾 [fetchTweetData] Cache hit for ${cacheKey}:`, cached.data);
    return cached.data;
  }

  let attempts = 0;
  const maxAttempts = RAPIDAPI_KEYS.length;
  console.log(`🔄 [fetchTweetData] Starting API requests, maxAttempts: ${maxAttempts}`);

  while (attempts < maxAttempts) {
    const apiKey = getNextApiKey();
    if (!apiKey) {
      console.log(`❌ [fetchTweetData] No available API key after ${attempts} attempts`);
      return {
        username: tweetId,
        followers_count: null,
        success: false,
        error: "All API keys are rate limited (429). Try later.",
      };
    }

    console.log(`🔑 [fetchTweetData] Attempt ${attempts + 1}/${maxAttempts} with API key: ${apiKey.substring(0, 10)}...`);

    try {
      const requestConfig = {
        params: { pid: tweetId },
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "twitter241.p.rapidapi.com",
        },
        timeout: 10000
      };
      
      console.log(`📡 [fetchTweetData] Making request to: https://twitter241.p.rapidapi.com/tweet`);
      console.log(`📡 [fetchTweetData] Request params:`, requestConfig.params);
      console.log(`📡 [fetchTweetData] Request headers:`, requestConfig.headers);

      const response = await axios.get("https://twitter241.p.rapidapi.com/tweet", requestConfig);

      console.log(`✅ [fetchTweetData] API Response status: ${response.status}`);
      console.log(`📊 [fetchTweetData] Full response data structure:`, JSON.stringify(response.data, null, 2));

      // ---- DOĞRU TWEET'İ ID İLE AYIKLA ----
      const tweetLegacy = extractTweetLegacyById(response.data, String(tweetId));
      if (!tweetLegacy) {
        console.log(`⚠️ [fetchTweetData] No tweet matched tweetId=${tweetId} in payload`);
      } else {
        console.log(`🐦 [fetchTweetData] Matched tweet legacy by id ${tweetId}`);
      }

      // İstenen metriği çek
      let count = tweetLegacy ? tweetLegacy[dataType] : null;

      // Güvenli sayılaştırma (string gelebilir)
      if (count !== null && count !== undefined) {
        const n = Number(count);
        count = Number.isFinite(n) ? n : count;
      }

      console.log(`🎯 [fetchTweetData] Extracted count for ${dataType}: ${count} (type: ${typeof count})`);

      const finalCount = (count !== undefined && count !== null) ? count : null;

      const result = {
        // Mevcut frontend uyumluluğu için aynı alan ismi korunuyor
        username: String(tweetId),
        followers_count: finalCount,
        success: true,
      };

      console.log(`💾 [fetchTweetData] Caching result:`, result);
      tweetCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;

    } catch (err) {
      console.log(`❌ [fetchTweetData] Request failed:`, err.message);
      console.log(`📊 [fetchTweetData] Error response status:`, err.response?.status);
      console.log(`📊 [fetchTweetData] Error response data:`, JSON.stringify(err.response?.data, null, 2));

      if (err.response?.status === 429) {
        console.log(`⏳ [fetchTweetData] Rate limited, blocking key and retrying`);
        blockedKeys.set(apiKey, Date.now() + 60 * 60 * 1000);
        attempts++;
      } else {
        const status = err.response?.status || null;
        const rawData = err.response?.data || null;

        const result = {
          username: String(tweetId),
          followers_count: null,
          success: false,
          status,
          error: err.message,
          rawData,
        };

        console.log(`💾 [fetchTweetData] Caching error result:`, result);
        tweetCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    }
  }

  console.log(`❌ [fetchTweetData] All attempts exhausted for tweetId: ${tweetId}`);
  return {
    username: String(tweetId),
    followers_count: null,
    success: false,
    error: "All API keys are rate limited (429). Try later.",
  };
}

// Removed duplicate functions and replaced with single tweet data function

// Updated routes with proper error handling and validation
router.post("/api/twitter", async (req, res) => {
  const { usernames } = req.body;

  if (!usernames) {
    return res.status(400).json({ error: "Missing 'usernames' field" });
  }

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
      
      // Validate username
      if (!username || typeof username !== 'string' || username.trim() === '') {
        results.push({
          username: username || '',
          followers_count: null,
          success: false,
          error: "Invalid username"
        });
        continue;
      }

      const result = await fetchUserData(username.trim());
      results.push(result);

      // Add delay between requests except for the last one
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
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.post("/api/twitter/likes", async (req, res) => {
  // Support both 'usernames' (for backward compatibility) and 'tweet_ids'
  const { usernames, tweet_ids } = req.body;
  const tweetIds = tweet_ids || usernames;

  if (!tweetIds) {
    return res.status(400).json({ error: "Missing 'tweet_ids' or 'usernames' field" });
  }

  if (!Array.isArray(tweetIds) || tweetIds.length === 0) {
    return res.status(400).json({ error: "No tweet IDs provided" });
  }

  if (tweetIds.length > 100) {
    return res.status(400).json({ error: "Maximum 100 tweet IDs allowed" });
  }

  try {
    const results = [];

    for (let i = 0; i < tweetIds.length; i++) {
      const tweetId = tweetIds[i];
      
      // Validate tweet ID
      if (!tweetId || typeof tweetId !== 'string' || tweetId.trim() === '') {
        results.push({
          username: tweetId || '',
          followers_count: null,
          success: false,
          error: "Invalid tweet ID"
        });
        continue;
      }

      const result = await fetchTweetData(tweetId.trim(), 'favorite_count');
      results.push(result);

      if (i < tweetIds.length - 1) {
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
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.post("/api/twitter/followers", async (req, res) => {
  const { usernames } = req.body;

  if (!usernames) {
    return res.status(400).json({ error: "Missing 'usernames' field" });
  }

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
      
      if (!username || typeof username !== 'string' || username.trim() === '') {
        results.push({
          username: username || '',
          followers_count: null,
          success: false,
          error: "Invalid username"
        });
        continue;
      }

      const result = await fetchUserData(username.trim());
      results.push(result);

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
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.post("/api/twitter/retweet", async (req, res) => {
  // Support both 'usernames' (for backward compatibility) and 'tweet_ids'
  const { usernames, tweet_ids } = req.body;
  const tweetIds = tweet_ids || usernames;

  if (!tweetIds) {
    return res.status(400).json({ error: "Missing 'tweet_ids' or 'usernames' field" });
  }

  if (!Array.isArray(tweetIds) || tweetIds.length === 0) {
    return res.status(400).json({ error: "No tweet IDs provided" });
  }

  if (tweetIds.length > 100) {
    return res.status(400).json({ error: "Maximum 100 tweet IDs allowed" });
  }

  try {
    const results = [];

    for (let i = 0; i < tweetIds.length; i++) {
      const tweetId = tweetIds[i];
      
      if (!tweetId || typeof tweetId !== 'string' || tweetId.trim() === '') {
        results.push({
          username: tweetId || '',
          followers_count: null,
          success: false,
          error: "Invalid tweet ID"
        });
        continue;
      }

      const result = await fetchTweetData(tweetId.trim(), 'retweet_count');
      results.push(result);

      if (i < tweetIds.length - 1) {
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
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;