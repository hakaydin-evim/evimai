// EvimAI - Expo Native App
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
  Image,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Adapty - Only works in native builds, not Expo Go
let adapty = null;
try {
  adapty = require('react-native-adapty').adapty;
} catch (e) {
  console.log('⚠️ Adapty not available in Expo Go - using mock for development');
  adapty = {
    activate: () => Promise.resolve(),
    getPaywall: () => Promise.resolve({ products: [] }),
    makePurchase: () => Promise.resolve({ accessLevels: {} })
  };
}
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { AdaptyPaywallDemo } from './adapty-demo';
import { CONFIG } from './config';
import { PaywallScreen } from './screens/PaywallScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { HistoryScreen } from './screens/HistoryScreen';

const { width, height } = Dimensions.get('window');

// Onboarding Flow Component
const OnboardingFlow = ({ onComplete }) => {
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
            {currentStep === steps.length - 1 ? 'Başla' : 'Devam'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      <StatusBar style="light" />
    </View>
  );
};

// Camera Screen Component
const CameraScreen = ({ navigation }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [processingHistory, setProcessingHistory] = useState([]);
  const [selectedMode, setSelectedMode] = useState('redesign');
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [credits, setCredits] = useState(CONFIG.FREE_CREDITS);

  const modes = [
    {
      id: 'redesign',
      name: 'Yeniden Tasarla',
      icon: '🎨',
      color: '#6C63FF',
      description: 'AI ile modern tasarım',
      subtitle: 'İç mimari'
    },
    {
      id: 'staging',
      name: 'Mobilyala',
      icon: '🪑',
      color: '#FF6B6B',
      description: 'Boş odayı doldur',
      subtitle: 'Sanal mobilya'
    },
    {
      id: 'estimate',
      name: 'Değerle',
      icon: '💰',
      color: '#4ECDC4',
      description: 'Emlak değer analizi',
      subtitle: 'Piyasa fiyatı'
    },
    {
      id: 'renovation',
      name: 'Tadilat',
      icon: '🔨',
      color: '#FFA726',
      description: 'Yenileme maliyeti',
      subtitle: 'Bütçe planlama'
    }
  ];

  const pickImage = async () => {
    try {
      console.log('📸 Requesting gallery permission...');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Hata", "Galeri erişim izni gerekli!");
        return;
      }

      console.log('📸 Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', // New Expo syntax (string instead of enum)
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduce quality to make smaller file
      });

      console.log('📸 Image picker result:', result);

      if (!result.canceled) {
        console.log('📸 Image selected:', result.assets[0].uri);
        processImage(result.assets[0].uri);
      } else {
        console.log('📸 User cancelled image selection');
      }
    } catch (error) {
      console.error('❌ Image picker error:', error);
      Alert.alert("Hata", `Görsel seçilemedi: ${error.message}`);
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Hata", "Kamera erişim izni gerekli!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduce quality to make smaller file
      });

      if (!result.canceled) {
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Hata", "Fotoğraf çekilemedi");
    }
  };

  const processImage = async (imageUri) => {
    setIsProcessing(true);

    try {
      console.log(`🔥 EvimAI Real AI Mode: ${selectedMode}`);

      // Convert image to base64 for FAL AI compatibility
      let imageBase64 = null;
      if (imageUri) {
        try {
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
          });
          imageBase64 = `data:image/jpeg;base64,${base64}`;
          console.log(`📷 Image converted to base64: ${imageBase64.length} characters`);
        } catch (error) {
          console.warn('⚠️ Base64 conversion failed:', error.message);
        }
      }

      // Real API call to backend with base64 image (with timeout)
      const apiUrl = `${CONFIG.API_BASE_URL}/api/process`;
      console.log(`📡 Calling backend API: ${apiUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after 15s');
        controller.abort();
      }, 15000); // 15 second timeout

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: selectedMode,
          style: 'modern',
          userId: 'mobile_user',
          imageBase64: imageBase64 // Send base64 encoded image
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);

      if (data.success && data.result) {
        const apiResult = data.result;

        const newResult = {
          id: Date.now(),
          timestamp: new Date(),
          original: imageUri,
          processed: apiResult.generated_image || apiResult.staged_room || imageUri,
          mode: selectedMode,
          confidence: apiResult.confidence || 0.9,
          features: apiResult.features || apiResult.furniture_added || ['AI Processing'],
          description: getResultDescription(selectedMode, apiResult),
          demo: false,
          apiData: apiResult
        };

        setResult(newResult);
        setProcessingHistory(prev => [newResult, ...prev]); // En yeni başta

        console.log('✅ EvimAI real AI processing completed:', selectedMode);
      } else {
        throw new Error('API returned no results');
      }

    } catch (error) {
      console.error('❌ Real AI Error:', error.message);
      Alert.alert("Hata", `AI işlemi başarısız: ${error.message}\n\nLütfen tekrar deneyin veya internet bağlantınızı kontrol edin.`);
      setIsProcessing(false);
    }
  };

  const getResultDescription = (mode, result) => {
    switch (mode) {
      case 'redesign':
        return `${result.style || 'Modern'} tasarım uygulandı`;
      case 'staging':
        return 'Oda profesyonel olarak mobilyalandı';
      case 'estimate':
        return `Tahmini değer: ₺${result.estimated_value || '2.850.000'}`;
      case 'renovation':
        return `Tadilat maliyeti: ₺${result.total_cost || '45.000'}`;
      default:
        return 'AI işlem tamamlandı';
    }
  };

  const openPaywall = () => {
    if (navigation?.navigate) {
      navigation.navigate('Paywall', { trigger: 'credits_depleted' });
    } else {
      setShowPaywall(true);
    }
  };

  const handlePurchase = (plan) => {
    setIsPremium(true);
    Alert.alert("🎉 Premium Aktif!", `${plan.title} üyeliğiniz başlatıldı!`);
  };

  const openFullscreen = (imageUri, title) => {
    setFullscreenImage({ uri: imageUri, title });
    setShowFullscreen(true);
  };

  const closeFullscreen = () => {
    setShowFullscreen(false);
    setFullscreenImage(null);
  };


  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.processingTitle}>AI İşliyor...</Text>
        <Text style={styles.processingDesc}>
          {selectedMode === 'redesign' && "Odanız yeniden tasarlanıyor..."}
          {selectedMode === 'staging' && "Oda mobilyalarla donatılıyor..."}
          {selectedMode === 'estimate' && "Emlak değeri hesaplanıyor..."}
          {selectedMode === 'renovation' && "Tadilat maliyeti analiz ediliyor..."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: 100}}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation?.navigate('History')} style={styles.iconButton}>
            <Text style={{ fontSize: 24 }}>📁</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>EvimAI</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={openPaywall} style={[styles.premiumButton, isPremium && styles.premiumActive]}>
            <Text style={styles.premiumText}>{isPremium ? '👑 Premium' : '💎 ' + credits}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation?.navigate('Profile')} style={styles.iconButton}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.modesSection}>
        <Text style={styles.modesSectionTitle}>AI Modları Seçin</Text>
        <ScrollView style={styles.modesContainer} horizontal showsHorizontalScrollIndicator={false}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeCard,
                selectedMode === mode.id && [
                  styles.selectedMode,
                  { borderColor: mode.color, backgroundColor: `${mode.color}15` }
                ]
              ]}
              onPress={() => setSelectedMode(mode.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.modeIconContainer,
                { backgroundColor: selectedMode === mode.id ? mode.color : `${mode.color}20` }
              ]}>
                <Text style={styles.modeIcon}>{mode.icon}</Text>
              </View>
              <Text style={[
                styles.modeName,
                { color: selectedMode === mode.id ? mode.color : '#333' }
              ]}>
                {mode.name}
              </Text>
              <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
              <Text style={styles.modeDescription}>{mode.description}</Text>
              {selectedMode === mode.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓ Seçili</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.cameraContainer}>
        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraText}>Fotoğraf Çek</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <Text style={styles.galleryIcon}>🖼️</Text>
          <Text style={styles.galleryText}>Galeri</Text>
        </TouchableOpacity>
      </View>

      {processingHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>
            🎨 AI İşlem Geçmişi ({processingHistory.length})
          </Text>
          <View style={styles.historyList}>
            {processingHistory.map((item, index) => (
              <View key={item.id} style={[styles.historyItem, index === 0 && styles.latestItem]}>
                {index === 0 && <Text style={styles.latestBadge}>✨ En Son</Text>}

                <View style={styles.historyHeader}>
                  <Text style={styles.historyMode}>
                    {modes.find(m => m.id === item.mode)?.icon} {modes.find(m => m.id === item.mode)?.name}
                  </Text>
                  <Text style={styles.historyTime}>
                    {item.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View style={styles.imageComparison}>
                  <View style={styles.imageSection}>
                    <Text style={styles.imageLabel}>Önce</Text>
                    <TouchableOpacity onPress={() => openFullscreen(item.original, 'Orijinal Fotoğraf')}>
                      {item.original ? (
                        <Image
                          source={{ uri: item.original }}
                          style={styles.comparisonImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.comparisonImage, styles.placeholderView]}>
                          <Text style={styles.placeholderEmoji}>📷</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.imageSection}>
                    <Text style={styles.imageLabel}>Sonra</Text>
                    <TouchableOpacity onPress={() => openFullscreen(item.processed, 'AI İşlenmiş Görsel')}>
                      {item.processed ? (
                        <Image
                          source={{ uri: item.processed }}
                          style={styles.comparisonImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.comparisonImage, styles.placeholderView]}>
                          <Text style={styles.placeholderEmoji}>🤖</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.resultDesc}>{item.description}</Text>
                <Text style={styles.confidenceText}>
                  Güven Skoru: %{Math.round(item.confidence * 100)}
                  {item.demo && " (Demo)"}
                </Text>

                <View style={styles.featuresContainer}>
                  {item.features.map((feature, idx) => (
                    <Text key={idx} style={styles.featureText}>• {feature}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <AdaptyPaywallDemo
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={handlePurchase}
      />

      {/* Fullscreen Image Modal */}
      <Modal
        visible={showFullscreen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity style={styles.fullscreenOverlay} onPress={closeFullscreen}>
            <View style={styles.fullscreenContent}>
              <Text style={styles.fullscreenTitle}>{fullscreenImage?.title}</Text>
              <Image
                source={{ uri: fullscreenImage?.uri }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.closeButton} onPress={closeFullscreen}>
                <Text style={styles.closeButtonText}>✕ Kapat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      <StatusBar style="dark" />
    </ScrollView>
  );
};

// Ana App Component
export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Camera');
  const [screenParams, setScreenParams] = useState({});

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem('hasLaunched');
      if (value !== null) {
        setShowOnboarding(false);
      }
    } catch (error) {
      console.log('First launch check error:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.log('Onboarding complete error:', error);
    }
  };

  // Simple navigation helper
  const navigate = (screenName, params = {}) => {
    setCurrentScreen(screenName);
    setScreenParams(params);
  };

  const goBack = () => {
    setCurrentScreen('Camera');
    setScreenParams({});
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Render current screen
  const renderScreen = () => {
    const navigationProps = {
      navigation: { navigate, goBack },
      route: { params: screenParams }
    };

    switch (currentScreen) {
      case 'Paywall':
        return <PaywallScreen {...navigationProps} onClose={goBack} />;
      case 'Profile':
        return <ProfileScreen {...navigationProps} />;
      case 'History':
        return <HistoryScreen {...navigationProps} />;
      case 'Camera':
      default:
        return <CameraScreen navigation={{ navigate, goBack }} />;
    }
  };

  return renderScreen();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  iconButton: {
    padding: 8,
  },
  premiumButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFD700',
    borderRadius: 20,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  premiumActive: {
    backgroundColor: '#00C851',
  },
  modesSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modesContainer: {
    paddingVertical: 10,
  },
  modeCard: {
    width: 140,
    height: 160,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  modeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedMode: {
    elevation: 8,
    shadowOpacity: 0.25,
    transform: [{ scale: 1.05 }],
  },
  modeIcon: {
    fontSize: 24,
    textAlign: 'center',
  },
  modeName: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
  },
  modeSubtitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    lineHeight: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00C851',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  selectedText: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cameraContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  cameraButton: {
    backgroundColor: '#6C63FF',
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cameraIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  cameraText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  galleryButton: {
    backgroundColor: '#FFF',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  galleryIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  galleryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  processingDesc: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  resultContainer: {
    margin: 20,
    padding: 25,
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#6C63FF',
    marginBottom: 40,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  resultDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  viewResultButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  viewResultText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  confidenceText: {
    fontSize: 14,
    color: '#00C851',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#555',
    marginVertical: 2,
  },
  imageComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  imageSection: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
  },
  comparisonImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  placeholderView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  placeholderEmoji: {
    fontSize: 40,
    color: '#999',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  placeholderText: {
    fontSize: 40,
    color: '#999',
    marginBottom: 5,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#777',
    fontWeight: 'bold',
  },
  imageDebugText: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#007AFF',
    color: '#FFF',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    fontWeight: 'bold',
    zIndex: 10,
  },
  // Onboarding Styles
  onboardingIcon: {
    fontSize: 120,
    alignSelf: 'center',
    marginBottom: 30,
    textAlign: 'center',
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  onboardingDesc: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
    opacity: 0.9,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 50,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#FFF',
    width: 20,
  },
  nextButton: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 30,
  },
  nextButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // History Styles
  historyContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  historyList: {
    // Removed maxHeight restriction - now fully scrollable
  },
  historyItem: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  latestItem: {
    borderColor: '#6C63FF',
    borderWidth: 2,
    backgroundColor: '#F8F7FF',
  },
  latestBadge: {
    position: 'absolute',
    top: -8,
    right: 15,
    backgroundColor: '#6C63FF',
    color: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
    zIndex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyMode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
  },
  // Fullscreen Image Styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContent: {
    width: '90%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '85%',
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});