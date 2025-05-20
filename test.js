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
        "id": "70172460",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/mio_1011.ter/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmio_1011.ter%2F",
        "order_buttons": [],
        "start_count": 1,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:36:03",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596723",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172459",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/hazuki_0910.ter/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fhazuki_0910.ter%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:36:03",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596722",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172458",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/kokoro_0306.ter/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fkokoro_0306.ter%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:36:03",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596721",
        "ip": "159.65.114.232",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172457",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/hikari_0806.ter/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fhikari_0806.ter%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:36:03",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596720",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172419",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/minori_0421.ter/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fminori_0421.ter%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:35:05",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596718",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172418",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/rena_0824.ter/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Frena_0824.ter%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:35:05",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596717",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172414",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/madoka_0804.ter/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmadoka_0804.ter%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:35:04",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596714",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172412",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/kotone_0717.ter/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fkotone_0717.ter%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:35:04",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596713",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172320",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/tjs.ronald.5ei26z/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Ftjs.ronald.5ei26z%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:33:08",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596702",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172319",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/otf.elizabeth.16005x/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fotf.elizabeth.16005x%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:33:07",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596700",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172267",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/yrq.uqvolkov.u7598t/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fyrq.uqvolkov.u7598t%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:32:08",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596693",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172266",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/ms.paul_626128/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fms.paul_626128%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:32:07",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596692",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172249",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/mesteven_52612/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmesteven_52612%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:31:43",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596690",
        "ip": "159.65.114.232",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172246",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/msmichael_7408/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmsmichael_7408%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:31:42",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596689",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172240",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/mssandra.m38985/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmssandra.m38985%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:31:42",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596688",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172236",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/pcx.nancy.g97x9j/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fpcx.nancy.g97x9j%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:31:41",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596684",
        "ip": "159.65.114.232",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172232",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/msjeff_hernandez3275373/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmsjeff_hernandez3275373%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:31:39",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596679",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172231",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/memaria.079350/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmemaria.079350%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:31:39",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596680",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172099",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/xdk.mbkonovalov.d55ntk/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fxdk.mbkonovalov.d55ntk%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:29:08",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596672",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172088",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/mecarol.young23921/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmecarol.young23921%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:29:06",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596665",
        "ip": "159.65.114.232",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70172037",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/auh.tggusev.6766js/",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fauh.tggusev.6766js%2F",
        "order_buttons": [],
        "start_count": 0,
        "count": "380",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-15 04:28:04",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "596657",
        "ip": "159.65.114.232",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70121082",
        "user": "instaclick",
        "user_id": 41380,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/portalmaratonageek_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fportalmaratonageek_%3Futm_source%3Dig_web_button_share_sheet%26igsh%3DZDNlZDc0MzIxNw%253D%253D",
        "order_buttons": [],
        "start_count": 1013,
        "count": "1000",
        "service_name": "⭐ 4958 ~ Instagram Followers | 1M | 100-200K/D - R30 [High Quality+Old Accounts!] [High Speed!]🔥⚡ - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4958,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-14 17:33:03",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "590116",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "70064788",
        "user": "instaclick",
        "user_id": 41380,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/onewaybluegrass?igsh=djFreGRlcjNhbTIx&amp;utm_source=qr",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fonewaybluegrass%3Figsh%3DdjFreGRlcjNhbTIx%26amp%3Butm_source%3Dqr",
        "order_buttons": [],
        "start_count": 392,
        "count": "3000",
        "service_name": "⭐ 4958 ~ Instagram Followers | 1M | 100-200K/D - R30 [High Quality+Old Accounts!] [High Speed!]🔥⚡ - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4958,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-14 03:56:23",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "584305",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983946",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/miyu.memo.wave",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmiyu.memo.wave",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:37:07",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576550",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983877",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/sharon40777.6583",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fsharon40777.6583",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:36:08",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576546",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983876",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/asuka_mainplus_snss",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fasuka_mainplus_snss",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:36:08",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576545",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983875",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/chiharu_workfreedom_guide",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fchiharu_workfreedom_guide",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:36:07",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576544",
        "ip": "159.65.114.232",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983816",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/rena_sns_fromzero",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Frena_sns_fromzero",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:35:11",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576536",
        "ip": "159.65.114.232",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983814",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/yuzuki_dream_path",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fyuzuki_dream_path",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:35:11",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576535",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983810",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/sakura_restart_work",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fsakura_restart_work",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:35:09",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576534",
        "ip": "159.65.114.232",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983688",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/kanon_dreamworkjourney",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fkanon_dreamworkjourney",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:34:09",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576532",
        "ip": "159.65.114.232",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983676",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/ayano_snspro_zero",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fayano_snspro_zero",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:34:08",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576531",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983571",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/moe_skillup_promarketer",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fmoe_skillup_promarketer",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:33:05",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576806",
        "ip": "207.180.200.92",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69983472",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/chinatsu_snsmaster",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fchinatsu_snsmaster",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-13 11:31:43",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "576514",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69909686",
        "user": "paymentsofme",
        "user_id": 40109,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/ri_no_0728",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fri_no_0728",
        "order_buttons": [],
        "start_count": 0,
        "count": "340",
        "service_name": "⭐ 4232 ~ Instagram Followers | 1M | 50-100/Day - AR30 [ High Quality ] [ 0-1 Hours Start ] - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4232,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-12 18:17:07",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "568612",
        "ip": "64.226.68.147",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69449752",
        "user": "instaclick",
        "user_id": 41380,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/lua_duarte7?igsh=MTU2ZWM2NnJvMmQ0Ng%3D%3D&amp;utm_source=qr",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Flua_duarte7%3Figsh%3DMTU2ZWM2NnJvMmQ0Ng%253D%253D%26amp%3Butm_source%3Dqr",
        "order_buttons": [],
        "start_count": 15735,
        "count": "500",
        "service_name": "⭐ 4958 ~ Instagram Followers | 1M | 100-200K/D - R30 [High Quality+Old Accounts!] [High Speed!]🔥⚡ - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4958,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-08 21:11:16",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "528759",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "69033772",
        "user": "smmpak",
        "user_id": 40037,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/walid_rahmani99?igsh=MWwxaTV5N3hkanlucg==&utm_source=qr",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fwalid_rahmani99%3Figsh%3DMWwxaTV5N3hkanlucg%3D%3D%26utm_source%3Dqr",
        "order_buttons": [],
        "start_count": 27,
        "count": "750",
        "service_name": "⭐ 4472 ~ Instagram [ High Quality ] - | 1M | - | Real Followers | 100-200K/D - R30 | Instant Start!",
        "service_description": "",
        "service_id": 4472,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-05-06 14:45:33",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "501346",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    },
    {
        "id": "66601623",
        "user": "amanjain",
        "user_id": 40072,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/bankroll.vee_?igsh=MXU4enp6b3NhN2t2Zw==",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fbankroll.vee_%3Figsh%3DMXU4enp6b3NhN2t2Zw%3D%3D",
        "order_buttons": [],
        "start_count": 956,
        "count": "1000",
        "service_name": "⭐ 4958 ~ Instagram Followers | 1M | 100-200K/D - R30 [High Quality+Old Accounts!] [High Speed!]🔥⚡ - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4958,
        "status": 4,
        "status_name": "Canceled",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-04-24 00:46:46",
        "error_reason_start_count": null,
        "mode": 0,
        "mode_name": "Manual",
        "external_id": "402621",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
        "provider": "",
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
            "set_partial": false,
            "update_from_provider": false,
            "change_status": [],
            "cancel_and_refund": false,
            "cancel_reason": true,
            "cancel": false
        }
    },
    {
        "id": "63730455",
        "user": "smmpak",
        "user_id": 40037,
        "type": 1,
        "type_name": "API",
        "charge": "",
        "charge_formatted": "",
        "profits": null,
        "link": "https://www.instagram.com/ahmad._.jutt021?igsh=d2p1Z215eTIxYWw1",
        "link_url": "https://smmexclusive.com/anon.ws?r=https%3A%2F%2Fwww.instagram.com%2Fahmad._.jutt021%3Figsh%3Dd2p1Z215eTIxYWw1",
        "order_buttons": [],
        "start_count": 9,
        "count": "500",
        "service_name": "⭐ 4072 ~ Instagram Followers | 500K | 100-200/D - R30 [Old Accounts + High Quality] [0-1H Start]  - NO FLAG RULE!!!",
        "service_description": "",
        "service_id": 4072,
        "status": 2,
        "status_name": "Completed",
        "remains": "0",
        "is_autocomplete": false,
        "is_active_autocomplete": false,
        "created": "2025-03-24 10:24:32",
        "error_reason_start_count": null,
        "mode": 1,
        "mode_name": "Auto",
        "external_id": "291850",
        "ip": "127.0.0.1",
        "order_cancel_reason": null,
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
            "cancel": false
        }
    }
]

