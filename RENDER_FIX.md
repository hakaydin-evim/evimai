# 🚨 RENDER DEPLOYMENT FIX - CRITICAL

## Problem
Render is using OLD cached code. `processStaging is not defined` error.

## IMMEDIATE FIX - Manual Settings

### Go to Render Dashboard
https://dashboard.render.com/web/evimai-1/settings

### Update These Settings:

**Build & Deploy Section:**

1. **Root Directory**: `backend`
   (IMPORTANT! This tells Render to run commands from backend folder)

2. **Build Command**: `npm install`
   (No need for `cd backend` because we set root directory)

3. **Start Command**: `node server.js`
   (Again, no path needed - runs from backend/)

### After Changing:
1. Click **"Save Changes"** at bottom
2. Click **"Manual Deploy"** button (top right)
3. Select **"Clear build cache & deploy"**
4. Wait 2-3 minutes for build

### Verify Deployment:
```bash
curl https://evimai-1.onrender.com/health
```

Should return:
```json
{"status":"healthy","uptime":...}
```

Test API:
```bash
curl -X POST https://evimai-1.onrender.com/api/process \
  -H "Content-Type: application/json" \
  -d '{"mode":"staging","imageBase64":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

Should return success with processed image data.

---

## Why This Happened:
- render.yaml changes don't auto-update existing services
- Need to manually update settings in dashboard
- OR delete service and recreate (not recommended)
