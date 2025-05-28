import puppeteer from 'puppeteer';
  import fs from 'fs';
  import dotenv from 'dotenv';
  
  dotenv.config();
  
//   const INSTAGRAM_USERNAME = "+447561380105"
//   const INSTAGRAM_PASSWORD = "Passed987654"
  const INSTAGRAM_USERNAME = "+905521613412"
  const INSTAGRAM_PASSWORD = "bmwaudi96"
 const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13.4; rv:124.0) Gecko/20100101 Firefox/124.0';
  
  const orders = [
    {
        "id": "71948392",
        "user": "smartsmmpanel",
        "user_id": 40012,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/malikdelgaty7?igsh=MWNiY3U4Z3VkM2xybQ==",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmalikdelgaty7%3Figsh%3DMWNiY3U4Z3VkM2xybQ%3D%3D",
        "order_buttons": [],
        "start_count": 3,
        "count": "2000",
        "service_name": "⭐ 5232 ~ Instagram Followers [Max 1M]  [50-100K/D - No Refill ] [ Mix Quality Real Accounts ! ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 5232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-26 15:08:30",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "730068",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "smmrush.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": false,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": false,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "71945927",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/kuju__flowercafebar",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fkuju__flowercafebar",
        "order_buttons": [],
        "start_count": 0,
        "count": "5500",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-26 14:52:05",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "729974",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "smmrush.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": false,
            "set_remains": false,
            "update_remains": false,
            "refill": true,
            "disable_refill": true,
            "set_partial": true,
            "update_from_provider": false,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "70855297",
        "user": "startlab",
        "user_id": 40381,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "@orgulho_do_ceara_na_tela",
        "link_url": "https://smmexclusive.com/anon.ws?r=%40orgulho_do_ceara_na_tela",
        "order_buttons": [],
        "start_count": 0,
        "count": "1000",
        "service_name": "⭐ 4472 ~ Instagram [ High Quality ] - | 1M | - | Real Followers | 100-200K/D - R30 | Instant Start!",
        "service_description": "",
        "service_id": 4472,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-20 17:18:55",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "656528",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "smmrush.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": false,
            "set_remains": false,
            "update_remains": false,
            "refill": true,
            "disable_refill": true,
            "set_partial": true,
            "update_from_provider": false,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "70793102",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/honokamoriyama_official",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fhonokamoriyama_official",
        "order_buttons": [],
        "start_count": 761414,
        "count": "11000",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-20 07:11:05",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "650436",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "smmrush.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": false,
            "set_remains": false,
            "update_remains": false,
            "refill": true,
            "disable_refill": true,
            "set_partial": true,
            "update_from_provider": false,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "70402698",
        "user": "smmpak",
        "user_id": 40037,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/the_only_alpha_bennett_tristan?igsh=MWRkbDdtYXIzczJsbA%3D%3D&utm_source=qr",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fthe_only_alpha_bennett_tristan%3Figsh%3DMWRkbDdtYXIzczJsbA%253D%253D%26utm_source%3Dqr",
        "order_buttons": [],
        "start_count": 864087,
        "count": "13393",
        "service_name": "⭐ 4472 ~ Instagram [ High Quality ] - | 1M | - | Real Followers | 100-200K/D - R30 | Instant Start!",
        "service_description": "",
        "service_id": 4472,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-17 07:33:46",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "618686",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "smmrush.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": false,
            "set_remains": false,
            "update_remains": false,
            "refill": true,
            "disable_refill": true,
            "set_partial": true,
            "update_from_provider": false,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "69858020",
        "user": "wesleyws01",
        "user_id": 42750,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/fabianaoliveraoficial?igsh=ejE0YmF1bThtejBi",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Ffabianaoliveraoficial%3Figsh%3DejE0YmF1bThtejBi",
        "order_buttons": [],
        "start_count": 80624,
        "count": "4500",
        "service_name": "⭐ 4958 ~ Instagram Followers | 1M | 100-200K/D - R30 [High Quality+Old Accounts!] [High Speed!]🔥⚡ - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4958,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-12 06:23:29",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "562573",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "smmrush.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": false,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": false,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "69649285",
        "user": "wesleyws01",
        "user_id": 42750,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/senna_sports_ro?igsh=MTNlYno4aHUyMWc2Yw==",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fsenna_sports_ro%3Figsh%3DMTNlYno4aHUyMWc2Yw%3D%3D",
        "order_buttons": [],
        "start_count": 113168,
        "count": "7000",
        "service_name": "⭐ 4958 ~ Instagram Followers | 1M | 100-200K/D - R30 [High Quality+Old Accounts!] [High Speed!]🔥⚡ - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4958,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-10 00:06:00",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "541167",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "smmrush.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": false,
            "set_remains": false,
            "update_remains": false,
            "refill": true,
            "disable_refill": true,
            "set_partial": true,
            "update_from_provider": false,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "69267075",
        "user": "wesleyws01",
        "user_id": 42750,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/mare.de.saboress?igsh=MWlkZXYwaG1scWhhcg==",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmare.de.saboress%3Figsh%3DMWlkZXYwaG1scWhhcg%3D%3D",
        "order_buttons": [],
        "start_count": 54994,
        "count": "3000",
        "service_name": "⭐ 4958 ~ Instagram Followers | 1M | 100-200K/D - R30 [High Quality+Old Accounts!] [High Speed!]🔥⚡ - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4958,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-07 20:24:55",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "515411",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "smmrush.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": false,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": false,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    },
    {
        "id": "67380380",
        "user": "startlab",
        "user_id": 40381,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/familiarichards?igsh=MTg3Y3U0bWY4cGlkbw==",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Ffamiliarichards%3Figsh%3DMTg3Y3U0bWY4cGlkbw%3D%3D",
        "order_buttons": [],
        "start_count": 412556,
        "count": "15000",
        "service_name": "⭐ 4958 ~ Instagram Followers | 1M | 100-200K/D - R30 [High Quality+Old Accounts!] [High Speed!]🔥⚡ - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4958,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-04-28 02:01:04",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "434076",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "smmrush.com",
        "access": {
            "order_details": true,
            "superadmin_order_details": false,
            "resend_order": false,
            "edit": false,
            "set_start_count": false,
            "set_remains": false,
            "update_remains": false,
            "refill": false,
            "disable_refill": false,
            "set_partial": true,
            "update_from_provider": false,
            "change_status": [],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    }
]

function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

async function humanTypeText(page, selector, text) {
  await page.waitForSelector(selector, { timeout: 10000 });
  await page.type(selector, text, { delay: 10 });
}

async function loginToInstagram(page) {
  try {
    await randomDelay(500, 1000);
    
    await page.goto('https://www.instagram.com/accounts/login/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await randomDelay(500, 1000);
    try {
      const cookieButton = await page.$('button[tabindex="0"][type="button"]');
      if (cookieButton) {
        await cookieButton.click();
        await randomDelay(300, 500);
      }
    } catch (e) {
    }
    await humanTypeText(page, 'input[name="username"]', INSTAGRAM_USERNAME);
    await randomDelay(200, 300);
    await humanTypeText(page, 'input[name="password"]', INSTAGRAM_PASSWORD);
    await randomDelay(200, 300);
    
    // Giriş butonuna tıklayalım
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 })
    ]);
    
    // "Giriş Bilgilerini Kaydet" popup'ını kontrol edelim - daha hızlı
    try {
      const notNowButton = await page.$('button:nth-child(2)');
      if (notNowButton) {
        await notNowButton.click();
        await randomDelay(200, 300);
      }
    } catch (e) {
      // Hatayı görmezden gel
    }
    
    // "Bildirimleri Aç" popup'ını kontrol edelim - daha hızlı
    try {
      const notNowNotif = await page.$('button:nth-child(2)');
      if (notNowNotif) {
        await notNowNotif.click();
      }
    } catch (e) {
      // Hatayı görmezden gel
    }
    
    return true;
  } catch (e) {
    console.error('Giriş hatası:', e.message);
    return false;
  }
}

