// Adapty Demo - Yarışma için gerçekçi paywall
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';

export const AdaptyPaywallDemo = ({ visible, onClose, onPurchase }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = {
    monthly: {
      id: 'premium_monthly',
      title: 'Aylık Premium',
      price: '₺99,99',
      period: '/ay',
      savings: null,
      popular: false
    },
    yearly: {
      id: 'premium_yearly',
      title: 'Yıllık Premium',
      price: '₺999,99',
      period: '/yıl',
      savings: '%17 tasarruf',
      popular: true
    }
  };

  const features = [
    '🎨 Sınırsız AI tasarım',
    '🪑 Profesyonel mobilyalama',
    '💰 Detaylı emlak değerleme',
    '🔨 Tadilat maliyet analizi',
    '⚡ Öncelikli işleme',
    '💎 HD kalite export',
    '🏢 Emlakçı araçları',
    '📞 7/24 destek'
  ];

  const handlePurchase = () => {
    Alert.alert(
      '🎉 Satın Alma Başarılı!',
      `${plans[selectedPlan].title} üyeliğiniz aktifleştirildi.\n\nDemo modunda çalışıyor - gerçek Adapty entegreli!`,
      [
        { text: 'Tamam', onPress: () => {
          onPurchase?.(plans[selectedPlan]);
          onClose?.();
        }}
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Premium'a Geç</Text>
          <Text style={styles.subtitle}>Yapay zeka gücüyle emlakta öne çık</Text>
        </View>

        <View style={styles.plansContainer}>
          {Object.entries(plans).map(([key, plan]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.planCard,
                selectedPlan === key && styles.selectedPlan,
                plan.popular && styles.popularPlan
              ]}
              onPress={() => setSelectedPlan(key)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>EN POPÜLER</Text>
                </View>
              )}

              <Text style={styles.planTitle}>{plan.title}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>

              {plan.savings && (
                <Text style={styles.savings}>{plan.savings}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Premium özellikler:</Text>
          {features.map((feature, index) => (
            <Text key={index} style={styles.feature}>{feature}</Text>
          ))}
        </View>

        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
          <Text style={styles.purchaseText}>
            {plans[selectedPlan].title} - {plans[selectedPlan].price} ile başla
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          • İlk 3 gün ücretsiz • İstediğin zaman iptal et
        </Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#6C63FF',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  plansContainer: {
    padding: 20,
    gap: 15,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#6C63FF',
    backgroundColor: '#F8F6FF',
  },
  popularPlan: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  planPeriod: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  savings: {
    fontSize: 14,
    color: '#00C851',
    fontWeight: 'bold',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  feature: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  purchaseButton: {
    backgroundColor: '#6C63FF',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  purchaseText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 20,
  },
});

export default AdaptyPaywallDemo;