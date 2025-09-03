import express from 'express';
import axios from 'axios';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const profit = []

// ——— Ayarlar (opsiyonel env) ———
const LOG_DEBUG = process.env.LOG_DISABLED_DEBUG === '1' || true; // detaylı log açık
const MATCH_MODE = (process.env.DISABLED_MATCH_MODE || 'exact').toLowerCase(); // 'exact' | 'numeric'

// ——— Yardımcılar ———
const stripBOM = (s) => (s && s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s);

/** ID normalizasyonu:
 * - BOM ve görünmez boşluklar temizlenir
 * - baş/son boşluklar kırpılır
 * - iç boşluklar kaldırılır
 * - baştaki 0'lar atılır (numeric mode’da)
 */
const normalizeId = (val, mode = MATCH_MODE) => {
  if (val == null) return '';
  let s = String(val);
  s = stripBOM(s).trim().replace(/\s+/g, ''); // tüm boşlukları temizle
  // sadece rakam bırak (bazı kaynaklar ID yanında #/virgül/emoji vs getirebiliyor)
  s = s.replace(/[^\d]/g, '');
  if (!s) return '';
  if (mode === 'numeric') {
    // baştaki sıfırları at → "0005361" -> "5361"
    s = String(Number(s));
  }
  return s;
};

const findServiceById = (id) => {
  const nid = normalizeId(id, 'numeric');
  for (const category of profit) {
    for (const service of category.services) {
      if (normalizeId(service.id, 'numeric') === nid) return service;
    }
  }
  return null;
};

const readDisabledIds = async () => {
  try {
    const filePath =
      process.env.DISABLED_IDS_FILE ||
      path.join(process.cwd(), 'disabled_services.txt');

    const raw = await fs.readFile(filePath, 'utf8');
    const ids = raw
      .split(/\r?\n/)
      .map((s) => normalizeId(s))
      .filter(Boolean);

    const set = new Set(ids);
    if (LOG_DEBUG) {
      console.group('[disabled] readDisabledIds');
      console.log('file:', filePath);
      console.log('total:', set.size);
      const arr = Array.from(set);
      console.log('first5:', arr.slice(0, 5));
      console.log('last5:', arr.slice(-5));
      console.groupEnd();
    }
    return set;
  } catch (e) {
    if (LOG_DEBUG) {
      console.warn('[disabled] file read failed, returning empty set:', e.message);
    }
    return new Set();
  }
};

