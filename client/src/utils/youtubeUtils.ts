// youtubeApi.ts

import { ApiOrder, Order } from "../types";

// ─── 1) API Key Rotator ────────────────────────────────────────────────────────

const apiKeys = [
  'AIzaSyBnTARZ41aP_m8mAuKPSjIBQPyOjWNJ8WU',
  'AIzaSyCGha7oph_qrLmiAM9oMEpfnZq1KSZkx8A',
  'AIzaSyC5c78i_vF6WOVPuo23szwKwsoJ_dNPNmc',
  'AIzaSyDHon6k7sG3zLoTMX8UpddKWMAo8b4xMy0',
  "AIzaSyDiH0OB2pZ2LyO8AVFk9m-dexWcK06ql8k",
  "AIzaSyD7xp0_6JE2SxkU_sI9-JzfeDIg1VDs4mQ",
  'AIzaSyByxoy4jttg3hQAP-eKEBTFnihnYaLMcMo',
  'AIzaSyDjWHNF12d3czuxStB0A62oyy9-DA-WzB0',
  'AIzaSyDSQtvF83MmJRML2wAIJm27CbU8-Rn6uiQ',
  'AIzaSyB7l7SoOq7Wxe5QfPP1PH4ZgKI57C2_iXI',
  'AIzaSyBgltJn92-T3ZlFCOoYklcHLZKW_7Wru8A',
  'AIzaSyDV0NEOodg0b55bp-HctMYuDWmIFq318K8',
  'AIzaSyBlNj54R7YYNwco8hbV_njjxLR3uLkKMGA',
  'AIzaSyD-py3Wl5kn3UPZ0VRgU-2Da9XH0S5mHRs',
  'AIzaSyBtBIXjPHa3UnZ1mS5igeycAHbrOfZaaDA',
  'AIzaSyC86HtI48jCMFSOw3ib7XjmgvaYibaHYUk',
  'AIzaSyBjBAdDGbN7ttYxC-sdnqV2q1rkUEwdQfc',
  'AIzaSyAWICAwgLbk_v7_dViVUrWFpsDtelR9MlI',
  'AIzaSyBs6gEHzYqTbgBwsIF0jp4-5u8avbSgIsI',
  'AIzaSyCZx-J_9HAcSQfK11jtZgNhLtPEJo45So4',
  'AIzaSyDHwNa98-72PVX3Na6RspoRD_37SGYD4aA',
  'AIzaSyD72-jizQXlJ7PavtY2bH2ps7ZeJlTc5Kg',
  'AIzaSyCxfDQz6PVO8ipOjpX3X_e0eqHIYWCNT4A',
  'AIzaSyBNZvpSwVDponpXOYoOzp_EGRD2nWivXbU',
  'AIzaSyAGGBaKnYrYPnmuBvG4RIYEIzRZFJXMcQw',
  'AIzaSyDjYWY_OwVk69yKHebqAbgDEndgiP9EZ2I',
  'AIzaSyA5nHXcX2vnK3tKMTa3Ev43iUN0CPlYPOE',
  'AIzaSyD7s8QiuGkKGQHa5YPogUXsA4IacmI0XYI',
  'AIzaSyDvKKy04Ab6CGfMsr0ONbpBGpuZ7fjUFQA',
  'AIzaSyD5I0S3Lg7v4d5d8whVFNkE9tF5ZQwpwGE',
  'AIzaSyA0lyBq3iI8iHdUYqmnLM5tySAdininXpg',
  'AIzaSyAaSsqC4SBHWj0dlAfoUOw441cCYtGKjtI',
  'AIzaSyCVRzIRARlDK4xZuuIyh7qhNDZQrJKo_Tc',
  'AIzaSyAqtVti5D_eGiLBN5kgyCFfK8b7rDu2uFk',
  'AIzaSyD9uzWM-OUV7CmGkXMQWSZbEBzbVjyxVDo',
  'AIzaSyB91CcbdV5VWOvT0SScP7vy_N3ahueAja8',
  'AIzaSyC3ljEXhxu-8waPit2vvFAZSQ3OmNt7-Vs',
  'AIzaSyDiLEwgYRma0sQRyQpR7PflUf3iDKDX0z8',
  'AIzaSyB0hRpz5GaIlGCdMadCjWR_HU2-kAxMu0E',
  'AIzaSyDuna-iv9Qq934WMVeNwNqnzsAOfji_I70',
  'AIzaSyDPCcaWPPSxmFbEXqOCS2xjxiN_yu5PxyE',
];
let currentKeyIndex = 0;
async function fetchWithKeyRotation(
  baseUrl: string,
  addLog: (msg: string) => void
): Promise<Response> {
  if (currentKeyIndex >= apiKeys.length) {
    throw new Error("‼️ All your API keys have reached their quota. Can no longer make requests.");
  }

  const key = apiKeys[currentKeyIndex];
  const sep = baseUrl.includes('?') ? '&' : '?';
  const url = `${baseUrl}${sep}key=${key}`;

  try {
    const res = await fetch(url);

    // Başarılı cevap döndüyse direkt olarak dön
    if (res.ok) {
      return res;
    }

    // 403 hata kodu durumunda quota kontrolü
    if (res.status === 403) {
      const clonedRes = res.clone(); // İçeriği birden fazla kez okuyabilmek için
      const text = await clonedRes.text();

      // quotaExceeded kontrolü - hem JSON parse ederek hem de raw text içinde arayarak
      if (text.includes('quotaExceeded') || text.includes('quota')) {
        try {
          const data = JSON.parse(text);
          if (data.errors?.[0]?.reason === 'quotaExceeded' ||
            (data.error?.errors && data.error.errors.some((e: any) => e.reason === 'quotaExceeded'))) {

            currentKeyIndex += 1;
            return fetchWithKeyRotation(baseUrl, addLog);
          }
        } catch (e) {
          // JSON parse hatası durumunda raw text kontrolü
          if (text.includes('quotaExceeded')) {
            currentKeyIndex += 1;
            return fetchWithKeyRotation(baseUrl, addLog);
          }
        }
      }
    }

    // Diğer tüm durumlar için orijinal yanıtı döndür
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers
    });

  } catch (error) {
    addLog(`❌ Fetch hatası: ${(error as Error).message}`);
    throw error;
  }
}


