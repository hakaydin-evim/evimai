// EvimAI - Ana Uygulama Kodu
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adapty } from 'react-native-adapty';

const { width, height } = Dimensions.get('window');

// Adapty SDK Aktivasyonu
adapty.activate('public_live_klbC1jyp.nGWPMOKr5TImTmpHhmh1');

// Onboarding Flow Component
export const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = new Animated.Value(0);

  const steps = [
    {
      title: "Evinizi Yeniden Tasarlayın",
      description: "Yapay zeka ile saniyeler içinde profesyonel iç tasarım",
      icon: "🏠",
      color: '#6C63FF'
    },
    {
      title: "Boş Odayı Mobilyalayın",
      description: "Potansiyel alıcılara evinizi mobilyalı gösterin",
      icon: "🪑",
      color: '#FF6B6B'
    },
    {
      title: "Anında Değerleme",
      description: "Fotoğraftan emlak değeri ve tadilat maliyeti tahmini",
      icon: "💰",
      color: '#4ECDC4'
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: steps[currentStep].color }]}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1, justifyContent: 'center' }}>
        <Text style={styles.onboardingIcon}>{steps[currentStep].icon}</Text>
        <Text style={styles.onboardingTitle}>{steps[currentStep].title}</Text>
        <Text style={styles.onboardingDesc}>{steps[currentStep].description}</Text>

        <View style={styles.pagination}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentStep && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Başla' : 'İleri'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Ana Kamera Ekranı
export const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [credits, setCredits] = useState(3);
  const [selectedMode, setSelectedMode] = useState('redesign');

  const modes = [
    { id: 'redesign', name: 'Yeniden Tasarla', icon: '🎨' },
    { id: 'staging', name: 'Mobilyala', icon: '🛋️' },
    { id: 'estimate', name: 'Değer Tahmin', icon: '💰' },
    { id: 'renovation', name: 'Tadilat', icon: '🔨' }
  ];

  const takePhoto = async () => {
    if (credits <= 0) {
      // Paywall göster
      navigation.navigate('Paywall');
      return;
    }

    try {
      const image = await ImagePicker.openCamera({
        width: 1920,
        height: 1080,
        cropping: true,
        mediaType: 'photo'
      });

      processImage(image.path);
    } catch (error) {
      console.log('Camera error:', error);
    }
  };

  const selectFromGallery = async () => {
    if (credits <= 0) {
      navigation.navigate('Paywall');
      return;
    }

    try {
      const image = await ImagePicker.openPicker({
        width: 1920,
        height: 1080,
        cropping: true,
        mediaType: 'photo'
      });

      processImage(image.path);
    } catch (error) {
      console.log('Gallery error:', error);
    }
  };

  const processImage = (imagePath) => {
    navigation.navigate('Processing', {
      image: imagePath,
      mode: selectedMode
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.creditsText}>💎 {credits} Kredi</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeSelector}>
        {modes.map(mode => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeButton,
              selectedMode === mode.id && styles.modeButtonActive
            ]}
            onPress={() => setSelectedMode(mode.id)}
          >
            <Text style={styles.modeIcon}>{mode.icon}</Text>
            <Text style={styles.modeName}>{mode.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Camera Preview Area */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPreview}>
          <Text style={styles.cameraHint}>
            Odanızın fotoğrafını çekin veya galeriden seçin
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.galleryButton} onPress={selectFromGallery}>
          <Text style={styles.buttonIcon}>🖼️</Text>
          <Text style={styles.buttonText}>Galeri</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate('History')}>
          <Text style={styles.buttonIcon}>📁</Text>
          <Text style={styles.buttonText}>Geçmiş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// AI İşleme Ekranı
export const ProcessingScreen = ({ route, navigation }) => {
  const { image, mode } = route.params;
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    processWithAI();
  }, []);

  const processWithAI = async () => {
    // Progress animasyonu
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false
    }).start();

    try {
      // FAL API çağrısı
      const response = await fetch('http://localhost:3000/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: image,
          mode: mode,
          userId: 'user123'
        })
      });

      const data = await response.json();
      setResult(data.result);

      // Sonuç ekranına git
      navigation.navigate('Result', {
        original: image,
        processed: data.result,
        mode: mode
      });
    } catch (error) {
      console.error('Processing error:', error);
    }
  };

  const processingMessages = [
    "Oda analiz ediliyor...",
    "AI modeli çalıştırılıyor...",
    "Tasarım oluşturuluyor...",
    "Son rötuşlar yapılıyor..."
  ];

  return (
    <View style={styles.processingContainer}>
      <View style={styles.processingContent}>
        <ActivityIndicator size="large" color="#6C63FF" />

        <Text style={styles.processingTitle}>
          {processingMessages[Math.floor(progress / 25)]}
        </Text>

        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>

        <Text style={styles.processingTip}>
          💡 İpucu: Premium üyelikle işlemler 3x daha hızlı!
        </Text>
      </View>
    </View>
  );
};

