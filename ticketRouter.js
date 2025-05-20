import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/ticket', async (req, res) => {
  try {
    // 1. Tüm ticket'ları çek
    const allTickets = await axios.get(`${process.env.PLATFORM}/tickets`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.API_KEY
      },
      params: {
        user: "gues12",
        status: "pending"
      }
    });

    const ticketIds = allTickets.data?.data?.list.map(item => item.id) ?? [];

    // Sonuç dizileri
    const refill = [];
    const refund = [];
    const speed_up = [];
    const delayed_refund = [];
    const others = [];

    // 2. Tüm ID'ler üzerinden tek tek detay istekleri at
    const requests = ticketIds.map(async (ticketId) => {
      try {
        const response = await axios.get(`${process.env.PLATFORM}/tickets/${ticketId}`, {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.API_KEY
          }
        });

        const messages = response.data?.data?.messages ?? [];

        // Son support mesajının index'ini bul
        let lastSupportIndex = -1;
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].sender_name === 'support') {
            lastSupportIndex = i;
            break;
          }
        }

        const filteredMessages = lastSupportIndex >= 0
          ? messages.slice(lastSupportIndex + 1)
          : messages;

        filteredMessages.forEach(msg => {
          const content = msg.message;

          if (content.startsWith("Urgent Refill:")) {
            const ids = content.replace("Urgent Refill:", "").match(/\d+/g)?.map(Number) ?? [];
            refill.push(...ids);
          } else if (content.startsWith("Urgent Refund (Partial/Cancel):")) {
            const ids = content.replace("Urgent Refund (Partial/Cancel):", "").match(/\d+/g)?.map(Number) ?? [];
            refund.push(...ids);
          } else if (content.startsWith("Urgent Speed up:")) {
            const ids = content.replace("Urgent Speed up:", "").match(/\d+/g)?.map(Number) ?? [];
            speed_up.push(...ids);
          } else if (content.includes("is not refunded")) {
            const ids = content.match(/\d{6,}/g)?.map(Number) ?? [];
            delayed_refund.push(...ids);
          } else {
            others.push(content);
          }
        });
      } catch (err) {
        console.warn(`Ticket ${ticketId} alınamadı:`, err?.response?.data || err.message);
        // Devam edebilmek için hata bastırılıyor
      }
    });

    // Tüm ticket detay isteklerini paralel çalıştır
    await Promise.all(requests);

    // 3. Sonuçları dön
    res.json({
      refill,
      refund,
      speed_up,
      delayed_refund,
      others // 👈 yeni dizi burada
    });

  } catch (error) {
    console.error('Ticket listesi alınırken hata:', error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data || error.message });
  }
});

export default router;
