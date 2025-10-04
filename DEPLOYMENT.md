# 🚀 EvimAI Deployment Guide

## Render.com Deployment (Automated)

### ✅ What's Already Done
- ✅ `render.yaml` created for automatic deployment
- ✅ Health check endpoints added (`/` and `/health`)
- ✅ Package.json configured with Node 18+ requirement
- ✅ Environment variables documented
- ✅ Build and start commands configured

### 📋 Deployment Steps

#### 1️⃣ Push to GitHub
```bash
git add .
git commit -m "🚀 Prepare backend for Render deployment"
git push origin main
```

#### 2️⃣ Connect to Render
1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`

#### 3️⃣ Add Environment Variables
In Render dashboard, add:
- **Key**: `FAL_API_KEY`
- **Value**: Your FAL AI API key from https://fal.ai

#### 4️⃣ Deploy!
- Click **"Create Web Service"**
- Render will automatically:
  - Run `cd backend && npm install` (build)
  - Start with `node backend/server.js`
  - Assign URL: https://evimai.onrender.com

### ⚡ Expected Build Process
```
[build] Installing dependencies...
[build] npm install (in backend/)
[build] ✓ Dependencies installed

[deploy] Starting server...
[deploy] EvimAI Backend running on 0.0.0.0:8082
[deploy] ✓ Service live at https://evimai.onrender.com
```

### 🧪 Test Your Deployment

#### Check Health
```bash
curl https://evimai.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 42.5,
  "memory": {...}
}
```

#### Test Image Processing
```bash
curl -X POST https://evimai.onrender.com/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "redesign",
    "style": "modern",
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

### 🔧 Troubleshooting

#### Build Fails?
- Check build logs in Render dashboard
- Verify `backend/package.json` exists
- Ensure Node version >= 18

#### Service Crashes?
- Check `FAL_API_KEY` is set in Environment Variables
- Review logs for errors
- Verify memory limit (free tier = 512MB)

#### Slow Response?
- Free tier spins down after inactivity
- First request after idle = ~30s cold start
- Upgrade to paid plan for always-on service

### 📊 Monitoring

Monitor your service:
- **Logs**: Real-time in Render dashboard
- **Metrics**: CPU, Memory, Network usage
- **Health**: Auto-checked via `/health` endpoint

### 🔄 Auto-Deploy on Push

Once connected:
```bash
git add .
git commit -m "Update feature"
git push origin main
# ✓ Render automatically rebuilds and deploys
```

### 🎯 Production Checklist

- [x] Health check endpoints
- [x] Environment variables configured
- [x] CORS enabled for all origins
- [x] Error handling middleware
- [x] Port configuration (process.env.PORT)
- [ ] Optional: Add Redis for caching (Render Redis add-on)
- [ ] Optional: Add monitoring (Sentry, LogRocket)
- [ ] Optional: Upgrade plan for always-on service

### 💰 Cost Estimate

**Free Tier:**
- 750 hours/month
- 512MB RAM
- Shared CPU
- Spins down after inactivity
- ✅ Perfect for testing!

**Starter Plan ($7/month):**
- Always on
- 512MB RAM
- Better performance
- Custom domains

### 🔐 Security Notes

- FAL_API_KEY is stored securely in Render environment
- Never commit `.env` files to Git
- Use `.env.example` for documentation only

---

## 🎉 You're Ready!

Your backend is now production-ready for Render deployment.

**Live URL**: https://evimai.onrender.com

Need help? Check Render docs: https://render.com/docs
