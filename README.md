# 📸 PWA Photo Locator

![PWA](https://img.shields.io/badge/PWA-enabled-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Opis projektu
Progressive Web App umożliwiająca robienie zdjęć z automatycznym zapisywaniem lokalizacji. Aplikacja działa offline i może być zainstalowana na urządzeniu mobilnym.

## ✨ Funkcjonalności

### 🎯 Natywne API wykorzystane w projekcie:
1. **Camera API (getUserMedia)** - dostęp do kamery urządzenia do robienia zdjęć
2. **Geolocation API** - pobieranie aktualnej pozycji użytkownika (szerokość/długość geograficzna)
3. **Notification API** - powiadomienia push po zrobieniu zdjęcia

### 🌐 Widoki aplikacji:
- **Home** - strona główna z przyciskiem pobierania lokalizacji
- **Camera** - widok kamery z możliwością zrobienia zdjęcia
- **Gallery** - galeria zapisanych zdjęć z opcją usuwania

### 📴 Tryb offline:
- Aplikacja działa bez połączenia z internetem dzięki Service Worker
- Wszystkie zasoby są cachowane lokalnie
- Zdjęcia zapisywane w localStorage
- Informacja o braku połączenia wyświetlana na górze ekranu

## 🛠️ Technologie
- **HTML5** - struktura aplikacji
- **CSS3** - stylowanie (Flexbox, Grid, animacje)
- **JavaScript (ES6+)** - logika aplikacji (async/await, destructuring, arrow functions)
- **Service Worker** - cachowanie zasobów, obsługa offline
- **Web Manifest** - instalowalność aplikacji
- **Cache API** - strategia buforowania

## 📦 Struktura projektu
```
pwa-photo-locator/
├── index.html          # Główny plik HTML
├── app.js             # Logika aplikacji
├── styles.css         # Stylowanie
├── sw.js              # Service Worker
├── manifest.json      # PWA manifest
├── package.json       # Zależności npm
├── README.md          # Dokumentacja
└── icons/             # Ikony aplikacji
    ├── icon-256.png
    └── icon-512.png
```

## 🚀 Instalacja i uruchomienie

### Wymagania:
- Node.js (wersja 14 lub nowsza)
- Przeglądarka obsługująca PWA (Chrome, Edge, Safari)

### Kroki:

1. **Sklonuj repozytorium:**

2. **Zainstaluj zależności:**
```bash
npm install
```

3. **Uruchom serwer deweloperski:**
```bash
npm start
```

4. **Otwórz aplikację:**
```
http://localhost:3000
```

## 🧪 Testowanie trybu offline

1. Otwórz aplikację w przeglądarce
2. Otwórz DevTools (F12)
3. Przejdź do zakładki **Network**
4. Ustaw **Offline** w menu throttling
5. Odśwież stronę - aplikacja powinna działać!

## 📱 Instalacja PWA

### Na Androidzie (Chrome):
1. Otwórz aplikację w Chrome
2. Kliknij menu (⋮) → "Dodaj do ekranu głównego"
3. Potwierdź instalację

### Na iOS (Safari):
1. Otwórz aplikację w Safari
2. Kliknij przycisk "Udostępnij" 
3. Wybierz "Dodaj do ekranu początkowego"

## 🔧 Jak to działa?

### Architektura:
- **Single Page Application** - wszystkie widoki w jednym pliku HTML
- **Vanilla JavaScript** - brak frameworków dla maksymalnej wydajności
- **localStorage** - przechowywanie zdjęć lokalnie (base64)
- **Service Worker** - przechwytywanie żądań sieciowych i serwowanie z cache

### Strategia buforowania:
- **Cache First** - dla plików statycznych (HTML, CSS, JS, ikony)
- **Fallback do index.html** - gdy brak połączenia dla nawigacji
- **Ignorowanie blob/data URLs** - dla streamów kamery

### Flow aplikacji:
1. Użytkownik otwiera aplikację → SW cachuje zasoby
2. Przejście do Camera → Uruchomienie kamery przez getUserMedia
3. Kliknięcie "Zrób zdjęcie" → Canvas konwertuje do base64 → Zapis do localStorage
4. Przejście do Gallery → Odczyt z localStorage → Wyświetlenie miniatur
5. Tryb offline → Aplikacja działa z cache, zdjęcia dostępne z localStorage


## 📊 Wydajność
Aplikacja została zoptymalizowana pod kątem:
- Minimalny rozmiar plików (brak zależności zewnętrznych)
- Cachowanie wszystkich zasobów
- Lazy loading dla widoków


## 👨‍💻 Autor
Dmytro Danyliuk - Projekt na zaliczenie przedmiotu Tworzenie progresywnych aplikacji mobilnych