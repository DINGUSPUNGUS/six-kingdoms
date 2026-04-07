# Six Kingdoms Instagram DM Bot — Setup Guide

## How it works

When someone follows **@six_kingdoms** on Instagram, Meta fires a webhook event to this server, which immediately sends them a personalised welcome DM via the Instagram Graph API.

## Prerequisites

1. **@six_kingdoms must be a Professional account** (Business or Creator). Go to Instagram → Settings → Account → Switch to Professional Account.

2. **A Meta Developer App** — create one at [developers.facebook.com](https://developers.facebook.com). Add the **Instagram** product and the **Messenger** product.

3. **App permissions** — request and complete App Review for:
   - `instagram_manage_messages`
   - `pages_messaging`
   - `instagram_basic`

4. **A public HTTPS server** — Meta requires a public URL with TLS. Recommended free hosts:
   - [Railway](https://railway.app) — connect this folder as a GitHub repo, one-click deploy
   - [Render](https://render.com) — free tier, auto-deploys from GitHub

---

## Step-by-step setup

### 1. Get your Page Access Token

1. Go to [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app and your Instagram-connected Facebook Page
3. Generate a token with: `pages_messaging`, `instagram_manage_messages`, `instagram_basic`
4. Exchange for a long-lived token (valid 60 days):
   ```
   GET https://graph.facebook.com/v21.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id=YOUR_APP_ID
     &client_secret=YOUR_APP_SECRET
     &fb_exchange_token=SHORT_LIVED_TOKEN
   ```

### 2. Get your Instagram User ID

```
GET https://graph.facebook.com/v21.0/me?fields=id,name&access_token=YOUR_PAGE_ACCESS_TOKEN
```

### 3. Configure the bot

```bash
cp .env.example .env
# Edit .env with your VERIFY_TOKEN, PAGE_ACCESS_TOKEN, IG_USER_ID, APP_SECRET
```

### 4. Deploy to Railway (recommended)

1. Push `instagram-bot/` to a GitHub repository
2. Create a new Railway project → Deploy from GitHub
3. Add the environment variables from your `.env` file in Railway's dashboard
4. Railway gives you a public HTTPS URL (e.g. `https://your-app.railway.app`)

### 5. Configure the Meta Webhook

1. In your Meta App dashboard → Products → Webhooks
2. Add a new subscription for **Instagram**:
   - **Callback URL**: `https://your-app.railway.app/webhook`
   - **Verify Token**: the value you set as `VERIFY_TOKEN`
3. Subscribe to the **follows** field
4. Click **Verify and Save**

### 6. Test it

Use the [Meta Webhooks Testing Tool](https://developers.facebook.com/tools/webhooks-test-client/) to simulate a follow event, or have someone follow the account.

---

## Token refresh

Long-lived tokens expire after **60 days**. Set a calendar reminder to regenerate one, or implement a cron job that calls:

```
GET https://graph.facebook.com/v21.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id=APP_ID
  &client_secret=APP_SECRET
  &fb_exchange_token=CURRENT_TOKEN
```

---

## Limitations

- Only works if the follower has **not** restricted DMs from accounts they don't follow. If Meta returns error code `200`, the DM was blocked — this is handled gracefully (logged, not retried).
- Meta App Review for `instagram_manage_messages` typically takes **1–4 weeks**.
- The bot cannot initiate conversations with users who have followed and then unfollowed — only active followers can receive messages.
