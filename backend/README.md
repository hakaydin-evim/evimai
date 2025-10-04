# EvimAI Backend

AI-powered interior design and real estate valuation API backend.

## 🚀 Deployment on Render

### Automatic Deployment (Recommended)

1. Push this repo to GitHub
2. Connect your GitHub repo to Render
3. Render will automatically detect `render.yaml` and deploy
4. Add environment variable in Render Dashboard:
   - `FAL_API_KEY` = your FAL AI API key

### Manual Deployment

1. Create new Web Service on Render
2. Connect your GitHub repo
3. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `node backend/server.js`
   - **Environment Variables**: Add `FAL_API_KEY`

## 📦 Environment Variables

Required:
- `FAL_API_KEY` - FAL AI API key (https://fal.ai)

Optional:
- `PORT` - Server port (default: 8082, Render auto-sets this)
- `NODE_ENV` - Environment (production/development)
- `REDIS_URL` - Redis connection URL (for production caching)

## 🛠️ API Endpoints

### POST `/api/process`
Main image processing endpoint

**Request (multipart/form-data or JSON):**
```json
{
  "mode": "redesign|staging|estimate|renovation",
  "style": "modern|classic|industrial|bohemian",
  "userId": "user-id-here",
  "imageBase64": "base64-encoded-image-or-file-upload"
}
```

**Modes:**
- `redesign` - Interior redesign with AI
- `staging` - Virtual furniture staging
- `estimate` - Property value estimation
- `renovation` - Renovation cost estimation

**Response:**
```json
{
  "result": {
    "original": "base64-image",
    "processed": "base64-image",
    "mode": "redesign",
    "style": "modern",
    "confidence": 0.92,
    "features": ["Modern Design", "Natural Light"]
  }
}
```

## 🧪 Testing Locally

```bash
cd backend
npm install
npm start
```

Test endpoint:
```bash
curl -X POST http://localhost:8082/api/process \
  -H "Content-Type: application/json" \
  -d '{"mode":"redesign","style":"modern","imageBase64":"..."}'
```

## 📊 Production URL

Live at: **https://evimai.onrender.com**

## 🔧 Tech Stack

- **Framework**: Express.js
- **AI Service**: FAL AI (Flux, Segment Anything, Depth Estimation)
- **Image Processing**: Sharp, Multer
- **Cache**: Redis (mock in dev, real in production)
- **Deployment**: Render.com

## 📝 Notes

- Free tier on Render may spin down after inactivity (30s cold start)
- For production, consider upgrading to paid plan for:
  - Always-on service
  - More memory (Sharp needs ~512MB for large images)
  - Redis caching layer