router.get('/custom-rates', async (req, res) => {
  const debugAllRates = [];       // tüm rate kayıtları (debug için)
  const debugDisabledMatches = []; // disabled eşleşenler (debug için)
  const perUserStats = {};        // kullanıcı bazlı istatistik

  try {
    // 1) Disabled ID’leri oku
    const disabledSet = await readDisabledIds();

    // 2) Kullanıcıları çek
    const response = await axios.get(`${process.env.PLATFORM1}/users`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.API_KEY_EXCLUSIVE,
      },
      params: {
        limit: 0,
        offset: 0,
        ids: process.env.RATES_IDS_SMMEXCLUSIVE,
      },
    });

    const users = response?.data?.data?.list || [];
    if (LOG_DEBUG) {
      console.log('[users] fetched:', users.length);
    }

    // ——— 1. RAPOR (Kâr < %10 olanlar) değişkenleri ———
    const allOutputData = [];
    const userGroupedData = {};

    // ——— 2. RAPOR (Disabled servisleri olan rate’ler) değişkenleri ———
    const allDisabledData = [];
    const userGroupedDisabled = {};

    for (const user of users) {
      const username = user?.username || '(unknown)';
      const customRates = user?.custom_rates || [];
      let userTotal = 0;
      let userDisabledCount = 0;

      if (LOG_DEBUG) {
        console.group(`[user] ${username}`);
        console.log('custom_rates length:', customRates.length);
      }

      for (const rate of customRates) {
        const rawId = rate.service_id;
        const serviceId = normalizeId(rawId); // normalize et
        const serviceName = rate.service_name;
        const percent = parseFloat(rate.percent);
        const customRate = parseFloat(rate.custom_rate);

        userTotal++;

        // Debug tüm rate kaydı
        debugAllRates.push({
          username,
          raw_service_id: String(rawId),
          norm_service_id: serviceId,
          service_name: serviceName,
          custom_rate: isNaN(customRate) ? null : Number(customRate.toFixed(4)),
          percent: isNaN(percent) ? null : Number(percent),
        });

        // ——— Disabled kontrolü (2. Excel + debug) ———
        let isDisabled = false;
        if (serviceId && disabledSet.has(serviceId)) {
          isDisabled = true;
        } else if (MATCH_MODE === 'numeric') {
          // numeric modda, eşleşmiyorsa yine de kontrol: Number karşılaştır
          const numId = Number(serviceId || '0');
          if (numId && disabledSet.has(String(numId))) {
            isDisabled = true;
          }
        }

        if (isDisabled) {
          userDisabledCount++;
          const disabledRecord = {
            username,
            service_id: serviceId,
            service_name: serviceName,
            custom_rate: isNaN(customRate) ? null : Number(customRate.toFixed(4)),
            percent: isNaN(percent) ? null : Number(percent),
            note: 'Service is DISABLED',
          };
          allDisabledData.push(disabledRecord);
          if (!userGroupedDisabled[username]) userGroupedDisabled[username] = [];
          userGroupedDisabled[username].push(disabledRecord);

          debugDisabledMatches.push({
            username,
            service_id: serviceId,
            service_name: serviceName,
          });
        }

        // ——— 1. Excel (kâr analizi) ———
        const service = findServiceById(serviceId);
        if (!service) continue;

        const providerRate = parseFloat(service.provider_rate);
        const price = parseFloat(service.price);

        // satış fiyatı hesabı
        let salePrice;
        if (percent === 0) {
          salePrice = customRate;
        } else {
          // percent == 1 gibi durumlarda: price/100 * customRate
          salePrice = (price / 100) * customRate;
        }

        let profitPercent = null;
        if (!isNaN(providerRate) && providerRate > 0 && !isNaN(salePrice)) {
          profitPercent = ((salePrice - providerRate) / providerRate) * 100;
        }

        const record = {
          username,
          service_id: serviceId,
          service_name: serviceName,
          sale_price: isNaN(salePrice) ? null : Number(salePrice.toFixed(4)),
          cost_price: isNaN(providerRate) ? null : Number(providerRate.toFixed(4)),
          profit_percent: profitPercent !== null ? Number(profitPercent.toFixed(2)) : null,
        };

        // %10 ve üzeri kâr olanları hiç ekleme
        if (record.profit_percent !== null && record.profit_percent >= 10) continue;

        allOutputData.push(record);
        if (!userGroupedData[username]) userGroupedData[username] = [];
        userGroupedData[username].push(record);
      }

      perUserStats[username] = {
        total_custom_rates: userTotal,
        disabled_matches: userDisabledCount,
      };

      if (LOG_DEBUG) {
        console.log('disabled matches:', userDisabledCount, '/', userTotal);
        console.groupEnd();
      }
    }

    if (LOG_DEBUG) {
      console.group('[summary]');
      console.table(perUserStats);
      console.log('total disabled matches (all users):', allDisabledData.length);
      console.log('total profit rows:', allOutputData.length);
      console.groupEnd();
    }

    // ——— 1. EXCEL: custom_rates_profit_report.xlsx ———
    const workbook = new ExcelJS.Workbook();
    const columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Service ID', key: 'service_id', width: 15 },
      { header: 'Service Name', key: 'service_name', width: 40 },
      { header: 'Sale Price', key: 'sale_price', width: 15 },
      { header: 'Cost Price', key: 'cost_price', width: 15 },
      { header: 'Profit %', key: 'profit_percent', width: 12 },
    ];

    const createSheet = (sheetName, data) => {
      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = columns;

      const valid = data.filter((d) => d.cost_price !== null);
      const invalid = data.filter((d) => d.cost_price === null);

      // Kar marjına göre sırala
      valid.sort((a, b) => (a.profit_percent ?? 0) - (b.profit_percent ?? 0));

      // ✅ Geçerli kayıtları renklendirerek ekle
      for (const record of valid) {
        const row = sheet.addRow(record);
        const percent = record.profit_percent;

        if (percent === 0) {
          // 🟧 Turuncu
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFA500' },
            };
          });
        } else if (percent < 0) {
          // 🔴 Kırmızı
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF0000' },
            };
          });
        }
        // 0 < percent < 10 → beyaz (stil yok)
      }

      // ⚠️ Eksik provider_rate olanları ekle (sarı)
      for (const record of invalid) {
        const row = sheet.addRow(record);
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF00' },
          };
        });
      }
    };

    // All + kullanıcı sayfaları
    createSheet('All', allOutputData);
    for (const [username, data] of Object.entries(userGroupedData)) {
      const cleanName = username.substring(0, 31).replace(/[\[\]:*?/\\]/g, '');
      createSheet(cleanName, data);
    }

    const profitOutputPath = path.join(process.cwd(), 'custom_rates_profit_report.xlsx');
    await workbook.xlsx.writeFile(profitOutputPath);

    // ——— 2. EXCEL: disabled_custom_rates.xlsx ———
    const workbookDisabled = new ExcelJS.Workbook();
    const disabledColumns = [
      { header: 'Username', key: 'username', width: 22 },
      { header: 'Service ID (norm)', key: 'service_id', width: 18 },
      { header: 'Service Name', key: 'service_name', width: 48 },
      { header: 'Custom Rate', key: 'custom_rate', width: 15 },
      { header: 'Percent Mode', key: 'percent', width: 14 },
      { header: 'Note', key: 'note', width: 20 },
    ];

    const createDisabledSheet = (sheetName, data) => {
      const sheet = workbookDisabled.addWorksheet(sheetName);
      sheet.columns = disabledColumns;

      // Servis ID’ye göre sıralayalım
      const sorted = [...data].sort((a, b) => Number(a.service_id) - Number(b.service_id));
      for (const record of sorted) {
        const row = sheet.addRow(record);
        // Disabled satırlarını açıkça işaretle (gri arka plan)
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'DDDDDD' },
          };
        });
      }

      // Boşsa yine de başlıkları içeren sheet oluşur (kontrol kolay)
      if (sorted.length === 0) {
        sheet.addRow({});
      }
    };

    createDisabledSheet('All', allDisabledData);
    for (const [username, data] of Object.entries(userGroupedDisabled)) {
      const cleanName = username.substring(0, 31).replace(/[\[\]:*?/\\]/g, '');
      createDisabledSheet(cleanName, data);
    }

    // ——— Stats sayfası ———
    const statsSheet = workbookDisabled.addWorksheet('Stats');
    statsSheet.columns = [
      { header: 'Username', key: 'username', width: 22 },
      { header: 'Total Custom Rates', key: 'total_custom_rates', width: 20 },
      { header: 'Disabled Matches', key: 'disabled_matches', width: 20 },
    ];
    for (const [u, st] of Object.entries(perUserStats)) {
      statsSheet.addRow({ username: u, ...st });
    }

    const disabledOutputPath = path.join(process.cwd(), 'disabled_custom_rates.xlsx');
    await workbookDisabled.xlsx.writeFile(disabledOutputPath);

    // ——— DEBUG dosyaları (/tmp) ———
    try {
      await fs.writeFile('/tmp/debug_custom_rates_scan.json', JSON.stringify({
        match_mode: MATCH_MODE,
        perUserStats,
        disabled_count: allDisabledData.length,
        sample_disabled_first10: allDisabledData.slice(0, 10),
      }, null, 2), 'utf8');

      // tüm rate’ler CSV
      const csvAll = [
        'username,raw_service_id,norm_service_id,percent,custom_rate',
        ...debugAllRates.map(r =>
          [
            JSON.stringify(r.username),
            JSON.stringify(String(r.raw_service_id || '')),
            JSON.stringify(String(r.norm_service_id || '')),
            r.percent ?? '',
            r.custom_rate ?? '',
          ].join(',')
        ),
      ].join('\n');
      await fs.writeFile('/tmp/debug_all_rates.csv', csvAll, 'utf8');

      // disabled eşleşmeler CSV
      const csvDis = [
        'username,service_id,service_name',
        ...debugDisabledMatches.map(r =>
          [JSON.stringify(r.username), JSON.stringify(r.service_id), JSON.stringify(r.service_name)].join(',')
        ),
      ].join('\n');
      await fs.writeFile('/tmp/debug_disabled_matches.csv', csvDis, 'utf8');

      if (LOG_DEBUG) {
        console.log('[debug] wrote /tmp/debug_custom_rates_scan.json');
        console.log('[debug] wrote /tmp/debug_all_rates.csv');
        console.log('[debug] wrote /tmp/debug_disabled_matches.csv');
      }
    } catch (e) {
      console.warn('[debug] write failed:', e.message);
    }

    // ——— Response ———
    res.status(200).json({
      message: 'Raporlar hazır.',
      files: [
        '/custom_rates_profit_report.xlsx',
        '/disabled_custom_rates.xlsx',
      ],
      debug: [
        '/tmp/debug_custom_rates_scan.json',
        '/tmp/debug_all_rates.csv',
        '/tmp/debug_disabled_matches.csv',
      ],
      notes: {
        disabled_ids_source:
          process.env.DISABLED_IDS_FILE || 'disabled_services.txt (project root)',
        match_mode: MATCH_MODE,
        tip: 'IDs are normalized; set DISABLED_MATCH_MODE=numeric for numeric-only comparison.',
      },
    });
  } catch (err) {
    console.error('Hata:', err?.message || err);
    res.status(500).json({ message: 'Veri alınamadı veya işlenemedi.' });
  }
});

export default router;
