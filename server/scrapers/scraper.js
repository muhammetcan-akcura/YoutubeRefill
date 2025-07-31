import axios from 'axios'
import axiosRetry from 'axios-retry'
import * as cheerio from 'cheerio'

// Retry mekanizmasını ayarla
axiosRetry(axios, {
  retries: 3,
  retryDelay: retryCount => retryCount * 1000,
  retryCondition: (error) => {
    return error.code === 'ECONNRESET' || axiosRetry.isRetryableError(error);
  }
});

export async function scrapeServices({ domain, path, categoryClass }) {
  const url = `https://${domain}/${path}`;
  let response;

  try {
    response = await axios.get(url, {
      timeout: 10000, // 10 saniye
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
  } catch (err) {
    console.error(`Axios scrape error at ${url}:`, err.message);
    return []; // Hata varsa boş array döndür
  }

  const $ = cheerio.load(response.data);
  const services = [];

  $('table tr').each((_, row) => {
    const $row = $(row);

    if ($row.find(`.${categoryClass}`).length > 0) {
      return; // kategori satırları atla
    }

    const cols = $row.find('td');

    if (cols.length < 3) {
      return;
    }

    const service = {
      site: domain,
      id: $(cols[0]).text().trim(),
      name: $(cols[1]).text().trim(),
      price: $(cols[2]).text().trim(),
      min: $(cols[3]).text().trim() || '',
      max: $(cols[4]).text().trim() || ''
    };

    if (service.id && service.name) {
      services.push(service);
    }
  });

  return services;
}
