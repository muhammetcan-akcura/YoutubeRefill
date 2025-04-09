import { ApiOrder, Order } from "../types";

export const extractVideoId = (url: string, addLog: (message: string) => void) => {
    let videoId = null;
    
    if (url.includes('anon.ws') || url.includes('r=http')) {
      try {
        const urlObj = new URL(url);
        const redirectParam = urlObj.searchParams.get('r');
        
        if (redirectParam) {
          url = decodeURIComponent(redirectParam);
          addLog(`Yönlendirme URL'si tespit edildi. Gerçek URL: ${url}`);
        }
      } catch (error) {
        addLog(`URL parse hatası: ${(error as Error).message}`);
      }
    }
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|live\/|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    
    return videoId;
  };
  
  export const extractChannelId = (url: string, addLog: (message: string) => void) => {
    let channelId = null;
    let channelUsername = null;
    
    try {
      // Yönlendirmeleri işle
      if (url.includes('anon.ws') || url.includes('r=http')) {
        try {
          const urlObj = new URL(url);
          const redirectParam = urlObj.searchParams.get('r');
          
          if (redirectParam) {
            url = decodeURIComponent(redirectParam);
            addLog(`Yönlendirme URL'si tespit edildi. Gerçek URL: ${url}`);
          }
        } catch (error) {
          addLog(`URL parse hatası: ${(error as Error).message}`);
        }
      }
      
      // URL'den @kullanıcıadı formatını doğrudan çıkar
      const usernameMatch = url.match(/\/@([^/?&]+)/);
      if (usernameMatch && usernameMatch[1]) {
        channelUsername = usernameMatch[1];
        addLog(`Handle doğrudan çıkarıldı: @${channelUsername}`);
        return 'username:' + channelUsername;
      }
      
      // Olası URL biçimleri işleme
      if (url.startsWith('http')) {
        try {
          const urlObj = new URL(url);
          const hostname = urlObj.hostname;
          const pathname = urlObj.pathname;
          
          // YouTube URL'si değilse atla
          if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
            addLog(`YouTube URL'si değil: ${url}`);
            return null;
          }
          
          // URL path'i parse et
          if (pathname.includes('/channel/')) {
            // /channel/UC... formatı
            const parts = pathname.split('/channel/');
            if (parts.length > 1) {
              channelId = parts[1].split('/')[0];
              addLog(`Channel ID formatı tespit edildi: ${channelId}`);
              return channelId;
            }
          } 
          else if (pathname.includes('/c/')) {
            // /c/KanalAdı formatı
            channelUsername = pathname.split('/c/')[1].split('/')[0].split('?')[0];
            addLog(`Özel URL formatı tespit edildi: /c/${channelUsername}`);
            return 'username:' + channelUsername;
          }
          else if (pathname.includes('/@')) {
            // /@kullanıcıadı formatı
            channelUsername = pathname.split('/@')[1].split('/')[0].split('?')[0];
            addLog(`Handle formatı tespit edildi: @${channelUsername}`);
            return 'username:' + channelUsername;
          }
          else if (pathname.includes('/user/')) {
            // /user/kullanıcıadı formatı
            channelUsername = pathname.split('/user/')[1].split('/')[0].split('?')[0];
            addLog(`Eski kullanıcı adı formatı tespit edildi: ${channelUsername}`);
            return 'username:' + channelUsername;
          }
        } catch (error) {
          addLog(`URL parse hatası: ${(error as Error).message}`);
        }
      } 
      else {
        // URL formatında değilse, doğrudan kanal ID'si veya adı olabilir
        if (url.startsWith('@')) {
          channelUsername = url.substring(1);
          addLog(`Kanal handle tespit edildi: ${url}`);
          return 'username:' + channelUsername;
        } else if (url.startsWith('UC') && url.length > 20) {
          // Muhtemelen bir Channel ID
          addLog(`Muhtemel Channel ID tespit edildi: ${url}`);
          return url;
        } else {
          // Muhtemelen kanal adı
          channelUsername = url;
          addLog(`Muhtemel kanal adı tespit edildi: ${url}`);
          return 'username:' + channelUsername;
        }
      }
    } catch (error) {
      addLog(`Kanal URL'si parse hatası: ${(error as Error).message}`);
    }
    
    // Son çare olarak, URL'yi doğrudan kullanıcı adı olarak dene
    try {
      if (url.includes('youtube.com')) {
        // URL'den @ işaretinden sonraki ilk parçayı kullanıcı adı olarak al
        const parts = url.split('youtube.com/');
        if (parts.length > 1) {
          const path = parts[1];
          if (path.startsWith('@')) {
            channelUsername = path.split('@')[1].split('/')[0].split('?')[0];
            addLog(`URL'den kullanıcı adı çıkarıldı: ${channelUsername}`);
            return 'username:' + channelUsername;
          }
        }
      }
    } catch (error) {
      addLog(`Son çare kanal parse hatası: ${(error as Error).message}`);
    }
    
    return null;
  };
  
  // API işlemleri
  export const getViewsCount = async (url: string, apiKey: string, addLog: (message: string) => void) => {
    try {
      const videoId = extractVideoId(url, addLog);
      
      if (!videoId) {
        addLog(`Geçersiz YouTube URL'si: ${url}`);
        return null;
      }
      
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        addLog(`Video bulunamadı: ${videoId}`);
        return null;
      }
      
      return parseInt(data.items[0].statistics.viewCount);
      
    } catch (error) {
      addLog(`İzlenme sayısı alınamadı (${url}): ${(error as Error).message}`);
      return null;
    }
  };
  
  export const getLikesCount = async (url: string, apiKey: string, addLog: (message: string) => void) => {
    try {
      const videoId = extractVideoId(url, addLog);
      
      if (!videoId) {
        addLog(`Geçersiz YouTube URL'si: ${url}`);
        return null;
      }
      
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        addLog(`Video bulunamadı: ${videoId}`);
        return null;
      }
      
      return parseInt(data.items[0].statistics.likeCount);
      
    } catch (error) {
      addLog(`Beğeni sayısı alınamadı (${url}): ${(error as Error).message}`);
      return null;
    }
  };

  
  export const getSubscriberCount = async (url: string, apiKey: string, addLog: (message: string) => void) => {
    try {
      let channelValue = extractChannelId(url, addLog);
      
      if (!channelValue) {
        addLog(`Geçersiz YouTube kanal bilgisi: ${url}`);
        return null;
      }
      
      let channelId = channelValue;
      
      // Username formatında ise, önce kanal ID'sini bul
      if (channelValue.startsWith('username:')) {
        const username = channelValue.split('username:')[1];
        addLog(`Kullanıcı adı '${username}' için kanal ID'si aranıyor...`);
        
        try {
          // İlk deneme: doğrudan kanal ismi/kullanıcı adı ile arama
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(username)}&type=channel&maxResults=1&key=${apiKey}`;
          let response = await fetch(searchUrl);
          let data = await response.json();
          
          if (!data.items || data.items.length === 0) {
            addLog(`Arama yöntemiyle kanal bulunamadı: ${username}`);
            return null;
          }
          
          channelId = data.items[0].id.channelId;
          const channelTitle = data.items[0].snippet.title;
          addLog(`Kanal bulundu: "${channelTitle}" (ID: ${channelId})`);
          
          // İkinci bir istek ile abone sayısını al
          const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
          response = await fetch(statsUrl);
          data = await response.json();
          
          if (!data.items || data.items.length === 0) {
            addLog(`Kanal istatistikleri bulunamadı: ${channelId}`);
            return null;
          }
          
          return parseInt(data.items[0].statistics.subscriberCount);
          
        } catch (error) {
          addLog(`Kanal arama hatası: ${(error as Error).message}`);
          return null;
        }
      } else {
        // Doğrudan kanal ID ile devam et
        const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          addLog(`Kanal bulunamadı: ${channelId}`);
          return null;
        }
        
        return parseInt(data.items[0].statistics.subscriberCount);
      }
    } catch (error) {
      addLog(`Abone sayısı alınamadı (${url}): ${(error as Error).message}`);
      return null;
    }
  };
  
  // Veri işleme fonksiyonları
  export const parseOrders = (ordersInput: string, inputMode: 'csv' | 'json', addLog: (message: string) => void): Order[] => {
    const orders: Order[] = [];
    
    try {
      if (inputMode === 'json') {
        // JSON verisi parse etme
        let jsonData: ApiOrder[] = [];
        
        try {
          // Çıplak dizi halinde veya bir JSON objesi içinde olabilir
          const trimmedInput = ordersInput.trim();
          const parsedData = JSON.parse(trimmedInput);
          
          if (Array.isArray(parsedData)) {
            jsonData = parsedData;
          } else if (parsedData && typeof parsedData === 'object') {
            // Objenin içinde bir dizi alanı aramaya çalış
            const possibleArrays = Object.values(parsedData).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              jsonData = possibleArrays[0] as ApiOrder[];
            }
          }
        } catch (err) {
          // Belki JSON pasted from console, [{ ... }] formatında olabilir, bracket ekleyip deneyelim
          try {
            const formattedInput = `[${ordersInput}]`;
            jsonData = JSON.parse(formattedInput);
          } catch (innerErr) {
            addLog(`JSON parse hatası: ${(err as Error).message}`);
            return [];
          }
        }
        
        // API verilerini standart formata dönüştür
        jsonData.forEach(item => {
          if (item.external_id && item.start_count !== undefined && item.count && item.link_url) {
            orders.push({
              id: item.external_id,
              mainID: item.id,
              startCount: item.start_count,
              count: item.count,
              link: item.link_url,
              mainLink:item.link
            });
          }
        });
      } else {
        // CSV verisi parse etme
        const orderLines = ordersInput.split('\n').filter(line => line.trim() !== '');
        
        for (const line of orderLines) {
          const parts = line.split(',');
          if (parts.length >= 5) {
            orders.push({
              id: parts[0].trim(),
              mainID: parts[1].trim(),
              startCount: parts[2].trim(),
              count: parts[3].trim(),
              link: parts[4].trim(),
              mainLink:parts[5].trim()
            });
          }
        }
      }
    } catch (error) {
      addLog(`Veri parse hatası: ${(error as Error).message}`);
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
  
      try {
        const response = await fetch(embedUrl);
  
        if (response.ok) {
          const data = await response.json();
          addLog(`✅ Video is accessible: ${data.title}`);
          return { accessible: true, title: data.title };
        } else {
          const status = response.status;
  
          if (status === 404) {
            addLog(`❌ Video not found or deleted: ${videoId}`);
            return { accessible: false, error: 'video not_found' };
          } else if (status === 401 || status === 403) {
            addLog(`❌ Embedding is disabled for this video: ${videoId}`);
            return { accessible: false, error: 'embedding_disabled' };
          } else {
            addLog(`❌ Unknown error while checking video (Status: ${status}): ${videoId}`);
            return { accessible: false, error: 'unknown', status };
          }
        }
      } catch (error) {
        addLog(`❌ oEmbed API error: ${(error as Error).message}`);
        return { accessible: false, error: 'api_error' };
      }
    } catch (error) {
      addLog(`❌ Unexpected error while checking embed status: ${(error as Error).message}`);
      return { accessible: false, error: 'check_error' };
    }
  };
  