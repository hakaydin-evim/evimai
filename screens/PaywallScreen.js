// EvimAI - Paywall Screen (Expo Compatible)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

export const PaywallScreen = ({ navigation, route, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [pulseAnim] = useState(new Animated.Value(1));

  const trigger = route?.params?.trigger || 'manual';

  useEffect(() => {
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const handlePurchase = async (planId) => {
    try {
      setPurchasing(true);

      // Demo mode - Premium'u aktifleştir
      await AsyncStorage.setItem('isPremium', 'true');
      await AsyncStorage.setItem('premiumPlan', planId);

      Alert.alert(
        '🎉 Demo Mode - Premium Aktif!',
        'Gerçek uygulamada Adapty satın alma işlemi burada çalışacak.',
        [
          {
            text: 'Harika!',
            onPress: () => {
              if (onClose) onClose();
              else if (navigation?.goBack) navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Purchase error:', error);
      Alert.alert('Hata', 'Satın alma işlemi başarısız oldu.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert('ℹ️ Demo Mode', 'Gerçek uygulamada satın alımlar geri yüklenecek.');
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'credits_depleted':
        return '💎 Ücretsiz kredileriniz bitti!';
      case 'download_attempt':
        return '⬇️ HD indirme premium özelliktir';
      case 'no_watermark':
        return '✨ Watermark\'sız tasarımlar için Premium\'a geçin';
      default:
        return '🚀 Premium\'a geçin, sınırsız tasarım yapın!';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => onClose ? onClose() : navigation?.goBack()}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.triggerMessage}>{getTriggerMessage()}</Text>
        <Text style={styles.title}>EvimAI Premium</Text>
        <Text style={styles.subtitle}>
          Profesyonel tasarımlar için sınırsız erişim
        </Text>
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {Object.entries(CONFIG.SUBSCRIPTION_PLANS).map(([key, plan]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.planCard,
              selectedPlan === key && styles.planCardSelected
            ]}
            onPress={() => setSelectedPlan(key)}
          >
            {plan.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{plan.discount}</Text>
              </View>
            )}

            {plan.badge && (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{plan.badge}</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                {plan.originalPrice && (
                  <Text style={styles.planOriginalPrice}>{plan.originalPrice}</Text>
                )}
                <View style={styles.planPriceContainer}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
              </View>

              <View style={[
                styles.radioButton,
                selectedPlan === key && styles.radioButtonSelected
              ]}>
                {selectedPlan === key && <View style={styles.radioButtonInner} />}
              </View>
            </View>

            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA Button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.ctaButton, purchasing && styles.ctaButtonDisabled]}
          onPress={() => handlePurchase(CONFIG.SUBSCRIPTION_PLANS[selectedPlan].id)}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.ctaButtonText}>
              {selectedPlan === 'yearly' ? 'Yıllık Planı Seç ve %25 Tasarruf Et' : 'Devam Et'}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Social Proof */}
      <View style={styles.socialProof}>
        <Text style={styles.socialProofText}>
          ⭐️ 4.8/5 · 10.000+ emlakçı kullanıyor
        </Text>
      </View>

      {/* Trust Badges */}
      <View style={styles.trustBadges}>
        <View style={styles.trustBadge}>
          <Text style={styles.trustIcon}>🔒</Text>
          <Text style={styles.trustText}>Güvenli Ödeme</Text>
        </View>
        <View style={styles.trustBadge}>
          <Text style={styles.trustIcon}>↩️</Text>
          <Text style={styles.trustText}>İstediğiniz Zaman İptal</Text>
        </View>
        <View style={styles.trustBadge}>
          <Text style={styles.trustIcon}>⚡</Text>
          <Text style={styles.trustText}>Anında Aktivasyon</Text>
        </View>
      </View>

      {/* Restore Button */}
      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
        <Text style={styles.restoreButtonText}>Satın Alımları Geri Yükle</Text>
      </TouchableOpacity>

      {/* Legal */}
      <View style={styles.legal}>
        <Text style={styles.legalText}>
          Abonelikler otomatik olarak yenilenir. İstediğiniz zaman iptal edebilirsiniz.
        </Text>
        <View style={styles.legalLinks}>
          <Text style={styles.legalLink}>Kullanım Şartları</Text>
          <Text style={styles.legalSeparator}> · </Text>
          <Text style={styles.legalLink}>Gizlilik Politikası</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  closeIcon: {
    fontSize: 20,
    color: '#666'
  },
  triggerMessage: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 10
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  planCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative'
  },
  planCardSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#F5F3FF'
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1
  },
  discountText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12
  },
  planBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333'
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  planOriginalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 5
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C63FF'
  },
  planPeriod: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioButtonSelected: {
    borderColor: '#6C63FF'
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6C63FF'
  },
  planFeatures: {
    marginTop: 10
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  featureIcon: {
    fontSize: 16,
    color: '#6C63FF',
    marginRight: 8,
    fontWeight: 'bold'
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  ctaButton: {
    backgroundColor: '#6C63FF',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  ctaButtonDisabled: {
    opacity: 0.6
  },
  ctaButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  socialProof: {
    alignItems: 'center',
    marginBottom: 20
  },
  socialProofText: {
    fontSize: 14,
    color: '#666'
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30
  },
  trustBadge: {
    alignItems: 'center',
    flex: 1
  },
  trustIcon: {
    fontSize: 24,
    marginBottom: 5
  },
  trustText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center'
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 20
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600'
  },
  legal: {
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 20
  },
  legalText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10
  },
  legalLinks: {
    flexDirection: 'row'
  },
  legalLink: {
    fontSize: 11,
    color: '#6C63FF'
  },
  legalSeparator: {
    fontSize: 11,
    color: '#999'
  }
});

export default PaywallScreen;