// Daha kısa rastgele gecikme fonksiyonu
function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Hızlandırılmış insan gibi yazma fonksiyonu
async function humanTypeText(page, selector, text) {
  await page.waitForSelector(selector, { timeout: 10000 });
  // Karakter karakter yazma yerine doğrudan ekleyelim ama hala gerçekçi görünsün
  await page.type(selector, text, { delay: 10 });
}

async function loginToInstagram(page) {
  try {
    // Hızlandırılmış giriş süreci
    await randomDelay(500, 1000);
    
    await page.goto('https://www.instagram.com/accounts/login/', { 
      waitUntil: 'domcontentloaded', // networkidle2 yerine daha hızlı
      timeout: 30000
    });
    
    await randomDelay(500, 1000);
    
    // Çerez uyarısını kontrol edelim ve gerekirse işleyelim
    try {
      const cookieButton = await page.$('button[tabindex="0"][type="button"]');
      if (cookieButton) {
        await cookieButton.click();
        await randomDelay(300, 500);
      }
    } catch (e) {
      // Hatayı görmezden gel ve devam et
    }
    
    // Kullanıcı adı ve şifreyi yazalım
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
  return currentFollowers < expectedTotal * 0.95;
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
        fs.appendFileSync('refill.txt', `${order.id}\n`);
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
    
    await processOrders(orders);
    console.log('İşlem başarıyla tamamlandı!');
  } catch (error) {
    console.error('İşlem sırasında kritik bir hata oluştu:', error);
    fs.appendFileSync('error_log.txt', `${new Date().toISOString()} - ${error.message}\n${error.stack}\n\n`);
  }
})();