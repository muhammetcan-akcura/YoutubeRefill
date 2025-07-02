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
    
    const orders = [
    {
        "id": "76446133",
        "user": "youtubee",
        "user_id": 39980,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://vt.tiktok.com/ZSksrKc23/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fvt.tiktok.com%2FZSksrKc23%2F",
        "order_buttons": [],
        "start_count": 14,
        "count": "1000",
        "service_name": "◆ 4404 - Tiktok Likes | 1M | 10-20K/D - R30 | Instant Start | HQ + Cheap!",
        "service_description": "",
        "service_id": 4404,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-06-19 10:45:57",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "43366130",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "tiktokserver.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": true,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": true,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "76370701",
        "user": "youtubee",
        "user_id": 39980,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://vt.tiktok.com/ZSkpHFaUD/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fvt.tiktok.com%2FZSkpHFaUD%2F",
        "order_buttons": [],
        "start_count": 18,
        "count": "1000",
        "service_name": "◆ 4404 - Tiktok Likes | 1M | 10-20K/D - R30 | Instant Start | HQ + Cheap!",
        "service_description": "",
        "service_id": 4404,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-06-18 18:45:45",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "43310014",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "tiktokserver.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": true,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": true,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "76183218",
        "user": "youtubee",
        "user_id": 39980,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://vt.tiktok.com/ZSkVKUPPY/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fvt.tiktok.com%2FZSkVKUPPY%2F",
        "order_buttons": [],
        "start_count": 55,
        "count": "1020",
        "service_name": "◆ 4404 - Tiktok Likes | 1M | 10-20K/D - R30 | Instant Start | HQ + Cheap!",
        "service_description": "",
        "service_id": 4404,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-06-17 09:21:37",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "43166417",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "tiktokserver.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": true,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": true,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "75986696",
        "user": "youtubee",
        "user_id": 39980,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://vt.tiktok.com/ZSk4dw9EC/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fvt.tiktok.com%2FZSk4dw9EC%2F",
        "order_buttons": [],
        "start_count": 162,
        "count": "2000",
        "service_name": "◆ 4404 - Tiktok Likes | 1M | 10-20K/D - R30 | Instant Start | HQ + Cheap!",
        "service_description": "",
        "service_id": 4404,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-06-15 23:57:11",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "43007491",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "tiktokserver.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": true,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": true,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "75975035",
        "user": "youtubee",
        "user_id": 39980,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://vt.tiktok.com/ZSkCVgnjy/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fvt.tiktok.com%2FZSkCVgnjy%2F",
        "order_buttons": [],
        "start_count": 24,
        "count": "7000",
        "service_name": "◆ 4404 - Tiktok Likes | 1M | 10-20K/D - R30 | Instant Start | HQ + Cheap!",
        "service_description": "",
        "service_id": 4404,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-06-15 22:10:13",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "42998127",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "tiktokserver.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": true,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": true,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "75875307",
        "user": "youtubee",
        "user_id": 39980,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://vt.tiktok.com/ZSkCt3x1P/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fvt.tiktok.com%2FZSkCt3x1P%2F",
        "order_buttons": [],
        "start_count": 102,
        "count": "3500",
        "service_name": "◆ 4404 - Tiktok Likes | 1M | 10-20K/D - R30 | Instant Start | HQ + Cheap!",
        "service_description": "",
        "service_id": 4404,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-06-15 08:21:39",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "42921304",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "tiktokserver.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": true,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": true,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "73434790",
        "user": "youtubee",
        "user_id": 39980,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://vt.tiktok.com/ZSkYfTn3B/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fvt.tiktok.com%2FZSkYfTn3B%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "2500",
        "service_name": "◆ 4404 - Tiktok Likes | 1M | 10-20K/D - R30 | Instant Start | HQ + Cheap!",
        "service_description": "",
        "service_id": 4404,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-06-02 14:56:36",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "40955477",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "tiktokserver.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": true,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": true,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "73218602",
        "user": "youtubee",
        "user_id": 39980,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://vt.tiktok.com/ZSkNueVfG/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fvt.tiktok.com%2FZSkNueVfG%2F",
        "order_buttons": [],
        "start_count": 23,
        "count": "50000",
        "service_name": "◆ 4404 - Tiktok Likes | 1M | 10-20K/D - R30 | Instant Start | HQ + Cheap!",
        "service_description": "",
        "service_id": 4404,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-06-01 15:20:18",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "40776061",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "tiktokserver.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": true,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": true,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    }
]

    console.log('Refill dosyası oluşturuluyor...');
    const refillStream = await fs.open('like.txt', 'w');
     const refillStreamid = await fs.open('likeid.txt', 'w');
    
    
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
    const eksikMiktar = expected - currentLikes;
    await refillStream.write(`3 | ${link} | ${eksikMiktar}\n`);
    await refillStreamid.write(` ${id},\n`);
    console.log(`📥 [${index + 1}] Eksik beğeni tespit edildi. Refill yazıldı (id: ${id}, eksik: ${eksikMiktar}).\n`);
  } else {
    console.log(`⚠️ [${index + 1}] Refill gerekli ama ID bulunamadı.\n`);
  }
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
