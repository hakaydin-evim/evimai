// DIRECT FAL AI - NO BACKEND NEEDED!
export const FAL_API_KEY = '6c087f70-2ddb-4455-bbb3-81486437f3a2:95a63ad77ec290a67dfeec023712e7c4';

export async function processWithFAL(imageBase64, mode) {
  console.log(`🚀 Direct FAL AI call - Mode: ${mode}`);

  const endpoint = 'https://fal.run/fal-ai/flux-pro/v1.1-ultra';

  let prompt = '';
  switch(mode) {
    case 'staging':
      prompt = "professional interior design, modern furnished living room, contemporary furniture, warm ambient lighting, photorealistic, 8k";
      break;
    case 'redesign':
      prompt = "modern minimalist interior design, scandinavian style, elegant furniture, natural lighting, clean aesthetics, photorealistic";
      break;
    case 'renovation':
      prompt = "renovated modern interior, fresh paint, new flooring, updated lighting, professional renovation, photorealistic";
      break;
    case 'estimate':
      prompt = "professional real estate photography, bright interior, clean modern design, high-end finishes";
      break;
    default:
      prompt = "beautiful interior room design, professional photography, modern style";
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        image_url: imageBase64,
        seed: Math.floor(Math.random() * 100000),
        guidance_scale: 3.5,
        num_inference_steps: 28,
        output_format: 'jpeg',
        safety_tolerance: 2
      })
    });

    if (!response.ok) {
      throw new Error(`FAL API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ FAL Response:', data);

    return {
      success: true,
      generated_image: data.images?.[0]?.url || data.image?.url,
      mode: mode,
      prompt: prompt
    };

  } catch (error) {
    console.error('❌ FAL Error:', error);
    throw error;
  }
}
