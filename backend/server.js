// EvimAI Backend - Node.js + Express + FAL API
const express = require('express');
const multer = require('multer');
const fal = require('@fal-ai/serverless-client');
const Redis = require('redis');
const sharp = require('sharp');
const axios = require('axios');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Mock Redis for development (replace with real Redis in production)
const redis = {
  get: async () => null,
  set: async () => true,
  setex: async () => true,
  del: async () => true,
  decr: async () => true,
  incrby: async () => true,
  isOpen: true,
  connect: async () => console.log('📦 Mock Redis connected'),
  quit: async () => console.log('📦 Mock Redis disconnected')
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS ayarları
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint for Render
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'EvimAI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    redis: redis.isOpen ? 'connected' : 'disconnected'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Environment variables
require('dotenv').config();

// FAL API Configuration
fal.config({
  credentials: process.env.FAL_API_KEY
});

// AI Model Configurations
const AI_MODELS = {
  // İç Mekan Yeniden Tasarım
  redesign: {
    model: 'fal-ai/flux-interior-design',
    params: {
      strength: 0.85,
      guidance_scale: 7.5,
      num_inference_steps: 30,
      styles: {
        modern: "modern minimalist interior design, scandinavian style",
        classic: "classical luxury interior design, elegant furniture",
        industrial: "industrial loft style interior, exposed brick walls",
        bohemian: "bohemian eclectic interior design, colorful patterns"
      }
    }
  },

  // Sanal Mobilyalama
  staging: {
    model: 'fal-ai/virtual-staging',
    params: {
      furniture_style: "contemporary",
      room_type: "auto-detect",
      lighting: "natural",
      color_scheme: "neutral"
    }
  },

  // Görüntü İyileştirme
  enhancement: {
    model: 'fal-ai/real-esrgan',
    params: {
      scale: 4,
      face_enhance: false,
      denoise: 0.5
    }
  },

  // Oda Segmentasyonu
  segmentation: {
    model: 'fal-ai/segment-anything',
    params: {
      detect_objects: true,
      mask_precision: "high"
    }
  },

  // 3D Derinlik Haritası
  depth: {
    model: 'fal-ai/depth-anything',
    params: {
      output_type: "depth_map"
    }
  }
};

// Ana İşleme Endpoint'i
app.post('/api/process', upload.single('image'), async (req, res) => {
  try {
    const { mode, style, userId, imageBase64 } = req.body;

    // Support both file upload and base64
    let imageBuffer;
    if (req.file) {
      // File upload (web/desktop)
      imageBuffer = req.file.buffer;
    } else if (imageBase64) {
      // Base64 (mobile app)
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Kullanıcı kredisini kontrol et
    const hasCredits = await checkUserCredits(userId);
    if (!hasCredits) {
      return res.status(402).json({ error: 'Insufficient credits' });
    }

    // Görüntüyü optimize et (BYPASSED - causing corrupt header errors)
    // const optimizedImage = await optimizeImage(imageBuffer);
    const optimizedImage = imageBuffer; // Use original buffer without optimization

    // Cache kontrolü
    const cacheKey = generateCacheKey(optimizedImage, mode, style);
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return res.json({ result: JSON.parse(cachedResult), fromCache: true });
    }

    // Mode'a göre işlem
    let result;
    switch (mode) {
      case 'redesign':
        result = await processRedesign(optimizedImage, style);
        break;
      case 'staging':
        result = await processStaging(optimizedImage);
        break;
      case 'estimate':
        result = await processEstimate(optimizedImage);
        break;
      case 'renovation':
        result = await processRenovation(optimizedImage);
        break;
      default:
        throw new Error('Invalid mode');
    }

    // Sonucu cache'le
    await redis.setex(cacheKey, 3600, JSON.stringify(result));

    // Kullanıcı kredisini düşür
    await decrementUserCredits(userId);

    res.json({ result });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yeniden Tasarım İşlemi
async function processRedesign(imageBuffer, style = 'modern') {
  try {
    // MOCK RESULT FOR TESTING
    console.log('🎭 MOCK MODE: Returning demo result for redesign');

    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    return {
      success: true,
      original: base64Image,
      processed: base64Image, // Same image for mock
      generated_image: base64Image,
      mode: 'redesign',
      style: style,
      confidence: 0.92,
      features: ['Modern Design', 'Minimalist Style', 'Natural Light'],
      description: `Demo mode - ${style} redesign result`
    };

    /* DISABLED - FAL API causing errors
    // 1. Önce odayı segmente et
    const segmentation = await fal.subscribe(AI_MODELS.segmentation.model, {
      input: {
        image: imageBuffer.toString('base64'),
        ...AI_MODELS.segmentation.params
      }
    });

    // 2. Derinlik haritası oluştur
    const depth = await fal.subscribe(AI_MODELS.depth.model, {
      input: {
        image: imageBuffer.toString('base64'),
        ...AI_MODELS.depth.params
      }
    });

    // 3. Ana redesign işlemi
    const redesigned = await fal.subscribe(AI_MODELS.redesign.model, {
      input: {
        image: imageBuffer.toString('base64'),
        prompt: AI_MODELS.redesign.params.styles[style],
        depth_map: depth.output,
        mask: segmentation.masks?.room,
        ...AI_MODELS.redesign.params
      }
    });

    // 4. Görüntüyü iyileştir
    const enhanced = await fal.subscribe(AI_MODELS.enhancement.model, {
      input: {
        image: redesigned.output,
        ...AI_MODELS.enhancement.params
      }
    });

    return {
      original: imageBuffer.toString('base64'),
      processed: enhanced.output,
      style: style,
      metadata: {
        room_type: segmentation.detected_room_type,
        furniture_detected: segmentation.objects,
        processing_time: Date.now()
      }
    };
  } catch (error) {
    throw new Error(`Redesign failed: ${error.message}`);
  }
}

// Sanal Mobilyalama İşlemi
async function processStaging(imageBuffer) {
  try {
    // MOCK RESULT FOR TESTING - FAL API integration disabled temporarily
    console.log('🎭 MOCK MODE: Returning demo result for staging');

    // Convert buffer to base64 for return
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    return {
      success: true,
      original: base64Image,
      processed: base64Image, // Same image for now (mock)
      generated_image: base64Image,
      mode: 'staging',
      confidence: 0.95,
      features: ['Modern Sofa', 'Coffee Table', 'Wall Art', 'Lighting'],
      description: 'Demo mode - staging result'
    };

    /* DISABLED FAL API CALL - causing "Not Found" errors
    const staged = await fal.subscribe(AI_MODELS.staging.model, {
      input: {
        image: imageBuffer.toString('base64'),
        ...AI_MODELS.staging.params,
        prompt: "professionally staged room with modern furniture, warm lighting"
      }
    }); */

    // Varyasyonlar oluştur
    const variations = [];
    for (let i = 0; i < 3; i++) {
      const variation = await fal.subscribe(AI_MODELS.staging.model, {
        input: {
          image: imageBuffer.toString('base64'),
          ...AI_MODELS.staging.params,
          seed: Math.floor(Math.random() * 10000),
          variation_strength: 0.3
        }
      });
      variations.push(variation.output);
    }

    return {
      original: imageBuffer.toString('base64'),
      processed: staged.output,
      variations: variations,
      furniture_list: staged.detected_furniture || []
    };
  } catch (error) {
    throw new Error(`Staging failed: ${error.message}`);
  }
}

// Emlak Değer Tahmini
async function processEstimate(imageBuffer) {
  try {
    // Görüntü analizi
    const analysis = await analyzePropertyImage(imageBuffer);

    // Dış API'lerden veri çek (Sahibinden, Emlakjet vb.)
    const marketData = await fetchMarketData(analysis.location);

    // ML modeli ile tahmin
    const estimate = calculatePropertyValue({
      room_features: analysis.features,
      quality_score: analysis.quality,
      market_data: marketData
    });

    return {
      estimated_value: estimate.value,
      price_per_sqm: estimate.pricePerSqm,
      confidence: estimate.confidence,
      comparable_properties: marketData.comparables,
      value_factors: {
        positive: analysis.positive_factors,
        negative: analysis.negative_factors
      },
      market_trend: marketData.trend
    };
  } catch (error) {
    throw new Error(`Estimate failed: ${error.message}`);
  }
}

// Tadilat Maliyet Tahmini
async function processRenovation(imageBuffer) {
  try {
    // Odayı analiz et
    const roomAnalysis = await fal.subscribe('fal-ai/room-analyzer', {
      input: {
        image: imageBuffer.toString('base64'),
        detect_issues: true,
        measure_dimensions: true
      }
    });

    // Tadilat gereken alanları tespit et
    const issues = detectRenovationNeeds(roomAnalysis);

    // Maliyet hesaplama
    const costEstimate = calculateRenovationCost({
      room_size: roomAnalysis.estimated_area,
      issues: issues,
      quality_level: 'medium' // low, medium, high
    });

    return {
      total_cost: costEstimate.total,
      breakdown: costEstimate.items,
      timeline: costEstimate.estimated_days,
      priority_items: costEstimate.priorities,
      room_dimensions: roomAnalysis.dimensions,
      detected_issues: issues
    };
  } catch (error) {
    throw new Error(`Renovation estimate failed: ${error.message}`);
  }
}

// Yardımcı Fonksiyonlar
async function optimizeImage(buffer) {
  return sharp(buffer)
    .resize(1920, 1080, { fit: 'inside' })
    .jpeg({ quality: 90 })
    .toBuffer();
}

function generateCacheKey(image, mode, style) {
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(image).digest('hex');
  return `evim-ai:${mode}:${style}:${hash}`;
}

async function checkUserCredits(userId) {
  // Demo mode - always return true (bypass credit check)
  // In production, use real Redis:
  // const credits = await redis.get(`user:${userId}:credits`);
  // return credits && parseInt(credits) > 0;
  return true; // Allow all requests in demo mode
}

async function decrementUserCredits(userId) {
  await redis.decr(`user:${userId}:credits`);
}

async function analyzePropertyImage(imageBuffer) {
  // Computer vision ile oda analizi
  const visionAPI = await axios.post('https://vision.googleapis.com/v1/images:annotate', {
    requests: [{
      image: { content: imageBuffer.toString('base64') },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
        { type: 'IMAGE_PROPERTIES' }
      ]
    }]
  });

  return {
    features: extractRoomFeatures(visionAPI.data),
    quality: calculateQualityScore(visionAPI.data),
    location: estimateLocation(visionAPI.data)
  };
}

function extractRoomFeatures(visionData) {
  const features = {
    room_type: null,
    furniture_count: 0,
    luxury_indicators: [],
    condition: 'good',
    natural_light: false,
    ceiling_height: 'standard',
    flooring_type: 'unknown'
  };

  // Vision API sonuçlarından özellik çıkarımı
  visionData.responses[0].labelAnnotations.forEach(label => {
    if (label.description.includes('room')) {
      features.room_type = label.description;
    }
    if (label.description.includes('luxury') || label.description.includes('premium')) {
      features.luxury_indicators.push(label.description);
    }
  });

  return features;
}

// Eksik yardımcı fonksiyonlar
function analyzeColorHarmony(colors) {
  // Renk harmonisi analizi (basitleştirilmiş)
  if (!colors || !colors.colors) return 0.5;

  const colorCount = colors.colors.length;
  if (colorCount <= 3) return 0.8; // Az renk = uyumlu
  if (colorCount <= 5) return 0.6; // Orta
  return 0.3; // Çok renk = karmaşık
}

function calculateBrightness(colors) {
  // Görüntü parlaklığı hesaplama
  if (!colors || !colors.colors) return 0.7;

  let totalBrightness = 0;
  colors.colors.forEach(color => {
    const rgb = color.color;
    const brightness = (rgb.red + rgb.green + rgb.blue) / (3 * 255);
    totalBrightness += brightness * color.score;
  });

  return totalBrightness;
}

function estimateLocation(data) {
  // Konum tahmini (basitleştirilmiş)
  return 'Istanbul'; // Varsayılan
}

function calculateAverage(properties) {
  // Ortalama fiyat hesaplama
  if (!properties || properties.length === 0) return 25000;

  const total = properties.reduce((sum, prop) => sum + (prop.price || 25000), 0);
  return total / properties.length;
}

function analyzeTrend(historical) {
  // Trend analizi (basitleştirilmiş)
  if (!historical || historical.length === 0) return 'stable';

  const recent = historical.slice(-3);
  const older = historical.slice(-6, -3);

  if (recent.length === 0 || older.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, h) => sum + h.price, 0) / recent.length;
  const olderAvg = older.reduce((sum, h) => sum + h.price, 0) / older.length;

  if (recentAvg > olderAvg * 1.05) return 'rising';
  if (recentAvg < olderAvg * 0.95) return 'falling';
  return 'stable';
}

function sendNotification(userId, notification) {
  // Push notification gönderme (mock)
  console.log(`📱 Notification to user ${userId}:`, notification);
  // Gerçek implementasyonda FCM/APNS kullanılacak
}

function handleRenewal(data) {
  // Abonelik yenileme
  console.log('🔄 Subscription renewed:', data.customer_user_id);
  // Premium süreyi uzat, bonus krediler ver
}

function handleCancellation(data) {
  // Abonelik iptali
  console.log('❌ Subscription cancelled:', data.customer_user_id);
  // Premium durumunu kaldır
}

function calculateQualityScore(visionData) {
  let score = 50; // Base score

  // Renk harmonisi
  const dominantColors = visionData.responses[0].imagePropertiesAnnotation?.dominantColors;
  if (dominantColors) {
    score += analyzeColorHarmony(dominantColors) * 10;
  }

  // Işık kalitesi
  const brightness = calculateBrightness(dominantColors);
  score += brightness > 0.6 ? 10 : -5;

  return Math.min(100, Math.max(0, score));
}

async function fetchMarketData(location) {
  // Emlak API'lerinden veri çekme (örnek)
  try {
    const response = await axios.get(`https://api.emlakjet.com/properties`, {
      params: {
        location: location,
        radius: 1000,
        limit: 20
      }
    });

    return {
      average_price: calculateAverage(response.data.properties),
      comparables: response.data.properties.slice(0, 5),
      trend: analyzeTrend(response.data.historical)
    };
  } catch (error) {
    // Fallback değerler
    return {
      average_price: 25000, // TL/m²
      comparables: [],
      trend: 'stable'
    };
  }
}

function calculatePropertyValue(data) {
  const basePrice = data.market_data.average_price || 25000;
  let adjustedPrice = basePrice;

  // Kalite ayarlaması
  adjustedPrice *= (1 + (data.quality_score - 50) / 100);

  // Özellik ayarlamaları
  data.room_features.luxury_indicators.forEach(() => {
    adjustedPrice *= 1.05;
  });

  // Tahmin güvenilirliği
  const confidence = data.market_data.comparables.length > 10 ? 0.85 : 0.65;

  return {
    value: Math.round(adjustedPrice * 100), // 100m² varsayım
    pricePerSqm: Math.round(adjustedPrice),
    confidence: confidence
  };
}

function detectRenovationNeeds(analysis) {
  const issues = [];

  // Duvar durumu
  if (analysis.wall_condition < 0.7) {
    issues.push({
      type: 'painting',
      severity: 'medium',
      cost_estimate: 15000
    });
  }

  // Zemin durumu
  if (analysis.floor_condition < 0.6) {
    issues.push({
      type: 'flooring',
      severity: 'high',
      cost_estimate: 35000
    });
  }

  return issues;
}

function calculateRenovationCost(data) {
  let total = 0;
  const items = [];

  // Temel tadilat kalemleri
  const baseItems = {
    painting: data.room_size * 150, // TL/m²
    flooring: data.room_size * 350,
    electrical: 5000,
    plumbing: 8000
  };

  data.issues.forEach(issue => {
    items.push({
      name: issue.type,
      cost: issue.cost_estimate,
      priority: issue.severity
    });
    total += issue.cost_estimate;
  });

  return {
    total: total,
    items: items,
    estimated_days: Math.ceil(total / 10000) * 2,
    priorities: items.filter(i => i.priority === 'high')
  };
}

// Webhook endpoint for Adapty
app.post('/webhooks/adapty', async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'subscription.started':
      await handleNewSubscription(event.data);
      break;
    case 'subscription.renewed':
      await handleRenewal(event.data);
      break;
    case 'subscription.cancelled':
      await handleCancellation(event.data);
      break;
  }

  res.status(200).send('OK');
});

// Premium özellikleri aktifleştir
async function handleNewSubscription(data) {
  const userId = data.customer_user_id;

  // Redis'te premium flag'i set et
  await redis.set(`user:${userId}:premium`, '1');

  // Bonus krediler ver
  await redis.incrby(`user:${userId}:credits`, 100);

  // Push notification gönder
  sendNotification(userId, {
    title: '🎉 Premium\'a Hoş Geldiniz!',
    body: '100 bonus kredi hesabınıza tanımlandı'
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Server başlat - Listen on ALL interfaces (0.0.0.0)
const PORT = process.env.PORT || 8082;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`EvimAI Backend running on 0.0.0.0:${PORT} (accessible from all IPs)`);
});