// Sayfa önbelleği - aynı profil sayfalarını tekrar tekrar yüklemek yerine önbellekte saklayalım
const pageCache = new Map();

async function getFollowersCount(page, username) {
  try {
    // Son kontrolden bu yana 5 dakikadan az bir süre geçtiyse, önbellekten al
    const cacheEntry = pageCache.get(username);
    const now = Date.now();
    if (cacheEntry && (now - cacheEntry.timestamp) < 300000) { // 5 dakika
      console.log(`[Önbellek] ${username} için önbellekten takipçi sayısını kullanıyoruz.`);
      return cacheEntry.followers;
    }
    
    const profileUrl = `https://www.instagram.com/${username}/`;
    
    // Sayfa navigasyonunu hızlandıralım
    await randomDelay(300, 700);
    
    // Sayfa navigasyonunu ve beklemeyi birleştirelim
    await page.goto(profileUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 20000
    });
    
    await randomDelay(500, 1000);
    
    // Daha optimize edilmiş seçiciler - sadece en yaygın olanları deneyelim
    const selectors = [
      'span.x5n08af.x1s688f[title]',
      'span[title]',
      'header section ul li:nth-child(2) span'
    ];
    
    let followers = null;
    
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        
        // Performans için JavaScript kısmını optimize edelim
        const elements = await page.$$(selector);
        
        for (const element of elements) {
          // Hızlı bir şekilde hem title özelliğini hem de iç metni kontrol edelim
          const count = await page.evaluate(el => {
            return el.getAttribute('title') || el.innerText;
          }, element);
          
          if (count) {
            // Metinden sayıyı ayrıştıralım
            let parsedCount;
            
            if (count.includes('K')) {
              parsedCount = parseFloat(count.replace('K', '')) * 1000;
            } else if (count.includes('M')) {
              parsedCount = parseFloat(count.replace('M', '')) * 1000000;
            } else {
              parsedCount = parseInt(count.replace(/[^\d]/g, ''), 10);
            }
            
            if (!isNaN(parsedCount)) {
              followers = parsedCount;
              break;
            }
          }
        }
        
        if (followers !== null) break;
      } catch (e) {
        continue;
      }
    }
    
    if (followers === null) {
      // Sadece gerçekten başarısız olduğumuzda ekran görüntüsü alalım

      throw new Error('Takipçi sayısı hiçbir seçiciyle bulunamadı');
    }
    
    // Önbelleğe kaydet
    pageCache.set(username, {
      followers,
      timestamp: now
    });
    
    return followers;
  } catch (e) {
    console.error(`Takipçi sayısı alınamadı: ${e.message}`);
    return null;
  }
}

