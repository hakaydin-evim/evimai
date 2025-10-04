// EvimAI - History Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('designHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.log('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    Alert.alert(
      'Sil',
      'Bu tasarımı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const newHistory = history.filter(item => item.id !== id);
            setHistory(newHistory);
            await AsyncStorage.setItem('designHistory', JSON.stringify(newHistory));
          }
        }
      ]
    );
  };

  const clearAll = async () => {
    Alert.alert(
      'Tüm Geçmişi Sil',
      'Tüm tasarım geçmişinizi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tümünü Sil',
          style: 'destructive',
          onPress: async () => {
            setHistory([]);
            await AsyncStorage.removeItem('designHistory');
          }
        }
      ]
    );
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'redesign': return '🎨';
      case 'staging': return '🛋️';
      case 'estimate': return '💰';
      case 'renovation': return '🔨';
      default: return '🏠';
    }
  };

  const getModeName = (mode) => {
    switch (mode) {
      case 'redesign': return 'Yeniden Tasarım';
      case 'staging': return 'Mobilyalama';
      case 'estimate': return 'Değer Tahmini';
      case 'renovation': return 'Tadilat';
      default: return 'Tasarım';
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString('tr-TR');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => navigation.navigate('Result', {
        original: item.original,
        processed: item.processed,
        mode: item.mode,
        insights: item.insights
      })}
    >
      <Image
        source={{ uri: item.processed }}
        style={styles.thumbnail}
      />
      <View style={styles.historyInfo}>
        <View style={styles.historyHeader}>
          <Text style={styles.modeIcon}>{getModeIcon(item.mode)}</Text>
          <Text style={styles.modeName}>{getModeName(item.mode)}</Text>
        </View>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteItem(item.id)}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Geçmiş Tasarımlar</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearText}>Temizle</Text>
          </TouchableOpacity>
        )}
        {history.length === 0 && <View style={{ width: 60 }} />}
      </View>

      {/* Content */}
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={styles.emptyTitle}>Henüz tasarım yok</Text>
          <Text style={styles.emptyDesc}>
            İlk tasarımınızı oluşturarak başlayın
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <Text style={styles.startButtonText}>Tasarım Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
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
  clearText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600'
  },
  loadingText: {
    fontSize: 16,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  emptyDesc: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30
  },
  startButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 15
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F0F0F0'
  },
  historyInfo: {
    flex: 1,
    marginLeft: 15
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  modeIcon: {
    fontSize: 20,
    marginRight: 8
  },
  modeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  timestamp: {
    fontSize: 14,
    color: '#999'
  },
  deleteButton: {
    padding: 10
  },
  deleteIcon: {
    fontSize: 20
  }
});

export default HistoryScreen;
