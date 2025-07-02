import puppeteer from 'puppeteer';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

//   const INSTAGRAM_USERNAME = "+447561380105"
//   const INSTAGRAM_PASSWORD = "Passed987654"
const INSTAGRAM_USERNAME = "+905521613412"
const INSTAGRAM_PASSWORD = "bmwaudi96"
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13.4; rv:124.0) Gecko/20100101 Firefox/124.0';

const orders = []

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

async function checkAccountStatus(page, username) {
  try {
    const profileUrl = `https://www.instagram.com/${username}/`;
    
    await randomDelay(300, 700);
    
    // Sayfa navigasyonunu ve beklemeyi birleştirelim
    const response = await page.goto(profileUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 20000
    });
    
    // 404 durumunu kontrol et
    if (response.status() === 404) {
      return { exists: false, isPrivate: false, followers: null };
    }
    
    await randomDelay(500, 1000);
    
    // Hesap gizli mi kontrol et
    const isPrivate = await page.evaluate(() => {
      // Gizli hesap mesajlarını kontrol et
      const privateMessages = [
        'This Account is Private',
        'Bu Hesap Gizli',
        'This account is private',
        'Bu hesap gizli'
      ];
      
      const bodyText = document.body.innerText;
      return privateMessages.some(msg => bodyText.includes(msg));
    });
    
    if (isPrivate) {
      return { exists: true, isPrivate: true, followers: null };
    }
    
    // Takipçi sayısını al
    const followers = await getFollowersFromPage(page);
    
    return { exists: true, isPrivate: false, followers };
    
  } catch (e) {
    console.error(`Hesap durumu kontrol edilemedi: ${e.message}`);
    return { exists: false, isPrivate: false, followers: null };
  }
}

async function getFollowersFromPage(page) {
  try {
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
    
    return followers;
  } catch (e) {
    console.error(`Takipçi sayısı alınamadı: ${e.message}`);
    return null;
  }
}

async function getFollowersCount(page, username) {
  try {
    // Son kontrolden bu yana 5 dakikadan az bir süre geçtiyse, önbellekten al
    const cacheEntry = pageCache.get(username);
    const now = Date.now();
    if (cacheEntry && (now - cacheEntry.timestamp) < 300000) { // 5 dakika
      console.log(`[Önbellek] ${username} için önbellekten sonuçları kullanıyoruz.`);
      return cacheEntry;
    }
    
    const accountStatus = await checkAccountStatus(page, username);
    
    // Önbelleğe kaydet
    pageCache.set(username, {
      ...accountStatus,
      timestamp: now
    });
    
    return accountStatus;
  } catch (e) {
    console.error(`Hesap bilgileri alınamadı: ${e.message}`);
    return { exists: false, isPrivate: false, followers: null };
  }
}

function isWrongLink(input) {
  // Eğer input boşsa hatalı sayılır
  if (!input) return true;

  // Başındaki ve sonundaki boşlukları temizle
  const link = input.trim();

  // @ ile başlıyorsa hatalı
  if (link.startsWith('@')) {
    return true;
  }

  // Diğer sosyal medya platformlarını kontrol et
  const otherPlatforms = [
    'tiktok.com',
    'twitter.com',
    'x.com',
    'facebook.com',
    'youtube.com',
    'linkedin.com',
    'snapchat.com',
    'pinterest.com',
    'telegram.org',
    'telegram.me',
    't.me',
    'discord.com',
    'whatsapp.com',
    'reddit.com',
    'twitch.tv',
    'vk.com',
    'ok.ru',
    'weibo.com',
    'douyin.com',
    'kuaishou.com'
  ];

  // Link herhangi bir başka platformu içeriyorsa hatalı
  const lowerLink = link.toLowerCase();
  for (const platform of otherPlatforms) {
    if (lowerLink.includes(platform)) {
      return true;
    }
  }

  return false;
}

function extractUsernameFromLink(input) {
  // Eğer input boşsa null döndür
  if (!input) return null;

  // Başındaki ve sonundaki boşlukları temizle
  const link = input.trim();

  // Hatalı link kontrolü yap
  if (isWrongLink(link)) {
    return null;
  }

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
  return currentFollowers < expectedTotal * 0.75;
}

function saveToFile(filename, orderId) {
  try {
    fs.appendFileSync(filename, `${orderId}\n`);
  } catch (error) {
    console.error(`${filename} dosyasına yazma hatası:`, error.message);
  }
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
      // Önce hatalı link kontrolü yapalım
      if (isWrongLink(order.link)) {
        saveToFile('wronglink.txt', order.id);
        console.log(`[${order.id}] ❌ Hatalı link (Instagram harici platform veya @ ile başlıyor) -> wronglink.txt`);
        continue;
      }

      const username = extractUsernameFromLink(order.link);
      if (!username) {
        console.log(`[${order.id}] Bağlantıdan kullanıcı adı çıkarılamadı: ${order.link}`);
        continue;
      }
      
      console.log(`[${order.id}] İşleniyor: ${username}`);
      
      // Siparişleri işlerken çok kısa gecikme ekleyelim
      await randomDelay(200, 500);
      
      const accountStatus = await getFollowersCount(page, username);
      
      // Hesap bulunamadı kontrolü
      if (!accountStatus.exists) {
        saveToFile('accountnotfound.txt', order.id);
        console.log(`[${order.id}] ❌ Hesap bulunamadı -> accountnotfound.txt`);
        continue;
      }
      
      // Gizli hesap kontrolü
      if (accountStatus.isPrivate) {
        saveToFile('private.txt', order.id);
        console.log(`[${order.id}] 🔒 Hesap gizli -> private.txt`);
        continue;
      }
      
      // Takipçi sayısı alınamadıysa
      if (accountStatus.followers === null) {
        console.log(`[${order.id}] ${username} için takipçi sayısı alınamadı`);
        continue;
      }
      
      const currentFollowers = accountStatus.followers;
      const startCount = parseInt(order.start_count || '0');
      const orderCount = parseInt(order.count || '0');
      const expected = startCount + orderCount;
      
      console.log(`[${order.id}] Mevcut: ${currentFollowers}, Başlangıç: ${startCount}, Beklenen: ${expected}`);
      
      // Start count altında olan takipçi sayısı kontrolü
      if (currentFollowers < startCount) {
        saveToFile('bellowstartcount.txt', order.id);
        console.log(`[${order.id}] 📉 Takipçi sayısı başlangıç değerinin altında -> bellowstartcount.txt`);
        continue;
      }
      
      // Yeniden doldurma gerekli mi kontrol edelim
      if (isRefillNeeded(currentFollowers, expected)) {
        saveToFile('refill.txt', order.id);
        console.log(`[${order.id}] 🔁 Yeniden doldurma gerekli -> refill.txt`);
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
    console.log('Dosya çıktıları:');
    console.log('- refill.txt: Yeniden doldurma gerekli siparişler');
    console.log('- private.txt: Gizli hesaplar');
    console.log('- bellowstartcount.txt: Başlangıç değerinin altındaki takipçi sayıları');
    console.log('- accountnotfound.txt: Bulunamayan hesaplar');
    console.log('- wronglink.txt: Hatalı linkler (Instagram harici platformlar ve @ ile başlayanlar)');
    
    await processOrders(orders);
    console.log('İşlem başarıyla tamamlandı!');
  } catch (error) {
    console.error('İşlem sırasında kritik bir hata oluştu:', error);
    fs.appendFileSync('error_log.txt', `${new Date().toISOString()} - ${error.message}\n${error.stack}\n\n`);
  }
})();