// ─── 2) Video ID Çıkarma ───────────────────────────────────────────────────────

export const extractVideoId = (url: string, addLog: (message: string) => void): string | null => {
  let videoId: string | null = null;

  if (url.includes('anon.ws') || url.includes('r=http')) {
    try {
      const urlObj = new URL(url);
      const redirectParam = urlObj.searchParams.get('r');
      if (redirectParam) {
        url = decodeURIComponent(redirectParam);
        addLog(`Redirect URL detected. Real URL: ${url}`);
      }
    } catch (error) {
      addLog(`URL parse error: ${(error as Error).message}`);
    }
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|live\/|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }

  return videoId;
};


// ─── 3) Channel ID/Username Çıkarma ───────────────────────────────────────────

export const extractChannelId = (url: string, addLog: (message: string) => void): string | null => {
  let channelId: string | null = null;
  let channelUsername: string | null = null;

  // Redirects
  if (url.includes('anon.ws') || url.includes('r=http')) {
    try {
      const urlObj = new URL(url);
      const redirectParam = urlObj.searchParams.get('r');
      if (redirectParam) {
        url = decodeURIComponent(redirectParam);
        addLog(`Redirect URL detected. Real URL: ${url}`);
      }
    } catch (error) {
      addLog(`URL parse error: ${(error as Error).message}`);
    }
  }

  // Direct @username
  const usernameMatch = url.match(/\/@([^/?&]+)/);
  if (usernameMatch) {
    channelUsername = usernameMatch[1];
    addLog(`Handle removed directly: @${channelUsername}`);
    return `username:${channelUsername}`;
  }

  // Full URL
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;

      if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
        addLog(`Not a YouTube URL: ${url}`);
        return null;
      }

      if (pathname.includes('/channel/')) {
        channelId = pathname.split('/channel/')[1].split('/')[0];
        addLog(`Channel ID format detected: ${channelId}`);
        return channelId;
      } else if (pathname.includes('/c/')) {
        channelUsername = pathname.split('/c/')[1].split('/')[0];
        addLog(`Special URL format detected: /c/${channelUsername}`);
        return `username:${channelUsername}`;
      } else if (pathname.includes('/@')) {
        channelUsername = pathname.split('/@')[1].split('/')[0];
        addLog(`Handle format detected: @${channelUsername}`);
        return `username:${channelUsername}`;
      } else if (pathname.includes('/user/')) {
        channelUsername = pathname.split('/user/')[1].split('/')[0];
        addLog(`Old username format detected: ${channelUsername}`);
        return `username:${channelUsername}`;
      }
    } catch (error) {
      addLog(`URL parse error: ${(error as Error).message}`);
    }
  }

  // Plain-text
  if (url.startsWith('@')) {
    channelUsername = url.slice(1);
    addLog(`Channel handle detected: ${url}`);
    return `username:${channelUsername}`;
  } else if (url.startsWith('UC') && url.length > 20) {
    addLog(`Possible Channel ID detected: ${url}`);
    return url;
  } else {
    channelUsername = url;
    addLog(`Possible channel name identified: ${url}`);
    return `username:${channelUsername}`;
  }
};


