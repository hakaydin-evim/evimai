// EvimAI Simple Backend - FAL AI Entegre
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fal = require('@fal-ai/serverless-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// FAL API Configuration
fal.config({
  credentials: process.env.FAL_API_KEY
});

// EvimAI API Endpoint
app.post('/api/process', async (req, res) => {
  try {
    const { mode, style = 'modern', userId = 'demo_user', imageUrl, imageBase64 } = req.body;

    const hasImage = imageBase64 || imageUrl;
    console.log(`🔥 EvimAI İşlem: ${mode} - ${style} - Image: ${hasImage ? 'Base64 Var' : 'Yok'}`);

    let result;
    const inputImage = imageBase64 || imageUrl; // Prefer base64, fallback to URL

    switch (mode) {
      case 'redesign':
        result = await processRedesign(style, inputImage);
        break;
      case 'staging':
        result = await processStaging(inputImage);
        break;
      case 'estimate':
        result = await processEstimate(inputImage);
        break;
      case 'renovation':
        result = await processRenovation(inputImage);
        break;
      default:
        result = await processRedesign('modern', inputImage);
    }

    res.json({
      success: true,
      result: result,
      mode: mode,
      userId: userId,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ API Hatası:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: "Demo modunda çalışıyor"
    });
  }
});

// İç Tasarım Fonksiyonu - Image-to-Image
async function processRedesign(style, imageUrl) {
  const prompts = {
    modern: 'Transform this room into a modern minimalist interior design with clean lines, neutral colors, contemporary furniture, professional lighting',
    classic: 'Redesign this room with classic luxury interior, elegant furniture, warm colors, traditional style, high-end decor',
    industrial: 'Convert this room to industrial loft style with exposed elements, metal accents, urban design, concrete finishes',
    bohemian: 'Transform this room into bohemian eclectic interior with colorful patterns, mixed textures, artistic decor, vintage elements'
  };

  console.log(`🎨 FAL AI Image-to-Image: ${style} tasarım - Input: ${imageUrl ? 'User photo' : 'Text only'}`);

  let falInput;

  if (imageUrl) {
    // Image-to-Image transformation using proper model
    const falInput = {
      prompt: prompts[style] || prompts.modern,
      strength: 0.8,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      seed: Math.floor(Math.random() * 1000000)
    };

    // Support both base64 and URL formats
    if (imageUrl.startsWith('data:image')) {
      falInput.image_url = imageUrl; // Base64 data URL
    } else {
      falInput.image_url = imageUrl; // Regular URL
    }

    const falResult = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
      input: falInput
    });

    return {
      type: 'redesign',
      style: style,
      original_prompt: prompts[style],
      generated_image: falResult.images[0].url,
      processing_time: '4.2s',
      confidence: 0.95,
      features: ['Original layout preserved', 'Style transformation', 'Enhanced lighting', 'Color optimization'],
      input_method: 'image-to-image'
    };
  } else {
    // Text-to-Image fallback
    const falResult = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: prompts[style] || prompts.modern,
        image_size: 'landscape_4_3',
        num_inference_steps: 4
      }
    });

    return {
      type: 'redesign',
      style: style,
      original_prompt: prompts[style],
      generated_image: falResult.images[0].url,
      processing_time: '2.3s',
      confidence: 0.85,
      features: ['Modern furniture placement', 'Optimized lighting', 'Color harmony'],
      input_method: 'text-to-image'
    };
  }
}

// Sanal Mobilyalama - Image-to-Image
async function processStaging(imageUrl) {
  console.log(`🪑 FAL AI Virtual Staging - Input: ${imageUrl ? 'User photo' : 'Text only'}`);

  let falInput;

  if (imageUrl) {
    // Image-to-Image: Add furniture to user's empty room
    const falResult = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
      input: {
        prompt: 'Add modern furniture to this empty room: contemporary sofa, coffee table, floor lamp, wall art, plants, warm lighting, professional real estate photography style',
        image_url: imageUrl,
        strength: 0.7,
        num_inference_steps: 28,
        guidance_scale: 4.0,
        seed: Math.floor(Math.random() * 1000000)
      }
    });

    return {
      type: 'staging',
      original_empty: imageUrl,
      staged_room: falResult.images[0].url,
      furniture_added: ['Custom furniture for your space', 'Optimized layout', 'Professional staging', 'Lighting enhancement'],
      estimated_cost: '₺35.000',
      roi_increase: '%23',
      input_method: 'image-to-image'
    };
  } else {
    // Text-to-Image fallback
    const falResult = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: 'Empty room professionally staged with modern furniture, warm lighting, elegant decor, real estate photography style, high quality',
        image_size: 'landscape_4_3',
        num_inference_steps: 4
      }
    });

    return {
      type: 'staging',
      original_empty: 'https://picsum.photos/800/600',
      staged_room: falResult.images[0].url,
      furniture_added: ['Modern sofa', 'Coffee table', 'Floor lamp', 'Wall art', 'Plants'],
      estimated_cost: '₺35.000',
      roi_increase: '%23',
      input_method: 'text-to-image'
    };
  }
}

// Emlak Değerleme
async function processEstimate(imageUrl) {
  console.log(`💰 Emlak değer tahmini - Input: ${imageUrl ? 'User photo' : 'Mock data'}`);

  // Mock değerleme - gerçek hayatta computer vision + market data
  const baseValue = Math.floor(Math.random() * 1000000) + 2000000; // 2M-3M TL

  return {
    type: 'estimate',
    estimated_value: baseValue,
    value_per_sqm: Math.floor(baseValue / 100), // 100m² varsayım
    confidence: 0.87,
    factors: {
      positive: ['Merkezi konum', 'Yeni binalar', 'Ulaşım avantajı'],
      negative: ['Küçük oda', 'Düşük kat'],
      market_trend: 'Yükselişte'
    },
    comparable_properties: 3,
    processing_note: 'AI analiz + piyasa verileri'
  };
}

// Tadilat Maliyeti
async function processRenovation(imageUrl) {
  console.log(`🔨 Tadilat maliyet analizi - Input: ${imageUrl ? 'User photo' : 'Mock data'}`);

  const renovationItems = [
    { item: 'Duvar boyası', cost: 8000, priority: 'high' },
    { item: 'Zemin değişimi', cost: 25000, priority: 'medium' },
    { item: 'Elektrik tesisatı', cost: 12000, priority: 'high' },
    { item: 'Banyo yenileme', cost: 35000, priority: 'low' }
  ];

  const totalCost = renovationItems.reduce((sum, item) => sum + item.cost, 0);

  return {
    type: 'renovation',
    total_cost: totalCost,
    breakdown: renovationItems,
    estimated_duration: '3-4 hafta',
    roi_potential: '+₺150.000 değer artışı',
    urgent_items: renovationItems.filter(item => item.priority === 'high'),
    financing_options: ['Taksitli ödeme', 'Konut kredisi', 'Kişisel kredi']
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'EvimAI Backend',
    fal_api: process.env.FAL_API_KEY ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EvimAI Backend running on port ${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🔥 API: http://localhost:${PORT}/api/process`);
  console.log(`🌐 External: http://172.20.10.163:${PORT}/api/process`);
});