---
description: Complete Inbox Zero setup – configure Google OAuth, provision DB, fetch emails, start app
---

# 🚀 Inbox Zero Complete Setup Workflow

This workflow guides you through setting up the Inbox Zero app with your Google credentials, fetching all your Gmail messages, and starting the labeling system.

---

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ Node.js 18+ and pnpm installed
- ✅ Python 3.11+ installed
- ✅ Google Cloud project with Gmail API enabled
- ✅ OAuth 2.0 credentials (Client ID + Secret)

---

## 1️⃣ Configure Google OAuth Credentials

**Action Required:** Update your `.env` file with real Google credentials.

1. Open `apps/web/.env`
2. Replace these placeholder values:

```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET
```

**How to get credentials:**
- Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Create OAuth 2.0 Client ID (Application type: Web application)
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Copy Client ID and Secret to `.env`

---

## 2️⃣ Start Docker Services (Postgres + Redis)

// turbo

```bash
docker compose -f docker-compose.dev.yml up -d
```

**What this does:**
- Starts PostgreSQL on port `5433`
- Starts Redis on port `6380`
- Starts serverless-redis-http on port `8079`

**Verify services are running:**

```bash
docker compose -f docker-compose.dev.yml ps
```

---

## 3️⃣ Install Project Dependencies

// turbo

```bash
pnpm install
```

---

## 4️⃣ Run Database Migrations

// turbo

```bash
pnpm --filter @inboxzero/web prisma migrate dev --name init
```

**What this does:**
- Creates all necessary database tables
- Sets up the schema defined in `prisma/schema.prisma`

---

## 5️⃣ Generate Prisma Client

// turbo

```bash
pnpm --filter @inboxzero/web prisma generate
```

---

## 6️⃣ Start the Next.js Development Server

// turbo

```bash
pnpm --filter @inboxzero/web dev
```

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

**Keep this terminal open** – the dev server needs to stay running.

---

## 7️⃣ Open the App and Complete OAuth Flow

1. Open your browser to: **http://localhost:3000**
2. Click **"Sign in with Google"**
3. Authorize the app to access your Gmail
4. You should be redirected to the dashboard

---

## 8️⃣ Verify Email Sync

Once authenticated, the app should automatically:
- ✅ Fetch your Gmail messages via webhooks (if Pub/Sub is configured)
- ✅ OR use polling to sync emails periodically

**Check the database:**

```bash
docker exec -it inbox-zero-dev-db psql -U postgres -d inboxzero -c "SELECT COUNT(*) FROM \"Account\";"
```

You should see at least 1 account (your Google account).

---

## 9️⃣ Trigger Manual Email Sync (Optional)

If emails aren't syncing automatically, you can trigger a manual sync:

1. Go to **Settings** in the web UI
2. Click **"Sync Emails"** or **"Refresh Inbox"**

Alternatively, use the API directly:

```bash
curl -X POST http://localhost:3000/api/google/webhook \
  -H "Content-Type: application/json" \
  -d '{"message": {"data": ""}}'
```

---

## 🎯 Verification Checklist

| Step | Command | Expected Result |
|------|---------|----------------|
| Docker services running | `docker compose -f docker-compose.dev.yml ps` | All services `Up` |
| Database accessible | `docker exec inbox-zero-dev-db pg_isready` | `accepting connections` |
| Web server running | `curl http://localhost:3000` | HTML response (200 OK) |
| OAuth configured | Check `.env` | Real `GOOGLE_CLIENT_ID` present |
| User authenticated | Visit `/api/auth/session` | JSON with user data |

---

## 🐛 Troubleshooting

### Issue: "Invalid client ID"
**Solution:** Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

### Issue: "Database connection failed"
**Solution:** 
```bash
docker compose -f docker-compose.dev.yml restart db
pnpm --filter @inboxzero/web prisma migrate reset
```

### Issue: "Emails not syncing"
**Solution:** 
- Check that Gmail API is enabled in Google Cloud Console
- Verify OAuth scopes include `https://www.googleapis.com/auth/gmail.modify`
- Check logs: `docker compose -f docker-compose.dev.yml logs -f`

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm --filter @inboxzero/web dev
```

---

## 🧹 Cleanup (Optional)

To stop all services and remove data:

```bash
# Stop services
docker compose -f docker-compose.dev.yml down

# Remove volumes (⚠️ deletes all data)
docker compose -f docker-compose.dev.yml down -v
```

---

## 📚 Next Steps

Once setup is complete, you can:

1. **Configure AI Rules** – Set up automatic email categorization
2. **Create Labels** – Define custom labels for organization
3. **Set Up Automation** – Configure auto-archive, auto-reply, etc.
4. **Explore Analytics** – View email statistics and insights

---

## 🔗 Useful Links

- [Inbox Zero Documentation](https://docs.inboxzero.com)
- [Gmail API Setup Guide](https://developers.google.com/gmail/api/quickstart)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
