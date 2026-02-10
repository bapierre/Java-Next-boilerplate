# Channel OAuth Setup Guide

This guide walks you through creating OAuth apps for each social platform so users can connect their accounts in MarketiStats.

For every platform, the **Redirect URI** (also called Callback URL) follows this pattern:

```
{BACKEND_URL}/api/channels/oauth/{platform}/callback
```

For local development, most platforms accept `http://localhost`:

| Platform  | Redirect URI                                                  |
|-----------|---------------------------------------------------------------|
| Instagram | `http://localhost:8080/api/channels/oauth/instagram/callback` |
| YouTube   | `http://localhost:8080/api/channels/oauth/youtube/callback`   |
| Twitter   | `http://localhost:8080/api/channels/oauth/twitter/callback`   |
| Facebook  | `http://localhost:8080/api/channels/oauth/facebook/callback`  |

**TikTok requires HTTPS** and does not accept `localhost`. Use the local HTTPS proxy instead:

| Platform  | Redirect URI                                                        |
|-----------|---------------------------------------------------------------------|
| TikTok    | `https://marketistats.com/api/channels/oauth/tiktok/callback`       |

> In production, replace `http://localhost:8080` with your `BACKEND_URL`.

### Local HTTPS Proxy (required for TikTok)

TikTok does not accept `localhost` or `http://` redirect URIs. To develop locally, map the domain to your machine and run a TLS reverse proxy:

```bash
# 1. Point marketistats.com to localhost
sudo sh -c 'echo "127.0.0.1 marketistats.com" >> /etc/hosts'

# 2. Install mkcert + caddy (one-time)
brew install mkcert caddy
mkcert -install

# 3. Generate a trusted local certificate
cd /path/to/marketistats
mkcert marketistats.com

# 4. Start the proxy (routes :443 → backend :8080 + frontend :3000)
caddy run
```

With this running, `https://marketistats.com/api/...` reaches your local backend and `https://marketistats.com` reaches your frontend.

> **Remember** to remove the `/etc/hosts` entry when you want to access the real production site.

---

## 1. TikTok

**Developer Portal**: https://developers.tiktok.com

### Steps