// ─── 4) YouTube Data API Çağrıları ───────────────────────────────────────────

export const getViewsCount = async (
  url: string,
  addLog: (message: string) => void
): Promise<number | null> => {
  const videoId = extractVideoId(url, addLog);
  if (!videoId) {
    addLog(`Invalid YouTube URL: ${url}`);
    return null;
  }
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}`;
  const res = await fetchWithKeyRotation(apiUrl, addLog);
  const data = await res.json();
  if (!data.items?.length) {
    addLog(`Video not found: ${videoId}`);
    return null;
  }
  return parseInt(data.items[0].statistics.viewCount, 10);
};

export const getLikesCount = async (
  url: string,
  addLog: (message: string) => void
): Promise<number | null> => {
  const videoId = extractVideoId(url, addLog);
  if (!videoId) {
    addLog(`Invalid YouTube URL: ${url}`);
    return null;
  }
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}`;
  const res = await fetchWithKeyRotation(apiUrl, addLog);
  const data = await res.json();
  if (!data.items?.length) {
    addLog(`Video not found: ${videoId}`);
    return null;
  }
  return parseInt(data.items[0].statistics.likeCount, 10);
};

export const getSubscriberCount = async (
  url: string,
  addLog: (message: string) => void
): Promise<number | null> => {
  let channelValue = extractChannelId(url, addLog);
  if (!channelValue) {
    addLog(`Invalid YouTube channel information: ${url}`);
    return null;
  }

  if (channelValue.startsWith('username:')) {
    const username = channelValue.split(':')[1];
    addLog(`Username '${username}' looking for a channel ID for...`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(username)}`;
    const res1 = await fetchWithKeyRotation(searchUrl, addLog);
    const data1: any = await res1.json();
    if (!data1.items?.length) {
      addLog(`No channel found by search method: ${username}`);
      return null;
    }
    channelValue = data1.items[0].id.channelId;
    addLog(`Channel found: "${data1.items[0].snippet.title}" (ID: ${channelValue})`);
  }

  const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelValue}`;
  const res2 = await fetchWithKeyRotation(statsUrl, addLog);
  const data2: any = await res2.json();
  if (!data2.items?.length) {
    addLog(`Channel not found: ${channelValue}`);
    return null;
  }
  return parseInt(data2.items[0].statistics.subscriberCount, 10);
};


// ─── 5) Diğer Fonksiyonlar (Aynı Kaldı) ─────────────────────────────────────

export const parseOrders = (ordersInput: string, inputMode: 'csv' | 'json', addLog: (message: string) => void): Order[] => {
  const orders: Order[] = [];
  try {
    if (inputMode === 'json') {
      let jsonData: ApiOrder[] = [];
      try {
        const parsed = JSON.parse(ordersInput.trim());
        if (Array.isArray(parsed)) jsonData = parsed;
        else {
          const arrs = Object.values(parsed).filter(v => Array.isArray(v));
          if (arrs.length) jsonData = arrs[0] as ApiOrder[];
        }
      } catch {
        addLog('JSON parse error.');
        return [];
      }
      jsonData.forEach(item => {
        if (item.external_id && item.start_count !== undefined && item.count && item.link_url) {
          orders.push({
            id: item.external_id,
            mainID: item.id,
            startCount: item.start_count,
            count: item.count,
            link: item.link_url,
            mainLink: item.link
          });
        }
      });
    } else {
      const lines = ordersInput.split('\n').filter(l => l.trim());
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 5) {
          orders.push({
            id: parts[0].trim(),
            mainID: parts[1].trim(),
            startCount: parts[2].trim(),
            count: parts[3].trim(),
            link: parts[4].trim(),
            mainLink: parts[5]?.trim() || ''
          });
        }
      }
    }
  } catch (err) {
    addLog(`Data parse error: ${(err as Error).message}`);
  }
  return orders;
};

