// youtubeApi.ts

import { ApiOrder, Order } from "../types";

// ─── 1) API Key Rotator ────────────────────────────────────────────────────────

const apiKeys = [
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
    const embedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(embedUrl);
    if (response.ok) {
      const data: any = await response.json();
      addLog(`✅ Video is accessible: ${data.title}`);
      return { accessible: true, title: data.title };
    } else {
      if (response.status === 404) {
        addLog(`❌ Video not found or deleted: ${videoId}`);
        return { accessible: false, error: 'video_not_found' };
      } else if (response.status === 401 || response.status === 403) {
        addLog(`❌ Embedding is disabled for this video: ${videoId}`);
        return { accessible: false, error: 'embedding_disabled' };
      } else {
        addLog(`❌ Unknown error while checking video (Status: ${response.status}): ${videoId}`);
        return { accessible: false, error: 'unknown', status: response.status };
      }
    }
  } catch (error) {
    addLog(`❌ oEmbed API error: ${(error as Error).message}`);
    return { accessible: false, error: 'api_error' };
  }
};