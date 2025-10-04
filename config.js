// EvimAI Configuration
// Tüm uygulama ayarları burada

export const CONFIG = {
  // Backend API URL - Yerel ağdaki IP adresinizi kullanın
  API_BASE_URL: 'http://192.168.18.10:8082',

  // Adapty SDK Key (Demo için mock kullanılıyor)
  ADAPTY_KEY: 'public_live_klbC1jyp.nGWPMOKr5TImTmpHhmh1',

  // Free tier settings
  FREE_CREDITS: 3,

  // Image processing settings
  IMAGE_QUALITY: 1,
  IMAGE_ASPECT_RATIO: [16, 9],

  // Subscription Plans (Adapty Placement ID'leri)
  SUBSCRIPTION_PLANS: {
    monthly: {
      id: 'premium_monthly',
      name: 'Premium Aylık',
      price: '₺99',
      period: '/ay',
      features: [
        'Sınırsız AI tasarım',
        'HD indirme',
        'Watermark yok',
        '3x hızlı işlem',
        'Öncelikli destek'
      ]
    },
    yearly: {
      id: 'premium_yearly',
      name: 'Premium Yıllık',
      price: '₺899',
      originalPrice: '₺1.188',
      period: '/yıl',
      discount: '%25 İNDİRİM',
      features: [
        'Sınırsız AI tasarım',
        'HD indirme',
        'Watermark yok',
        '3x hızlı işlem',
        'Öncelikli destek',
        'PDF rapor export'
      ]
    },
    professional: {
      id: 'pro_monthly',
      name: 'Profesyonel',
      price: '₺299',
      period: '/ay',
      badge: 'EMLAKÇILAR İÇİN',
      features: [
        'Tüm Premium özellikler',
        'API erişimi',
        'Toplu işlem',
        'Özel branding',
        'Analitik dashboard',
        '7/24 destek'
      ]
    }
  },

  // AI Processing Modes
  AI_MODES: {
    redesign: {
      id: 'redesign',
      name: 'Yeniden Tasarla',
      subtitle: 'AI ile iç dekorasyon',
      icon: '🎨',
      color: '#6C63FF',
      description: 'Odanızı farklı stillerde yeniden tasarlayın'
    },
    staging: {
      id: 'staging',
      name: 'Mobilyala',
      subtitle: 'Sanal mobilya ekle',
      icon: '🛋️',
      color: '#FF6B6B',
      description: 'Boş odayı profesyonelce mobilyalayın'
    },
    estimate: {
      id: 'estimate',
      name: 'Değer Tahmin',
      subtitle: 'Emlak değerleme',
      icon: '💰',
      color: '#4ECDC4',
      description: 'Fotoğraftan emlak değeri tahmin edin'
    },
    renovation: {
      id: 'renovation',
      name: 'Tadilat',
      subtitle: 'Maliyet tahmini',
      icon: '🔨',
      color: '#FFB84D',
      description: 'Tadilat maliyetlerini hesaplayın'
    }
  },

  // Referral System
  REFERRAL: {
    enabled: true,
    reward_credits: 10,
    share_text: 'EvimAI ile evinizi AI ile yeniden tasarlayın! İlk 3 tasarım ücretsiz 🏠✨\n\nHemen indir:',
    share_url: 'https://evimai.app/r/'
  },

  // Feature Flags
  FEATURES: {
    onboarding: true,
    social_share: true,
    pdf_export: false,
    referral_system: true,
    history: true,
    profile: true
  }
};

// Helper functions
export const getApiUrl = (endpoint) => {
  return `${CONFIG.API_BASE_URL}${endpoint}`;
};

export const getModeConfig = (modeId) => {
  return CONFIG.AI_MODES[modeId] || CONFIG.AI_MODES.redesign;
};

export const getPlanById = (planId) => {
  return Object.values(CONFIG.SUBSCRIPTION_PLANS).find(
    plan => plan.id === planId
  );
};