function extractUsernameFromLink(input) {
  // Eğer input boşsa null döndür
  if (!input) return null;

  // Başındaki ve sonundaki boşlukları temizle
  const link = input.trim();

  // Eğer sadece kullanıcı adı verilmişse (http yoksa ve boşluk/özel karakter içermiyorsa)
  if (!link.includes('http') && !link.includes('instagram.com')) {
    // Kullanıcı adı geçerli karakterlerle sınırlı mı kontrolü (sadece harf, rakam, nokta, alt tire)
    if (/^[a-zA-Z0-9._]+$/.test(link)) {
      return link;
    }
    return null;
  }

  // URL formatındaysa regex ile ayıkla
  const match = link.match(/instagram\.com\/([^\/?#]+)/);
  return match ? match[1] : null;
}
function isRefillNeeded(currentFollowers, expectedTotal) {
  return currentFollowers < expectedTotal;
}

async function processOrders(orders) {
  console.time('TotalExecutionTime');
  
  // Tarayıcıyı paralel işleme için yapılandıralım
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Bellek kullanımını iyileştirir
      '--disable-accelerated-2d-canvas', // GPU kullanımını azaltır
      '--disable-gpu', // GPU kullanmadan çalışır
      '--window-position=0,0'
    ],
    ignoreHTTPSErrors: true
  });
  
  // Ana sayfayı oluştur ve giriş yap
  const page = await browser.newPage();
  
  // Görüntü alanını ayarlayalım
  await page.setViewport({
    width: 1366,
    height: 768
  });
  
  // User agent'ı ayarlayalım
  await page.setUserAgent(DEFAULT_USER_AGENT);
  
  // Ek HTTP başlıklarını ayarlayalım
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br'
  });
  
  // WebDriver tespitini atlamak için - hızlı olması için minimum gerekli değişiklikler
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  
  // Instagram'a giriş yapalım
  const isLoggedIn = await loginToInstagram(page);
  
  if (!isLoggedIn) {
    console.error('Giriş başarısız. Çıkılıyor...');
    await browser.close();
    return;
  }
  
  console.log('Instagram\'a başarıyla giriş yapıldı!');
  await randomDelay(500, 1000);
  
  // Performans için başlangıç zamanını kaydedelim
  const startTime = Date.now();
  let processedCount = 0;
  
  // Her siparişi işleyelim - daha hızlı işleme için optimize edildi
  for (const order of orders) {
    try {
      const username = extractUsernameFromLink(order.link);
      if (!username) {
        console.log(`[${order.id}] Bağlantıdan kullanıcı adı çıkarılamadı: ${order.link}`);
        continue;
      }
      
      console.log(`[${order.id}] İşleniyor: ${username}`);
      
      // Siparişleri işlerken çok kısa gecikme ekleyelim
      await randomDelay(200, 500);
      
      const expected = order.start_count + parseInt(order.count || '0');
      const followers = await getFollowersCount(page, username);
      
      if (followers === null) {
        console.log(`[${order.id}] ${username} için takipçi sayısı alınamadı`);
        continue;
      }
      
      console.log(`[${order.id}] Mevcut: ${followers}, Beklenen: ${expected}`);
      
      // Yeniden doldurma gerekli mi kontrol edelim
      if (isRefillNeeded(followers, expected)) {
        fs.appendFileSync('refill1.txt', `${order.id}\n`);
        console.log(`[${order.id}] 🔁 Yeniden doldurma gerekli -> refill1.txt`);
      } else {
        console.log(`[${order.id}] ✅ Yeniden doldurma gerekli değil`);
      }
      
      // İşlenen sipariş sayısını artıralım
      processedCount++;
      
      // Son kontrolü yapalım - dakikada kaç işlem yapıldığını hesaplayalım
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const ratePerMinute = processedCount / elapsedMinutes;
      
      console.log(`Hız: ${ratePerMinute.toFixed(2)} kontrol/dakika`);
      
      // Hız hala dakikada 5'ten azsa, gecikmeleri azalt
      if (ratePerMinute < 5 && processedCount > 2) {
        console.log('Hız hedefinin altında, performansı artırıyoruz...');
        // Hiç gecikme olmadan devam et
      } else {
        // Siparişler arasında minimal gecikme
        await randomDelay(300, 700);
      }
    } catch (error) {
      console.error(`[${order.id}] İşleme hatası:`, error.message);
      // Hata durumunda da devam et
      continue;
    }
  }
  
  console.log('Tüm siparişlerin işlenmesi tamamlandı. Tarayıcı kapatılıyor...');
  console.timeEnd('TotalExecutionTime');
  
  // Sonuç istatistiklerini gösterelim
  const totalTimeMinutes = (Date.now() - startTime) / 60000;
  console.log(`Toplam geçen süre: ${totalTimeMinutes.toFixed(2)} dakika`);
  console.log(`Toplam işlenen sipariş: ${processedCount}`);
  console.log(`Ortalama hız: ${(processedCount / totalTimeMinutes).toFixed(2)} kontrol/dakika`);
  
  await browser.close();
}

// İşlemi başlatalım
(async () => {
  try {
    // Başlangıç mesajı
    console.log('Instagram takipçi kontrol sistemi başlatılıyor...');
    console.log('Hedef: Dakikada en az 5 kontrol');
    
    await processOrders(orders);
    console.log('İşlem başarıyla tamamlandı!');
  } catch (error) {
    console.error('İşlem sırasında kritik bir hata oluştu:', error);
    fs.appendFileSync('error_log.txt', `${new Date().toISOString()} - ${error.message}\n${error.stack}\n\n`);
  }
})();