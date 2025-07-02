import fetch from 'node-fetch';

async function getTikTokVideoIdFromShortUrl(shortUrl) {
  try {
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'follow'
    });

    const finalUrl = response.url;

    const match = finalUrl.match(/video\/(\d+)/);
    if (match) {
      return {
        id: match[1],
        url: finalUrl
      };
    } else {
      throw new Error('Video ID bulunamadı');
    }
  } catch (err) {
    console.error('Hata:', err.message);
    return null;
  }
}

// Kullanım:
getTikTokVideoIdFromShortUrl('https://vt.tiktok.com/ZSB1xvETw/').then(result => {
  if (result) {
    console.log('Video ID:', result.id);
    console.log('Gerçek URL:', result.url);
  }
});
