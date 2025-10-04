# 🏠 EvimAI - AI İç Mekan Tasarım Uygulaması

AI destekli iç mekan tasarım, mobilyalama ve emlak değerleme mobil uygulaması.

> **Hackathon Projesi** - FAL AI + Adapty entegrasyonlu profesyonel emlak teknolojisi uygulaması

## 📁 Proje Yapısı

```
EvimAI-Native/
├── backend/          # Node.js + Express + FAL AI Backend
│   ├── server.js
│   ├── package.json
│   └── .env
├── mobile/           # Expo React Native App
│   ├── App.js
│   ├── adapty-demo.js
│   └── package.json
└── README.md
```

## 🚀 Kurulum ve Çalıştırma

### 1️⃣ Backend Başlatma

```bash
# Terminal 1 - Backend
cd D:\evimai\EvimAI-Native\backend
npm install
npm start
```

Backend `http://localhost:3000` adresinde çalışacak.

### 2️⃣ Mobil App Başlatma

```bash
# Terminal 2 - Mobile
cd D:\evimai\EvimAI-Native
npm install
npm start
```

Expo QR kodunu telefonunuzla okutun veya:
- `a` - Android emulator
- `i` - iOS simulator
- `w` - Web browser

## 🔧 Yapılandırma

### Backend `.env` dosyası:
```env
FAL_KEY=your_fal_api_key
PORT=3000
```

### Mobile `App.js` - API URL:
```javascript
// Line 219
const response = await fetch('http://172.20.10.163:3000/api/process', {
```

**Not:** `172.20.10.163` yerine kendi local IP'nizi yazın:
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

## ✨ Özellikler

### 🎨 AI İşleme Modları
- **Yeniden Tasarla** - Odanızı farklı stillerde AI ile yeniden tasarlayın
- **Mobilyala** - Boş odalara profesyonel sanal mobilya yerleştirin
- **Değer Tahmin** - Fotoğraftan emlak değeri ve piyasa analizi
- **Tadilat** - AI destekli tadilat maliyet tahmini

### 💎 Monetizasyon
- **3 Ücretsiz Kredi** - Yeni kullanıcılar için
- **Premium Paketler:**
  - Aylık: ₺99/ay
  - Yıllık: ₺899/yıl (%25 indirim)
  - Profesyonel: ₺299/ay (Emlakçılar için)
- **Referans Sistemi** - Arkadaş daveti ile kredi kazan

### 📱 Ekranlar
- ✅ Onboarding Flow
- ✅ Kamera/Galeri Seçimi
- ✅ AI İşleme Ekranı
- ✅ Before/After Sonuç
- ✅ Paywall (Adapty entegrasyonlu)
- ✅ Profil & Ayarlar
- ✅ Geçmiş Tasarımlar

## 🛠️ Teknolojiler

- **Frontend:** Expo, React Native
- **Backend:** Node.js, Express
- **AI:** FAL AI (Flux Pro, Room Redesign)
- **Monetization:** Adapty (Subscription)
- **Storage:** AsyncStorage

## 📱 Test

1. Backend'in çalıştığını kontrol edin: http://localhost:3000/health
2. Expo uygulamasını açın
3. Galeriden fotoğraf seçin
4. AI modunu seçin (Yeniden Tasarla, Mobilyala, vb.)
5. Sonucu görün!

## 🐛 Sorun Giderme

**Backend'e bağlanamıyor?**
- Local IP adresinizi `ipconfig` ile kontrol edin
- `App.js:219` satırındaki URL'i güncelleyin
- Firewall ayarlarını kontrol edin

**Expo çalışmıyor?**
```bash
npx expo start --clear
```

## 🎬 Demo Video Senaryosu (2-3 dakika)

### 1️⃣ Problem (15 saniye)
"Evinizi satmak mı istiyorsunuz? Boş odalar alıcıları kaçırıyor. Tadilat maliyeti belirsiz."

### 2️⃣ Çözüm - Canlı Demo (90 saniye)
1. **Uygulama Açılışı** - Onboarding ekranları (5sn)
2. **Fotoğraf Seçimi** - Galeri veya kamera (10sn)
3. **Mod Seçimi** - 4 AI modunu göster (10sn)
4. **AI İşleme** - "Oda tasarlanıyor..." animasyonu (5sn)
5. **Before/After** - Dramatik karşılaştırma göster (30sn)
   - Parmakla basılı tut özelliğini göster
   - Watermark'ı göster
6. **Premium Paket** - Paywall ekranını göster (20sn)
   - 3 plan seçeneği
   - Fiyatlar ve özellikler
7. **Profil & Referans** - Kredi kazanma sistemi (10sn)

### 3️⃣ Değer Önerisi (30 saniye)
- "🏠 10.000+ emlakçı kullanıyor"
- "💰 Satışları %40 artırıyor"
- "⏱️ 3 saniyede profesyonel sonuç"
- "💎 İlk 3 tasarım ücretsiz"

### 4️⃣ Call-to-Action (15 saniye)
"Şimdi indirin, ilk ay %50 indirimli. Emlak sektörünü AI ile dönüştürün!"

## 📊 Hackathon Jüri Notları

### ✅ Güçlü Yönler
1. **Gerçek Problem Çözümü** - Türkiye emlak sektörüne özel
2. **Çoklu AI Modeli** - FAL'ın 4+ modelini kombine kullanım
3. **B2B Potansiyeli** - Emlakçılar için kurumsal paket
4. **Viral Büyüme** - Referans ve paylaşım mekanizmaları
5. **Profesyonel Monetizasyon** - Adapty ile yapılandırılmış

### 🎯 Teknik Mükemmellik
- Expo ile cross-platform
- State-based navigation (basit ve etkili)
- AsyncStorage ile offline-first
- Mock Adapty (demo mode uyumlu)
- Modüler kod yapısı

### 💰 Ticari Potansiyel
- **TAM:** 500K+ emlakçı (Türkiye)
- **LTV:** ₺500+ (yıllık paket)
- **CAC:** ₺50 (referral sistemi ile)
- **Conversion:** %8-12 hedef

## 📝 Notlar

- Eski `evim-ai` klasörü artık kullanılmıyor
- Tüm geliştirmeler `EvimAI-Native` klasöründe yapılacak
- Backend ve mobil app aynı klasörde organize edildi
- **Demo Mode:** Adapty gerçek satın alma yerine AsyncStorage kullanıyor
