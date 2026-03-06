# Vercel Deployment Guide

## 🚀 Deploying Smart Irrigation Digital Twin Dashboard to Vercel

### Step 1: Configure Vercel Project Settings

When deploying on Vercel, you need to set the **Root Directory** to `dashboard`:

1. Go to your Vercel project settings
2. Navigate to **Settings → General**
3. Under **Root Directory**, click **Edit**
4. Set it to: `dashboard`
5. Click **Save**

### Step 2: Framework Settings

- **Framework Preset**: Next.js
- **Root Directory**: `dashboard`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Step 3: Environment Variables

Add these environment variables in **Settings → Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
NEXT_PUBLIC_WS_URL=wss://your-backend-url.vercel.app
NEXT_PUBLIC_CAMERA_URL=http://your-esp32cam-ip/stream
```

**For Development:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXT_PUBLIC_CAMERA_URL=http://your-esp32cam-ip/stream
```

### Step 4: Deploy

#### Option A: Via Vercel Dashboard
1. Connect your GitHub repository
2. Import project
3. Set Root Directory to `dashboard`
4. Add environment variables
5. Click **Deploy**

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project root
cd C:\CodeData\GroupminorProject

# Deploy
vercel

# Follow prompts:
# - Set root directory: dashboard
# - Add environment variables when prompted
```

### Step 5: Update API URLs

After deployment, update your backend server URL in environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to your backend URL
3. Update `NEXT_PUBLIC_WS_URL` to your WebSocket URL
4. Redeploy if needed

---

## 🔧 Troubleshooting

### Error: "Cannot find module"
- **Solution**: Make sure Root Directory is set to `dashboard`
- Check that `package.json` exists in `dashboard/` folder

### Error: "Build failed"
- **Solution**: 
  - Check Node.js version (should be 18+)
  - Verify all dependencies in `dashboard/package.json`
  - Check build logs for specific errors

### Error: "Environment variables not found"
- **Solution**: 
  - Add environment variables in Vercel Dashboard
  - Make sure they start with `NEXT_PUBLIC_` for client-side access
  - Redeploy after adding variables

### Error: "API connection failed"
- **Solution**: 
  - Update `NEXT_PUBLIC_API_URL` to your backend server URL
  - Make sure backend is deployed and accessible
  - Check CORS settings on backend

---

## 📝 Quick Checklist

- [ ] Root Directory set to `dashboard`
- [ ] Framework set to Next.js
- [ ] Environment variables added
- [ ] Backend server deployed (separate deployment)
- [ ] API URLs updated
- [ ] Build successful
- [ ] Site accessible

---

## 🌐 Deployment URLs

After successful deployment:

- **Dashboard**: `https://your-project.vercel.app`
- **Backend API**: Deploy separately (see backend-server/README.md)

---

## 💡 Important Notes

1. **Backend Server**: The backend server (`backend-server/`) needs to be deployed separately
   - Can use Vercel Serverless Functions
   - Or deploy to Railway, Render, or Heroku
   - Or use a VPS/server

2. **WebSocket**: WebSocket connections may need special configuration
   - Vercel supports WebSockets via Serverless Functions
   - Or use a separate WebSocket server

3. **Environment Variables**: 
   - Variables starting with `NEXT_PUBLIC_` are exposed to the browser
   - Don't put sensitive data in `NEXT_PUBLIC_` variables
   - Use Vercel's environment variable encryption

---

**Need Help?** Check Vercel documentation: https://vercel.com/docs
