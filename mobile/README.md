# Nest React Mobile

Aplikasi mobile Flutter untuk proyek NestJS React dengan fitur login, beranda, dan pengaturan profile.

## Fitur

- ✅ **Login** - Autentikasi dengan JWT dan refresh token
- ✅ **Beranda** - Dashboard dengan informasi user dan menu cepat
- ✅ **Profile** - Update profil, ganti password, dan avatar

## Requirements

- Flutter SDK ^3.5.0
- Dart SDK ^3.5.0
- Backend berjalan di `http://localhost:3000` atau `http://10.0.2.2:3000` (Android emulator)

## Instalasi

1. Install dependencies:

```bash
cd mobile
flutter pub get
```

2. Jalankan backend:

```bash
cd ../backend
npm run start:dev
```

3. Jalankan aplikasi:

```bash
flutter run
```

## Konfigurasi API

Edit `lib/core/api/api_endpoints.dart` untuk mengubah base URL:

```dart
// Untuk Android emulator
static const String baseUrl = 'http://10.0.2.2:3000';

// Untuk iOS simulator
static const String baseUrl = 'http://localhost:3000';

// Untuk perangkat fisik (ganti dengan IP komputer)
static const String baseUrl = 'http://192.168.1.100:3000';
```

## Login Default

- Email: `admin@example.com`
- Password: `admin123`

## Struktur Folder

```
lib/
├── main.dart
├── core/
│   ├── api/          # HTTP client dan endpoints
│   ├── router/       # GoRouter navigation
│   ├── storage/      # Secure token storage
│   └── theme/        # App theming
└── features/
    ├── auth/         # Login, splash, auth bloc
    ├── home/         # Dashboard beranda
    └── profile/      # Pengaturan profile
```
