//🔹 REJESTRACJA SERVICE WORKERA
// Service Worker umożliwia działanie aplikacji offline poprzez cachowanie zasobów.
// Rejestrujemy go przy pierwszym załadowaniu strony.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("✅ Service Worker zarejestrowany"))
    .catch(err => console.log("❌ Błąd SW:", err));
}

//🔹 ZARZĄDZANIE WIDOKAMI
// Aplikacja działa jako SPA (Single Page Application).
// Użytkownik przełącza się między widokami bez przeładowania strony.
const views = document.querySelectorAll(".view");
const homeBtn = document.getElementById("homeBtn");
const cameraBtn = document.getElementById("cameraBtn");
const galleryBtn = document.getElementById("galleryBtn");

homeBtn.addEventListener("click", () => showView("homeView"));
cameraBtn.addEventListener("click", () => showView("cameraView"));
galleryBtn.addEventListener("click", () => showView("galleryView"));

// Ukrywa wszystkie widoki i pokazuje tylko wybrany
function showView(id) {
  views.forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// 🔹 GEOLOKALIZACJA
// Wykorzystujemy Geolocation API do pobrania współrzędnych GPS użytkownika.
// Przydatne do tagowania zdjęć lokalizacją.
const locationOutput = document.getElementById("locationOutput");
document.getElementById("getLocation").addEventListener("click", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        locationOutput.textContent = `Twoja pozycja: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      },
      () => locationOutput.textContent = "Nie udało się pobrać lokalizacji."
    );
  } else {
    locationOutput.textContent = "Geolokalizacja nie jest wspierana.";
  }
});

// 🔹 OBSŁUGA KAMERY
// Używamy MediaDevices API (getUserMedia) do dostępu do kamery urządzenia.
const video = document.getElementById("camera");
const captureBtn = document.getElementById("captureBtn");
const canvas = document.getElementById("photoCanvas");
const gallery = document.getElementById("gallery");

let stream;

// 🚀 URUCHAMIANIE KAMERY
// Blokujemy przycisk do momentu pełnej inicjalizacji streamu wideo.
// Zapobiega to próbom zrobienia zdjęcia zanim kamera jest gotowa.
async function startCamera() {
  try {
    captureBtn.disabled = true; // zablokuj dopóki kamera nie ruszy
    video.style.opacity = "0.5";

    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // Czekamy na załadowanie metadanych wideo (rozdzielczość, FPS itp.)
    video.onloadedmetadata = () => {
      console.log("🎥 Kamera gotowa:", video.videoWidth, video.videoHeight);
      captureBtn.disabled = false;
      video.style.opacity = "1";
    };
  } catch (err) {
    alert("Brak dostępu do kamery.");
  }
}

cameraBtn.addEventListener("click", startCamera);

// 🔹 ROBIENIE ZDJĘCIA
// Konwertujemy klatkę z video do obrazu na canvas, następnie do base64.
// Base64 pozwala na łatwe przechowywanie w localStorage.
captureBtn.addEventListener("click", () => {
  if (!video.videoWidth) {
    alert("Kamera jeszcze się nie uruchomiła! Poczekaj sekundę.");
    return;
  }

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Rysujemy obecną klatkę wideo na canvas
  ctx.drawImage(video, 0, 0);
  canvas.style.display = "block";

  // Konwersja do formatu base64 PNG
  const imgData = canvas.toDataURL("image/png");
  console.log("📸 Zdjęcie zapisane:", imgData.substring(0, 30));

  savePhoto(imgData);
  notifyUser("Zdjęcie zapisane w galerii!");
});

// 🔹 POWIADOMIENIA PUSH
// Wykorzystujemy Notification API do informowania użytkownika o zapisie zdjęcia.
// Pytamy o pozwolenie tylko raz, przy pierwszym użyciu.
function notifyUser(msg) {
  if (Notification.permission === "granted") {
    new Notification(msg);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") new Notification(msg);
    });
  }
}

// 🔹 ZARZĄDZANIE GALERIĄ
// Zdjęcia przechowujemy w localStorage jako stringi base64.
// To pozwala na działanie galerii offline bez konieczności serwera.
function savePhoto(data) {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  photos.push(data);
  localStorage.setItem("photos", JSON.stringify(photos));
  loadGallery();
}

// Wczytuje wszystkie zdjęcia z localStorage i renderuje miniaturki
function loadGallery() {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  gallery.innerHTML = "";

  photos.forEach((src, index) => {
    const box = document.createElement("div");
    box.classList.add("photo-box");

    const img = document.createElement("img");
    img.src = src;
    img.classList.add("gallery-photo");

    const delBtn = document.createElement("button");
    delBtn.textContent = "Usuń zdjęcie";
    delBtn.classList.add("delete-photo-btn");
    delBtn.addEventListener("click", () => deletePhoto(index));

    box.appendChild(img);
    box.appendChild(delBtn);
    gallery.appendChild(box);
  });
}

// Usuwa zdjęcie po indeksie i odświeża galerię
function deletePhoto(idx) {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  photos.splice(idx, 1);
  localStorage.setItem("photos", JSON.stringify(photos));
  loadGallery();
}

galleryBtn.addEventListener("click", loadGallery);

// 🔹 DETEKCJA TRYBU OFFLINE
// Monitorujemy zdarzenia online/offline aby informować użytkownika
// o stanie połączenia. Banner pojawia się automatycznie.
window.addEventListener("online", () =>
  document.getElementById("offlineBanner").classList.add("hidden")
);

window.addEventListener("offline", () =>
  document.getElementById("offlineBanner").classList.remove("hidden")
);