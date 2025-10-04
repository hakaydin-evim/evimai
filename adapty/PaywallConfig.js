import Adapty from 'react-native-adapty';

// Paywall Ürün Yapısı
const PRODUCTS = {
  free: {
    name: "Ücretsiz Plan",
    features: {
      dailyCredits: 3,
      watermark: true,
      basicFilters: true,
      hdExport: false,
      priorityProcessing: false,
      commercialUse: false
    }
  },

  starter: {
    productId: "adapty.1month_sub",
    name: "Premium Aylık",
    price: "99.99 TL/ay",
    features: {
      dailyCredits: 20,
      watermark: false,
      allFilters: true,
      hdExport: true,
      priorityProcessing: false,
      commercialUse: false
    }
  },

  professional: {
    productId: "adapty.1year_sub",
    name: "Premium Yıllık",
    price: "999.99 TL/yıl",
    features: {
      dailyCredits: 100,
      watermark: false,
      allFilters: true,
      hdExport: true,
      priorityProcessing: true,
      commercialUse: true,
      apiAccess: true,
      teamFeatures: true
    }
  },

  lifetime: {
    productId: "evim_ai_lifetime",
    name: "Ömür Boyu",
    price: "2999.99 TL",
    originalPrice: "5999.99 TL",
    features: {
      unlimitedCredits: true,
      allFeatures: true,
      earlyAccess: true,
      vipSupport: true
    }
  }
};

// Paywall Tetikleyicileri
const PAYWALL_TRIGGERS = {
  onboarding: {
    timing: "after_first_success",
    discount: 50,
    message: "İlk kullanıcı indirimi! 24 saat geçerli"
  },

  creditExhausted: {
    timing: "no_credits_left",
    message: "Günlük krediniz bitti. Premium'a geçin, sınırsız tasarım yapın!"
  },

  downloadAttempt: {
    timing: "free_user_download",
    message: "HD indirme için Premium üyelik gerekiyor"
  },

  weeklySpecial: {
    timing: "every_friday",
    discount: 30,
    message: "Hafta Sonu Özel! %30 indirim"
  }
};

// Adapty Initialization
export const initializeAdapty = async () => {
  try {
    await Adapty.activate('public_live_klbC1jyp.nGWPMOKr5TImTmpHhmh1');

    // Kullanıcı özelliklerini ayarla
    await Adapty.updateProfile({
      customAttributes: {
        user_type: 'individual',
        app_version: '1.0.0',
        onboarding_completed: true
      }
    });

    // Paywall'u yükle
    const paywall = await Adapty.getPaywall('main_paywall');
    const products = await Adapty.getPaywallProducts(paywall);

    return { paywall, products };
  } catch (error) {
    console.error('Adapty initialization error:', error);
  }
};

// Satın Alma İşlemi
export const makePurchase = async (product) => {
  try {
    const profile = await Adapty.makePurchase(product);

    if (profile.accessLevels?.premium?.isActive) {
      // Premium özellikleri aktifleştir
      await activatePremiumFeatures();
      return { success: true, profile };
    }

    return { success: false };
  } catch (error) {
    if (error.code === 'USER_CANCELLED') {
      console.log('User cancelled purchase');
    }
    return { success: false, error };
  }
};

// A/B Test Paywall Varyasyonları
export const getPaywallVariation = async () => {
  const variations = {
    A: {
      layout: "vertical_cards",
      highlightedPlan: "professional",
      showTestimonials: true,
      urgencyMessage: "Son 3 gün %50 indirim!"
    },

    B: {
      layout: "horizontal_scroll",
      highlightedPlan: "starter",
      showComparison: true,
      socialProof: "10.000+ emlakçı kullanıyor"
    },

    C: {
      layout: "single_plan_focus",
      highlightedPlan: "lifetime",
      showSavings: true,
      trustBadges: ["SSL", "256-bit", "KVKK"]
    }
  };

  // Adapty'den A/B test grubunu al
  const testGroup = await Adapty.getABTestGroup();
  return variations[testGroup] || variations.A;
};

// Referral Sistemi
export const referralSystem = {
  generateCode: async (userId) => {
    const code = `EVIM${userId.slice(-6).toUpperCase()}`;
    await Adapty.updateProfile({
      customAttributes: {
        referral_code: code,
        referral_count: 0
      }
    });
    return code;
  },

  applyReferralCode: async (code) => {
    // Referans kodunu kullanan kişiye 5 ekstra kredi
    // Kod sahibine 10 kredi
    const rewards = {
      referrer: 10,
      referred: 5
    };

    await Adapty.updateProfile({
      customAttributes: {
        used_referral_code: code,
        bonus_credits: rewards.referred
      }
    });

    return rewards;
  }
};

// Analytics Events
export const trackPaywallEvents = {
  viewed: async (source) => {
    await Adapty.logShowPaywall(paywall);
    await analytics.track('paywall_viewed', {
      source,
      timestamp: Date.now()
    });
  },

  closed: async (purchaseMade) => {
    await analytics.track('paywall_closed', {
      purchase_made: purchaseMade,
      time_spent: calculateTimeSpent()
    });
  },

  planSelected: async (plan) => {
    await analytics.track('plan_selected', {
      plan_name: plan,
      price: PRODUCTS[plan].price
    });
  }
};

// Eksport edilen objeler
export { PRODUCTS, PAYWALL_TRIGGERS };