// Sonuç Ekranı (Before/After)
export const ResultScreen = ({ route, navigation }) => {
  const { original, processed, mode } = route.params;
  const [showBefore, setShowBefore] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const downloadImage = async () => {
    if (!isPremium) {
      navigation.navigate('Paywall', {
        trigger: 'download_attempt',
        returnTo: 'Result'
      });
      return;
    }

    // HD indirme işlemi
    console.log('Downloading HD image...');
  };

  const shareImage = () => {
    // Watermark'lı paylaşım (ücretsiz kullanıcılar için)
    console.log('Sharing image with watermark...');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Before/After Viewer */}
      <View style={styles.resultViewer}>
        <Image
          source={{ uri: showBefore ? original : processed }}
          style={styles.resultImage}
        />

        {!isPremium && (
          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>EvimAI</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.toggleButton}
          onPressIn={() => setShowBefore(true)}
          onPressOut={() => setShowBefore(false)}
        >
          <Text style={styles.toggleText}>
            {showBefore ? 'ÖNCESİ' : 'SONRASI'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Insights */}
      {mode === 'estimate' && (
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>📊 AI Analizi</Text>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Tahmini Değer:</Text>
            <Text style={styles.insightValue}>₺2.850.000</Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>m² Fiyatı:</Text>
            <Text style={styles.insightValue}>₺28.500</Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Bölge Ortalaması:</Text>
            <Text style={styles.insightValue}>₺26.200</Text>
          </View>
        </View>
      )}

      {mode === 'renovation' && (
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>🔨 Tadilat Tahmini</Text>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Boya/Badana:</Text>
            <Text style={styles.insightValue}>₺15.000</Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Zemin Kaplama:</Text>
            <Text style={styles.insightValue}>₺35.000</Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Toplam Tahmin:</Text>
            <Text style={styles.insightValue}>₺78.500</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.resultActions}>
        <TouchableOpacity style={styles.downloadButton} onPress={downloadImage}>
          <Text style={styles.downloadIcon}>⬇️</Text>
          <Text style={styles.downloadText}>HD İndir</Text>
          {!isPremium && <Text style={styles.premiumBadge}>PRO</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={shareImage}>
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareText}>Paylaş</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.newIcon}>➕</Text>
          <Text style={styles.newText}>Yeni</Text>
        </TouchableOpacity>
      </View>

      {/* Upsell Banner */}
      {!isPremium && (
        <TouchableOpacity
          style={styles.upsellBanner}
          onPress={() => navigation.navigate('Paywall')}
        >
          <Text style={styles.upsellTitle}>🎉 Premium'a Geç</Text>
          <Text style={styles.upsellDesc}>
            Sınırsız tasarım, watermark yok, HD indirme
          </Text>
          <View style={styles.upsellPrice}>
            <Text style={styles.upsellOldPrice}>₺299</Text>
            <Text style={styles.upsellNewPrice}>₺99/ay</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10
  },
  creditsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  profileIcon: {
    fontSize: 24
  },
  modeSelector: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100
  },
  modeButton: {
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    minWidth: 80
  },
  modeButtonActive: {
    backgroundColor: '#6C63FF'
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: 5
  },
  modeName: {
    fontSize: 12,
    color: '#666'
  },
  cameraContainer: {
    flex: 1,
    padding: 20
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraHint: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF'
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF'
  },
  galleryButton: {
    alignItems: 'center'
  },
  historyButton: {
    alignItems: 'center'
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 5
  },
  buttonText: {
    fontSize: 12,
    color: '#666'
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8'
  },
  processingContent: {
    alignItems: 'center',
    padding: 30
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20
  },
  progressBar: {
    width: 250,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: 20,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 3
  },
  processingTip: {
    fontSize: 14,
    color: '#666',
    marginTop: 30,
    textAlign: 'center'
  },
  resultViewer: {
    height: height * 0.5,
    position: 'relative'
  },
  resultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  watermark: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 10,
    borderRadius: 5
  },
  watermarkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF'
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  toggleText: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  insightsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 15
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  insightLabel: {
    fontSize: 14,
    color: '#666'
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25
  },
  downloadIcon: {
    fontSize: 18,
    marginRight: 5
  },
  downloadText: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    color: '#333',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 5
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25
  },
  shareIcon: {
    fontSize: 18,
    marginRight: 5
  },
  shareText: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25
  },
  newIcon: {
    fontSize: 18,
    marginRight: 5
  },
  newText: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  upsellBanner: {
    margin: 20,
    padding: 20,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 15,
    alignItems: 'center'
  },
  upsellTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5
  },
  upsellDesc: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 10
  },
  upsellPrice: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  upsellOldPrice: {
    fontSize: 16,
    color: '#FFF',
    textDecorationLine: 'line-through',
    opacity: 0.7,
    marginRight: 10
  },
  upsellNewPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700'
  },
  onboardingIcon: {
    fontSize: 120,
    alignSelf: 'center',
    marginBottom: 30,
    textAlign: 'center'
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10
  },
  onboardingDesc: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 40
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 5
  },
  paginationDotActive: {
    backgroundColor: '#FFF',
    width: 20
  },
  nextButton: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 30
  },
  nextButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    // AsyncStorage'dan ilk açılış kontrolü
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem('hasLaunched');
      if (value === null) {
        // İlk açılış
        setIsFirstLaunch(true);
        setShowOnboarding(true);
      } else {
        // Daha önce açılmış
        setIsFirstLaunch(false);
        setShowOnboarding(false);
      }
    } catch (error) {
      console.log('First launch check error:', error);
      setShowOnboarding(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.log('Onboarding complete error:', error);
      setShowOnboarding(false);
    }
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <CameraScreen />;
}