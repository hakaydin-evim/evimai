// FAL AI Test Script
require('dotenv').config();
const fal = require('@fal-ai/serverless-client');

// FAL API konfigürasyonu
fal.config({
  credentials: process.env.FAL_API_KEY
});

// Test fonksiyonu
async function testFalAPI() {
  try {
    console.log('🔥 FAL AI Test başlıyor...');
    console.log('API Key:', process.env.FAL_API_KEY ? 'Mevcut ✅' : 'Eksik ❌');

    // Basit image enhancement testi
    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: 'A beautiful modern living room interior design',
        image_size: 'landscape_4_3'
      }
    });

    console.log('✅ FAL AI Test Başarılı!');
    console.log('📊 Sonuç:', {
      original: result.image?.url || 'URL yok',
      enhanced: result.output || 'Output yok',
      processing_time: Date.now()
    });

    return result;
  } catch (error) {
    console.error('❌ FAL AI Test Hatası:', error.message);
    console.error('📋 Hata Detayları:', error);

    if (error.message.includes('401')) {
      console.log('🔑 API Key kontrolü yapın!');
    }

    return null;
  }
}

// Test çalıştır
testFalAPI();