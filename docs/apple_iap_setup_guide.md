# Apple In-App Purchase & RevenueCat Backend Integration Guide

This guide documents the backend integration for Apple In-App Purchases (StoreKit 2 via RevenueCat) in **Interactive_learning (Next.js & Supabase)**.

---

## 1. Webhook Endpoint

### Endpoint: `POST /api/webhooks/revenuecat`
This endpoint receives real-time subscription lifecycle webhooks from RevenueCat and synchronizes subscription state into Supabase:
* **Table `licences`:** Creates/renews mobile licenses (`source: 'mobile'`, `type: 'paid'`, `status: 'active' | 'expired'`).
* **Table `profiles`:** Updates `web_subscription_active: true/false` and `web_subscription_expires_at` for cross-platform account access.
* **Table `licence_activity_log`:** Logs full audit entries for initial purchase, renewals, and cancellations.

### Environment Variable Setup
Add to your `.env.local` / production environment:
```env
REVENUECAT_WEBHOOK_AUTH_KEY="your_secure_webhook_secret_key"
```
In RevenueCat Dashboard → Project Settings → Webhooks → Add Header:
```
Authorization: Bearer your_secure_webhook_secret_key
```

---

## 2. Client Immediate Activation Endpoint

### Endpoint: `POST /api/flutter/iap/activate`
Called immediately by the Flutter app after a successful purchase or restore.
* Generates/renews a mobile licence in Supabase.
* Returns a signed `LicenceJwtPayload` token so the mobile app can stream and download offline simulations immediately without waiting for webhook delivery.

#### Request Body:
```json
{
  "device_id": "uuid-device-id",
  "product_id": "keeel_9999_1y",
  "original_transaction_id": "apple-transaction-id"
}
```

#### Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "licence_key": "KEEEL-XXXX-XXXX",
  "expires_at": "2027-09-06T12:00:00.000Z"
}
```

---

## 3. Product Mapping
| Product ID | Type | Duration | Price (USD) |
| :--- | :--- | :--- | :--- |
| `keeel_999_1m` | Auto-Renewing Subscription | 1 Month | $9.99 |
| `keeel_9999_1y` | Auto-Renewing Subscription | 1 Year | $99.99 |
