import fs from 'fs/promises';
import puppeteer from 'puppeteer';


const WAIT_BETWEEN_REQUESTS_MS = 5000;  
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => Math.floor(Math.random() * 2000) + WAIT_BETWEEN_REQUESTS_MS;  
const normalizeLikes = (str) => {
  if (!str) return 0;
  str = str.toString().trim();
  if (str.includes('M')) return parseFloat(str) * 1_000_000;
  if (str.includes('K')) return parseFloat(str) * 1_000;
  return parseInt(str.replace(/,/g, '')) || 0;
};


const getLikeCount = async (page, link) => {
  try {
    console.log(`Sayfaya gidiliyor: ${link}`);
    await page.goto(link, { waitUntil: ['load', 'domcontentloaded'], timeout: 90000 });
    
   
    await sleep(2000); 

    console.log('Sayfa yüklendi, çerezler kontrol ediliyor...');
    
  
    try {
      const cookieSelector = 'button[data-e2e="cookie-banner-accept"]';
      const cookieButton = await page.$(cookieSelector);
      if (cookieButton) {
        console.log('Çerez düğmesi bulundu, tıklanıyor...');
        await cookieButton.click();
        await sleep(1000);
      }
    } catch (err) {
      console.log('Çerez kabul düğmesi bulunamadı, devam ediliyor');
    }
    
    console.log('Sayfa kaydırılıyor...');
    
    
    await page.evaluate(() => {
      window.scrollBy(0, 600);
    });
 
    await sleep(3000);  
    
    console.log('Like elementleri aranıyor...');
    
    
    const possibleSelectors = [
      'strong[data-e2e="like-count"]',
      'span[data-e2e="like-count"]',
      '.tt-video-meta-count strong',
      '.video-meta-count span',
      '[data-e2e="like-count"]',
      '.like-count'
    ];

    let likeText = null;
    
    
    for (const selector of possibleSelectors) {
      try {
        console.log(`Selektör deneniyor: ${selector}`);
        const element = await page.$(selector);
        if (element) {
          likeText = await page.evaluate(el => el.innerText.trim(), element);
          console.log(`Selektör başarılı: ${selector}, değer: ${likeText}`);
          break;
        }
        console.log(`Selektör bulunamadı: ${selector}`);
      } catch (err) {
        console.log(`Selektör hatası: ${selector}, ${err.message}`);
      }
    }
    
   
    if (!likeText) {
      console.log('Selektörler başarısız, sayfanın HTML içeriği analiz ediliyor...');
      
     
      const content = await page.content();
      
      const match = content.match(/(\d+(?:\.\d+)?[KMB]?) (beğenme|likes|like)/i);
      if (match && match[1]) {
        likeText = match[1];
        console.log(`HTML içeriğinden like bulundu: ${likeText}`);
      } else {
        console.log('Like sayısı bulunamadı');
        return null;
      }
    }

    const likes = normalizeLikes(likeText);
    console.log(`Beğeni sayısı: ${likes}`);
    return likes;
  } catch (err) {
    console.error(`Hata oluştu: ${err.message}`);
    return null;
  }
};


const run = async () => {
  try {
    
    const orders = []
    
    
    console.log('Refill dosyası oluşturuluyor...');
    const refillStream = await fs.open('like.txt', 'w');
    
    
    const browserOptions = {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=550,950'
      ]
    };
    
    console.log('Tarayıcı başlatılıyor...');
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();

    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 430, height: 900 });
    
    
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    console.log('İşlem başlıyor...');
    for (let index = 0; index < orders.length; index++) {
      const order = orders[index];

      const start_count = Number(order.start_count);
      const count = Number(order.count);
      const link = order.link;
      const id = order.id;

      if (isNaN(start_count) || isNaN(count)) {
        console.log(`🚫 Hatalı veri (Order ${index + 1}):`, order);
        continue;
      }

      const expected = start_count + count;

      console.log(`🔍 [${index + 1}] Kontrol ediliyor: ${link}`);
      const currentLikes = await getLikeCount(page, link);

      if (currentLikes === null) {
        console.log(`⛔️ Beğeni alınamadı (Order ${index + 1}): ${link}\n`);
        continue;
      }

      console.log(`👍 [${index + 1}] Mevcut beğeni: ${currentLikes} | Beklenen: ${expected}`);

      if (currentLikes < expected) {
        if (id) {
          await refillStream.write(`${id},\n`);
          console.log(`📥 [${index + 1}] Eksik beğeni tespit edildi. Refill yazıldı (id: ${id}).\n`);
        } else {
          console.log(`⚠️ [${index + 1}] Refill gerekli ama ID bulunamadı.\n`);
        }
      } else {
        console.log(`✅ [${index + 1}] Yeterli beğeni, refill gerekmez.\n`);
      }

      await sleep(randomDelay());
    }

    await refillStream.close();
    await browser.close();
    console.log('🎉 Tüm kontroller tamamlandı.');
  } catch (err) {
    console.error('Kritik hata:', err);
  }
};

run();