export const checkVideoAccessibility = async (url: string, addLog: (message: string) => void) => {
  try {
    const videoId = extractVideoId(url, addLog);
    if (!videoId) {
      addLog(`❌ Invalid YouTube URL: ${url}`);
      return { accessible: false, error: 'invalid_url' };
    }

    // 1) YouTube Data API ile detaylı meta çek
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails,snippet&id=${videoId}`;
    let apiRes;
    try {
      apiRes = await fetchWithKeyRotation(apiUrl, addLog);
    } catch (err) {
      addLog(`❌ Data API fetch failed: ${(err as Error).message}`);
      return { accessible: false, error: 'api_fetch_failed', details: (err as Error).message };
    }

    // quota / permission gibi durumları burada ele al
    if (!apiRes.ok) {
      const text = await apiRes.text().catch(() => '');
      addLog(`⚠️ Data API returned non-ok status (${apiRes.status}).`);
      // rota: quota -> rotate (fetchWithKeyRotation yapıyor zaten) ama yine de bilgi ver
      if (apiRes.status === 403) {
        // mümkünse sebepleri çözümlemek için body'ye bak
        if (text.includes('quotaExceeded') || text.includes('quota')) {
          addLog('⚠️ Data API quota exceeded on current key(s).');
          return { accessible: false, error: 'quota_exceeded' };
        }
        addLog(`⚠️ Permission / Auth issue (403). Body: ${text.substring(0, 400)}`);
        return { accessible: false, error: 'forbidden', status: 403, body: text };
      }
      if (apiRes.status === 404) {
        addLog('❌ Data API returned 404 (not found). Trying oEmbed as fallback...');
      } else {
        return { accessible: false, error: 'api_non_ok', status: apiRes.status, body: text };
      }
    }

    const apiJson: any = await apiRes.json().catch(() => null);

    // item yoksa videonun bulunamadığı durumu ele al
    if (!apiJson?.items || apiJson.items.length === 0) {
      addLog(`⚠️ Video not returned by Data API: ${videoId}. Trying oEmbed fallback...`);
      // oEmbed fallback açağız (still could be deleted/private)
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      try {
        const o = await fetch(oembedUrl);
        if (o.ok) {
          const od = await o.json();
          addLog(`ℹ️ oEmbed success: ${od.title} — video exists but API couldn't return details (probably private or permission issue).`);
          return {
            accessible: false,
            error: 'api_no_items_but_oembed_ok',
            oembed: { ok: true, title: od.title },
            note: 'Video exists but Data API did not return metadata (possibly private or requires OAuth).'
          };
        } else if (o.status === 404) {
          addLog(`❌ oEmbed 404 — video not found/deleted: ${videoId}`);
          return { accessible: false, error: 'video_not_found' };
        } else if (o.status === 401 || o.status === 403) {
          addLog(`❌ oEmbed returned ${o.status} — embedding disabled or auth required: ${videoId}`);
          return { accessible: false, error: 'embedding_disabled' };
        } else {
          addLog(`❌ oEmbed unknown status ${o.status} for ${videoId}`);
          return { accessible: false, error: 'oembed_unknown', status: o.status };
        }
      } catch (oe) {
        addLog(`❌ oEmbed fetch error: ${(oe as Error).message}`);
        return { accessible: false, error: 'oembed_fetch_error', details: (oe as Error).message };
      }
    }

    // artık metadata var
    const item = apiJson.items[0];
    const status = item.status || {};
    const details = item.contentDetails || {};
    const snippet = item.snippet || {};

    // önemli bayraklar
    const embeddable = status.embeddable === true;
    const privacyStatus = status.privacyStatus || 'unknown';
    const madeForKids = status.madeForKids === true;
    const uploadStatus = status.uploadStatus || 'unknown';
    const license = status.license || null;
    const ageRestricted = details?.contentRating?.ytRating === 'ytAgeRestricted' || false;
    const licensedContent = details?.licensedContent === true;
    const duration = details.duration || null;
    const regionRestriction = details.regionRestriction || null; // { allowed: [...], blocked: [...] } veya undefined

    // oEmbed kontrolu (embed HTML verilip verilmediğini görmek için)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    let oembedOk = false;
    let oembedData: any = null;
    try {
      const oRes = await fetch(oembedUrl);
      if (oRes.ok) {
        oembedOk = true;
        oembedData = await oRes.json();
      } else {
        // 401/403 -> embedding disabled; 404 -> not found
        oembedOk = false;
        oembedData = { status: oRes.status };
      }
    } catch (oe) {
      addLog(`⚠️ oEmbed fetch error: ${(oe as Error).message}`);
    }

    // oynatma hatası önerileri — neden embed çalışmayabilir?
    const problems: string[] = [];
    if (privacyStatus !== 'public') problems.push('privacy');
    if (!embeddable) problems.push('embedding_disabled');
    if (ageRestricted) problems.push('age_restricted');
    if (madeForKids) problems.push('made_for_kids');
    if (licensedContent) problems.push('licensed_content_may_restrict_playback');
    if (regionRestriction?.blocked?.length) problems.push('region_blocked');
    if (uploadStatus !== 'processed') problems.push('not_processed');

    // kullanıcıya okunur hata kodu belirle
    let errorCode: string | null = null;
    if (problems.length) {
      // önceliklendirme: privacy/age/embedding/region
      if (problems.includes('privacy')) errorCode = 'video_private';
      else if (problems.includes('age_restricted')) errorCode = 'age_restricted';
      else if (problems.includes('embedding_disabled')) errorCode = 'embedding_disabled';
      else if (problems.includes('region_blocked')) errorCode = 'region_blocked';
      else if (problems.includes('licensed_content_may_restrict_playback')) errorCode = 'licensed_content';
      else errorCode = 'playback_restricted';
    }

    // detaylı dönüş objesi
    const result = {
      accessible: !errorCode && oembedOk, // embed erişilebilirliği için oembedOk ve no critical errors
      videoId,
      title: snippet.title || null,
      embeddable,
      privacyStatus,
      ageRestricted,
      madeForKids,
      licensedContent,
      license,
      uploadStatus,
      duration,
      regionRestriction, // doğrudan sun
      oembed: { ok: oembedOk, data: oembedData },
      problems,
      errorCode,
      raw: {
        status,
        contentDetails: details,
        snippet
      }
    };

    // logs
    addLog(`ℹ️ Video meta: title=${snippet.title || 'N/A'}, embeddable=${embeddable}, privacy=${privacyStatus}, ageRestricted=${ageRestricted}`);
    if (regionRestriction) {
      addLog(`ℹ️ Region restriction: ${JSON.stringify(regionRestriction)}`);
    }
    if (!oembedOk) {
      addLog(`⚠️ oEmbed not ok (embedding might be disabled or oEmbed blocked).`);
    }
    if (problems.length) {
      addLog(`⚠️ Playback problems detected: ${problems.join(', ')}`);
    } else {
      addLog(`✅ No obvious playback restrictions detected.`);
    }

    return result;
  } catch (error) {
    addLog(`❌ Unexpected error in checkVideoAccessibility: ${(error as Error).message}`);
    return { accessible: false, error: 'unexpected_error', details: (error as Error).message };
  }
};
