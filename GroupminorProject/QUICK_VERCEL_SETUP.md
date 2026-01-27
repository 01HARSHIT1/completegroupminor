# Quick Vercel Deployment Fix

## ⚡ Quick Fix (2 Steps)

### Step 1: Set Root Directory in Vercel Dashboard

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **General**
3. Scroll to **Root Directory**
4. Click **Edit** and set it to: `dashboard`
5. Click **Save**

### Step 2: Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_WS_URL=wss://your-backend-url.com
NEXT_PUBLIC_CAMERA_URL=http://your-camera-ip/stream
```

**For local development/testing:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### Step 3: Redeploy

Click **Deployments** → **Redeploy** (or push a new commit)

---

## ✅ That's It!

After setting Root Directory to `dashboard`, Vercel will:
- ✅ Find `package.json` in `dashboard/` folder
- ✅ Run `npm install` in `dashboard/` folder
- ✅ Run `npm run build` in `dashboard/` folder
- ✅ Deploy the Next.js app correctly

---

## 🔍 Verify Settings

Your Vercel project settings should show:
- **Framework**: Next.js
- **Root Directory**: `dashboard`
- **Build Command**: `npm run build` (auto)
- **Output Directory**: `.next` (auto)

---

**If it still fails**, check the build logs and share the error message.