1. Log in and go to **Manage apps** > **Create app**.
2. Choose **Web** as the platform.
3. Fill in your app name and description.
4. Under **Products**, add **Login Kit** and **Content Posting API** (or whichever products you need).
5. In **Login Kit** configuration:
   - Add Redirect URI: `https://marketistats.com/api/channels/oauth/tiktok/callback` (see [Local HTTPS Proxy](#local-https-proxy-required-for-tiktok) above)
   - Select scopes: `user.info.basic`, `user.info.stats`, `video.list`
6. Submit the app for review (sandbox mode works for development).
7. Copy **Client Key** and **Client Secret** from the app dashboard.

### Environment Variables

```env
TIKTOK_CLIENT_ID=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
```

### Notes
- TikTok calls the Client ID "Client Key" in their dashboard.
- Sandbox mode allows testing with your own account before approval.
- TikTok requires HTTPS redirect URIs **even in development** — use the local HTTPS proxy setup above.
- Set `BACKEND_URL=https://marketistats.com` in `backend/.env` when using the proxy.

---

## 2. Instagram

Instagram uses the **Facebook Graph API** for OAuth. You create a Facebook App with the Instagram product.

**Developer Portal**: https://developers.facebook.com

### Steps

1. Go to **My Apps** > **Create App**.
2. Select app type: **Business**.
3. Fill in your app name and contact email.
4. From the app dashboard, click **Add Product** > **Instagram** > **Set Up**.
5. Go to **Instagram > Basic Display** (or **Instagram API with Instagram Login** for the newer API).
6. Under **Valid OAuth Redirect URIs**, add:
   `http://localhost:8080/api/channels/oauth/instagram/callback`
7. Add Instagram test users (your Instagram account) under **Roles > Instagram Testers** — then accept the invite from Instagram's settings.
8. Copy **Instagram App ID** and **Instagram App Secret**.

### Environment Variables

```env
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
```

### Notes
- Instagram OAuth goes through `facebook.com/v21.0/dialog/oauth`.
- Scopes requested: `instagram_basic`, `instagram_manage_insights`, `pages_show_list`.
- You need a Facebook Page connected to your Instagram Professional account.
- Test mode works for development without full app review.

---

## 3. YouTube (Google)

**Developer Console**: https://console.cloud.google.com

### Steps

1. Create a new project (or select an existing one).
2. Go to **APIs & Services** > **Library**.
3. Enable **YouTube Data API v3** and **YouTube Analytics API**.
4. Go to **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**.
5. If prompted, configure the **OAuth consent screen** first:
   - Choose **External** user type.
   - Fill in app name, user support email, and developer contact email.
   - Add scopes: `youtube.readonly`, `yt-analytics.readonly`.
   - Add your Google account as a test user.
6. Back in **Create OAuth client ID**:
   - Application type: **Web application**.
   - Authorized redirect URIs: `http://localhost:8080/api/channels/oauth/youtube/callback`
7. Copy **Client ID** and **Client Secret**.

### Environment Variables

```env
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret
```

### Notes
- While in "Testing" publishing status, only test users you add can authenticate.
- Scopes requested: `youtube.readonly`, `yt-analytics.readonly`.
- Google allows `http://localhost` redirect URIs for development (no HTTPS needed).

---

## 4. X (Twitter)

**Developer Portal**: https://developer.x.com/en/portal/dashboard

### Steps

1. Sign up for a developer account (Free tier works for basic OAuth).
2. Create a new **Project** and an **App** inside it.
3. Go to your app's **Settings** > **User authentication settings** > **Set up**.
4. Configure:
   - **App permissions**: Read
   - **Type of App**: Web App, Automated App or Bot
   - **Callback URI**: `http://localhost:8080/api/channels/oauth/twitter/callback`
   - **Website URL**: your app URL (e.g. `http://localhost:3000`)
5. Save and copy your **Client ID** and **Client Secret** (under the **OAuth 2.0** section, not API keys).

### Environment Variables

```env
TWITTER_CLIENT_ID=your_oauth2_client_id
TWITTER_CLIENT_SECRET=your_oauth2_client_secret
```

### Notes
- Use the **OAuth 2.0 Client ID**, not the API Key / API Secret (those are OAuth 1.0a).
- Scopes requested: `tweet.read`, `users.read`, `offline.access`.
- Twitter uses PKCE flow (the app sends a code challenge automatically).
- Free tier has rate limits but is sufficient for development.

---

## 5. Facebook

**Developer Portal**: https://developers.facebook.com

### Steps

1. Go to **My Apps** > **Create App**.
2. Select app type: **Business**.
3. Fill in your app name and contact email.
4. From the app dashboard, click **Add Product** > **Facebook Login** > **Set Up**.
5. Go to **Facebook Login > Settings**.
6. Under **Valid OAuth Redirect URIs**, add:
   `http://localhost:8080/api/channels/oauth/facebook/callback`
7. Copy **App ID** and **App Secret** from **Settings > Basic**.

### Environment Variables

```env
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret
```

### Notes
- Facebook uses App ID as the Client ID.
- Scopes requested: `pages_show_list`, `pages_read_engagement`, `read_insights`.
- `pages_show_list` is available in development mode.
- `pages_read_engagement` and `read_insights` require App Review for production.
- Test mode allows your own account and app role users without review.

---

## Quick Start (All Platforms)

Once you have your credentials, add them all to `backend/.env`:

```env
BACKEND_URL=http://localhost:8080

TIKTOK_CLIENT_ID=...
TIKTOK_CLIENT_SECRET=...
INSTAGRAM_CLIENT_ID=...
INSTAGRAM_CLIENT_SECRET=...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
```

Restart the backend and the "Connect" buttons in the dashboard will start working. You only need to configure the platforms you want — unconfigured platforms will show an error message when clicked.
