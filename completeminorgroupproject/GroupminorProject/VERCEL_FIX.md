# Vercel 404 NOT_FOUND Error - Complete Fix Guide

## 🔴 Root Cause Analysis

### What Happened:
Vercel is trying to build from the root directory (`./`) but your Next.js app is in the `dashboard/` subdirectory. This causes:
- Vercel can't find `package.json` in root
- Build fails or deploys empty site
- Results in 404 NOT_FOUND error

### Why This Error Exists:
Vercel's NOT_FOUND error protects you from:
- Accessing non-existent resources
- Broken deployments
- Incorrect routing configurations
- Missing build outputs

---

## ✅ Solution 1: Set Root Directory in Vercel Dashboard (RECOMMENDED)

### Step-by-Step Fix:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `Groupminor`

2. **Navigate to Settings**
   - Click **Settings** tab
   - Go to **General** section

3. **Set Root Directory**
   - Find **Root Directory** field
   - Click **Edit**
   - Change from `./` to: `dashboard`
   - Click **Save**

4. **Verify Framework Detection**
   - Framework should auto-detect as: **Next.js**
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
   - Install Command: `npm install` (auto)

5. **Redeploy**
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment
   - Or push a new commit to trigger auto-deploy

---

## ✅ Solution 2: Use Vercel CLI (Alternative)

If dashboard settings don't work:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
cd C:\CodeData\GroupminorProject
vercel link

# Set root directory
vercel --prod --cwd dashboard
```

---

## ✅ Solution 3: Fix vercel.json (If Solution 1 Doesn't Work)

The root `vercel.json` has been updated. If you still get errors:

1. **Remove root vercel.json** (let Vercel auto-detect)
2. **Or use this simplified version:**

```json
{
  "buildCommand": "cd dashboard && npm install && npm run build",
  "outputDirectory": "dashboard/.next"
}
```

---

## 🔍 Verification Steps

After fixing, verify:

1. **Check Build Logs**
   - Go to Vercel → Deployments → Latest
   - Check build logs for:
     - ✅ "Installing dependencies..."
     - ✅ "Building Next.js app"
     - ✅ "Build completed"

2. **Check Deployment URL**
   - Visit: `https://your-project.vercel.app`
   - Should show dashboard (not 404)

3. **Check Routes**
   - `/` - Home page
   - `/dashboard` - Dashboard page
   - `/analytics` - Analytics page
   - `/predictions` - Predictions page

---

## 🚨 Common Issues & Fixes

### Issue 1: "Cannot find module"
**Fix**: Root directory not set to `dashboard`

### Issue 2: "Build failed"
**Fix**: 
- Check Node.js version (should be 18+)
- Verify `dashboard/package.json` exists
- Check build logs for specific errors

### Issue 3: "404 on all routes"
**Fix**: 
- Root directory not set correctly
- Next.js not detected as framework
- Missing `dashboard/.next` output

### Issue 4: "Environment variables not found"
**Fix**: 
- Add in Vercel Dashboard → Settings → Environment Variables
- Use `NEXT_PUBLIC_` prefix for client-side vars

---

## 📝 Correct Mental Model

### How Vercel Works:
1. **Detects Framework**: Looks for `package.json` → detects Next.js
2. **Finds Entry Point**: Looks for `app/` or `pages/` directory
3. **Builds App**: Runs `npm run build`
4. **Deploys Output**: Serves from `.next/` directory

### For Subdirectory Projects:
- **Root Directory** tells Vercel where to look
- Set to `dashboard` = Vercel looks in `dashboard/` folder
- Vercel then finds `dashboard/package.json` → detects Next.js
- Builds from `dashboard/` → outputs to `dashboard/.next/`

---

## ⚠️ Warning Signs to Watch For

1. **Build logs show "Installing dependencies" in root**
   - ❌ Wrong: Installing from project root
   - ✅ Correct: Installing from `dashboard/` folder

2. **Build fails with "Cannot find package.json"**
   - Root directory not set correctly

3. **404 on all routes including `/`**
   - Next.js not building correctly
   - Output directory wrong

4. **Deployment shows "No framework detected"**
   - Root directory not pointing to Next.js app
   - Missing `package.json` in that directory

---

## 🎯 Best Practice

**Always set Root Directory in Vercel Dashboard** rather than relying on `vercel.json`:
- More reliable
- Easier to change
- Clearer configuration
- Better error messages

---

## 🔄 Alternative Approaches

### Option A: Monorepo Structure (Current)
```
project/
├── dashboard/     ← Next.js app
├── backend/       ← Backend server
└── vercel.json    ← Root config
```
**Root Directory**: `dashboard`

### Option B: Separate Repositories
- Dashboard in separate repo
- Deploy directly from dashboard repo
- No root directory needed

### Option C: Move Next.js to Root
```
project/
├── app/           ← Next.js app directory
├── package.json   ← Next.js package.json
└── next.config.js
```
**Root Directory**: `./` (default)

---

## ✅ Quick Checklist

- [ ] Root Directory set to `dashboard` in Vercel Dashboard
- [ ] Framework detected as Next.js
- [ ] Build logs show successful build
- [ ] Deployment URL accessible (not 404)
- [ ] Environment variables added (if needed)
- [ ] Routes working (`/`, `/dashboard`, etc.)

---

**After fixing, your deployment should work!** 🎉
