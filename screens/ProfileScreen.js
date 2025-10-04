// EvimAI - Profile Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

export const ProfileScreen = ({ navigation }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [credits, setCredits] = useState(CONFIG.FREE_CREDITS);
  const [notifications, setNotifications] = useState(true);
  const [qualityMode, setQualityMode] = useState(true);
  const [userStats, setUserStats] = useState({
    totalDesigns: 0,
    totalShares: 0,
    referralCredits: 0
  });

  useEffect(() => {
    loadUserData();
    checkPremiumStatus();
  }, []);

  const loadUserData = async () => {
    try {
      const stats = await AsyncStorage.getItem('userStats');
      if (stats) {
        setUserStats(JSON.parse(stats));
      }

      const savedCredits = await AsyncStorage.getItem('credits');
      if (savedCredits) {
        setCredits(parseInt(savedCredits));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      // Demo mode - AsyncStorage'dan kontrol et
      const premium = await AsyncStorage.getItem('isPremium');
      setIsPremium(premium === 'true');
    } catch (error) {
      console.log('Error checking premium:', error);
    }
  };

  const handleShareApp = async () => {
    try {
      const referralCode = await AsyncStorage.getItem('referralCode') || 'EVIM2024';

      const result = await Share.share({
        message: `${CONFIG.REFERRAL.share_text} ${CONFIG.REFERRAL.share_url}${referralCode}`,
        title: 'EvimAI ile evinizi yeniden tasarlayın!'
      });

      if (result.action === Share.sharedAction) {
        // Paylaşım başarılı, kredi ver
        const newCredits = credits + CONFIG.REFERRAL.reward_credits;
        setCredits(newCredits);
        await AsyncStorage.setItem('credits', newCredits.toString());

        Alert.alert(
          '🎉 Tebrikler!',
          `${CONFIG.REFERRAL.reward_credits} kredi kazandınız!`
        );
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Camera' }]
            });
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* User Info */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>EvimAI Kullanıcısı</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {isPremium ? '⭐ Premium Üye' : '💎 Ücretsiz'}
            </Text>
          </View>
        </View>
      </View>

      {/* Credits Card */}
      <View style={styles.creditsCard}>
        <View style={styles.creditsHeader}>
          <Text style={styles.creditsTitle}>Mevcut Krediler</Text>
          <Text style={styles.creditsAmount}>
            {isPremium ? '∞' : credits}
          </Text>
        </View>
        {!isPremium && (
          <TouchableOpacity
            style={styles.buyCreditsButton}
            onPress={() => navigation.navigate('Paywall')}
          >
            <Text style={styles.buyCreditsText}>Premium'a Geç →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats.totalDesigns}</Text>
          <Text style={styles.statLabel}>Tasarım</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats.totalShares}</Text>
          <Text style={styles.statLabel}>Paylaşım</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats.referralCredits}</Text>
          <Text style={styles.statLabel}>Referans</Text>
        </View>
      </View>

      {/* Referral Section */}
      {CONFIG.FEATURES.referral_system && (
        <View style={styles.referralCard}>
          <Text style={styles.referralTitle}>🎁 Arkadaşını Davet Et</Text>
          <Text style={styles.referralDesc}>
            Her davet için {CONFIG.REFERRAL.reward_credits} kredi kazan
          </Text>
          <TouchableOpacity
            style={styles.referralButton}
            onPress={handleShareApp}
          >
            <Text style={styles.referralButtonText}>Paylaş ve Kazan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ayarlar</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Bildirimler</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#DDD', true: '#6C63FF' }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Yüksek Kalite Mod</Text>
          <Switch
            value={qualityMode}
            onValueChange={setQualityMode}
            trackColor={{ false: '#DDD', true: '#6C63FF' }}
          />
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📖</Text>
          <Text style={styles.menuText}>Kullanım Kılavuzu</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📞</Text>
          <Text style={styles.menuText}>Destek</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⭐</Text>
          <Text style={styles.menuText}>Uygulamayı Değerlendir</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📄</Text>
          <Text style={styles.menuText}>Gizlilik Politikası</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📜</Text>
          <Text style={styles.menuText}>Kullanım Şartları</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>EvimAI v1.0.0</Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFF'
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center'
  },
  backIcon: {
    fontSize: 24,
    color: '#333'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 15
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  avatarText: {
    fontSize: 36
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  creditsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15
  },
  creditsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  creditsTitle: {
    fontSize: 16,
    color: '#666'
  },
  creditsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C63FF'
  },
  buyCreditsButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  buyCreditsText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#666'
  },
  referralCard: {
    backgroundColor: '#6C63FF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center'
  },
  referralTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8
  },
  referralDesc: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 15
  },
  referralButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20
  },
  referralButtonText: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 16
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 10
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  settingLabel: {
    fontSize: 16,
    color: '#333'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  menuArrow: {
    fontSize: 18,
    color: '#CCC'
  },
  logoutButton: {
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    marginBottom: 20
  },
  logoutText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 20
  }
});

export default ProfileScreen;
