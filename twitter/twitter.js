import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('../.env') });

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN

const orders = [
  
    {
        "id": "72146296",
        "user": "kutumicini",
        "user_id": 40188,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://x.com/TheCryptoExpres/status/1927331490628522299",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fx.com%2FTheCryptoExpres%2Fstatus%2F1927331490628522299",
        "order_buttons": [],
        "start_count": null,
        "count": "7",
        "service_name": "💠 3514 ~ Twitter Retweet | Max 5K | 1K/D - No Refill | 0-1H Start",
        "service_description": "",
        "service_id": 3514,
        "status": 0,
        "status_name": "Pending",
        "remains": "7",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-27 14:55:20",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "2966079",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "order_fail_reason": 0,
        "provider": "nuer215twitter.com",
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
            "update_from_provider": false,
            "change_status": [
                "inprogress",
                "processing",
                "completed"
            ],
            "cancel_and_refund": true,
            "cancel_reason": false,
            "cancel": false,
            "see_provider": true
        }
    }

];

async function getFollowersCount(username) {
    try {
        const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics`, {
            headers: {
                Authorization: `Bearer ${BEARER_TOKEN}`
            }
        });

        const followers = response.data.data.public_metrics.followers_count;
        return followers;
    } catch (error) {
        if (error.response) {
            console.error(`❌ ${username} için hata: ${error.response.status} - ${error.response.statusText}`);
        } else {
            console.error(`❌ ${username} için istek hatası:`, error.message);
        }
        return null;
    }
}

async function processOrders(orders) {
    for (const order of orders) {
        try {
            const url = new URL(order.link);
            const username = url.pathname.split('/')[1];
            console.log(`🔍 ${username} için takipçi sayısı çekiliyor...`);

            const followers = await getFollowersCount(username);

            if (followers !== null) {
                console.log(`👑 ${username}: ${followers} takipçi`);
            } else {
                console.log(`⚠️ ${username}: takipçi sayısı alınamadı.`);
            }
        } catch (err) {
            console.error(`❌ Link işlenemedi: ${order.link}`, err.message);
        }
    }
}

processOrders(orders);
