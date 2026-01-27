# Vercel Deployment Settings - Exact Values

## 📋 Vercel Project Settings

Fill these exact values in your Vercel Dashboard:

### **Root Directory**
```
dashboard
```
**Explanation**: This tells Vercel your Next.js app is in the `dashboard/` folder, not the root.

---

### **Framework Preset**
```
Next.js
```
**Explanation**: Auto-detected when root directory is set correctly. If not auto-detected, select "Next.js" manually.

---

### **Build Command**
```
npm run build
```
**OR leave empty** (Vercel will auto-detect this)

**Explanation**: This runs `npm run build` inside the `dashboard/` folder (since root directory is set to `dashboard`).

---

### **Output Directory**
```
.next
```
**OR leave empty** (Vercel will auto-detect this)

**Explanation**: Next.js outputs the built app to `.next/` directory. Vercel automatically finds this when root directory is `dashboard`.

---

### **Install Command**
```
npm install
```
**OR leave empty** (Vercel will auto-detect this)

**Explanation**: Installs dependencies from `dashboard/package.json`.

---

### **Development Command**
```
npm run dev
```
**OR leave empty** (Vercel will auto-detect this)

**Explanation**: Used for Vercel's preview deployments. Not critical for production.

---

## ✅ Recommended Settings (Simplest)

**For easiest setup, only fill this:**

| Field | Value |
|-------|-------|
| **Root Directory** | `dashboard` |
| **Framework Preset** | `Next.js` (auto) |
| **Build Command** | *(leave empty - auto)* |
| **Output Directory** | *(leave empty - auto)* |
| **Install Command** | *(leave empty - auto)* |
| **Development Command** | *(leave empty - auto)* |

**Vercel will auto-detect everything else!**

---

## 🎯 Step-by-Step in Vercel Dashboard

1. **Go to**: Settings → General

2. **Root Directory**:
   - Click **Edit**
   - Type: `dashboard`
   - Click **Save**

3. **Framework Preset**:
   - Should auto-detect as **Next.js**
   - If not, select **Next.js** from dropdown

4. **Build Command**:
   - Leave empty (auto-detects `npm run build`)
   - OR manually set: `npm run build`

5. **Output Directory**:
   - Leave empty (auto-detects `.next`)
   - OR manually set: `.next`

6. **Install Command**:
   - Leave empty (auto-detects `npm install`)
   - OR manually set: `npm install`

7. **Development Command**:
   - Leave empty (auto-detects `npm run dev`)
   - OR manually set: `npm run dev`

---

## 🔍 Why These Values Work

### Root Directory = `dashboard`
- Vercel changes working directory to `dashboard/`
- Finds `dashboard/package.json` ✅
- Detects Next.js framework ✅

### Build Command = `npm run build` (auto)
- Runs inside `dashboard/` folder
- Executes Next.js build process
- Creates `.next/` output directory

### Output Directory = `.next` (auto)
- Next.js always outputs to `.next/`
- Vercel serves from this directory
- Auto-detected when framework is Next.js

### Install Command = `npm install` (auto)
- Installs from `dashboard/package.json`
- Runs before build
- Auto-detected by Vercel

---

## ⚠️ Common Mistakes

### ❌ Wrong:
- Root Directory: `./` → Can't find package.json
- Root Directory: `dashboard/` → Extra slash causes issues
- Build Command: `cd dashboard && npm run build` → Not needed if root directory is set

### ✅ Correct:
- Root Directory: `dashboard` → Perfect!
- Build Command: `npm run build` → Runs in dashboard folder automatically
- Output Directory: `.next` → Auto-detected

---

## 📝 Quick Reference

**Minimum Required**:
- ✅ Root Directory: `dashboard`

**Everything else can be auto-detected!**

---

## 🚀 After Setting

1. Click **Save**
2. Go to **Deployments**
3. Click **Redeploy**
4. Wait for build
5. Visit your site!

---

**That's it! Just set Root Directory to `dashboard` and Vercel handles the rest!** 🎯
