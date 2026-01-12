import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/api/tiktok/partial", async (req, res) => {
  const { orderId, remains } = req.body;

  if (!orderId || !remains) {
    return res.status(400).json({ error: "orderId ve remains zorunlu" });
  }

  try {
    
    const response = await axios.post(
      `https://smmexclusive.com/adminapi/v2/orders/${orderId}/set-partial`,
      { remains }, // body
      {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": process.env.apikey, // .env'den API key
        },
      }
    );

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    console.error("Partial API Hatası:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
});

export default router;
