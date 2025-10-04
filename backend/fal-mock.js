// FAL AI Mock Service - Demo için
class MockFalAPI {
  static async processImage(imageUrl, mode = 'enhancement') {
    // Gerçek işlem simülasyonu
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResults = {
      enhancement: {
        output: imageUrl, // Demo için aynı resim
        confidence: 0.92,
        processing_time: 1.8,
        features: ['High quality', 'Enhanced details', 'Better lighting']
      },
      interior_design: {
        output: imageUrl,
        style: 'modern',
        confidence: 0.89,
        changes: ['Color palette updated', 'Furniture rearranged', 'Lighting improved']
      },
      virtual_staging: {
        output: imageUrl,
        furniture_added: ['Sofa', 'Coffee table', 'Wall art', 'Floor lamp'],
        style: 'contemporary',
        confidence: 0.91
      },
      property_value: {
        estimated_value: Math.floor(Math.random() * 1000000) + 2000000, // 2M-3M TL
        confidence: 0.87,
        factors: ['Location', 'Size', 'Condition', 'Market trends']
      }
    };

    return mockResults[mode] || mockResults.enhancement;
  }

  static async subscribe(model, options) {
    console.log(`🎭 Mock FAL API çağrısı: ${model}`);

    const imageUrl = options.input.image_url || options.input.image;

    if (model.includes('real-esrgan')) {
      return this.processImage(imageUrl, 'enhancement');
    }
    if (model.includes('interior')) {
      return this.processImage(imageUrl, 'interior_design');
    }
    if (model.includes('staging')) {
      return this.processImage(imageUrl, 'virtual_staging');
    }

    return this.processImage(imageUrl);
  }
}

module.exports = MockFalAPI;