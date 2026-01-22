//🔹 REJESTRACJA SERVICE WORKERA

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("✅ Service Worker zarejestrowany"))
    .catch(err => console.log("❌ Błąd SW:", err));
}

//🔹 ZARZĄDZANIE WIDOKAMI
const views = document.querySelectorAll(".view");
const homeBtn = document.getElementById("homeBtn");
const cameraBtn = document.getElementById("cameraBtn");
const galleryBtn = document.getElementById("galleryBtn");
const settingsBtn = document.getElementById("settingsBtn");

homeBtn.addEventListener("click", () => showView("homeView"));
cameraBtn.addEventListener("click", () => showView("cameraView"));
galleryBtn.addEventListener("click", () => showView("galleryView"));
settingsBtn.addEventListener("click", () => showView("settingsView"));

// Ukrywa wszystkie widoki i pokazuje tylko wybrany
function showView(id) {
  views.forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// 🔹 GEOLOKALIZACJA

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

const video = document.getElementById("camera");
const captureBtn = document.getElementById("captureBtn");
const canvas = document.getElementById("photoCanvas");
const gallery = document.getElementById("gallery");

let stream;

// 🚀 URUCHAMIANIE KAMERY

async function startCamera() {
  try {
    captureBtn.disabled = true; 
    video.style.opacity = "0.5";

    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
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
captureBtn.addEventListener("click", () => {
  if (!video.videoWidth) {
    alert("Kamera jeszcze się nie uruchomiła! Poczekaj sekundę.");
    return;
  }

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  ctx.drawImage(video, 0, 0);
  canvas.style.display = "block";

  const imgData = canvas.toDataURL("image/png");
  console.log("📸 Zdjęcie zapisane:", imgData.substring(0, 30));

  savePhoto(imgData);
  notifyUser("Zdjęcie zapisane w galerii!");
});

// 🔹 POWIADOMIENIA PUSH
function notifyUser(msg) {
 
  const notificationsEnabled = localStorage.getItem("notificationsEnabled");
  if (notificationsEnabled === "false") {
    return; 
  }

  if (Notification.permission === "granted") {
    new Notification(msg);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") new Notification(msg);
    });
  }
}

// 🔹 ZARZĄDZANIE GALERIĄ
function savePhoto(data) {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  photos.push(data);
  localStorage.setItem("photos", JSON.stringify(photos));
  loadGallery();
}
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

function deletePhoto(idx) {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  photos.splice(idx, 1);
  localStorage.setItem("photos", JSON.stringify(photos));
  loadGallery();
}

galleryBtn.addEventListener("click", loadGallery);

// 🔹 DETEKCJA TRYBU OFFLINE
window.addEventListener("online", () =>
  document.getElementById("offlineBanner").classList.add("hidden")
);

window.addEventListener("offline", () =>
  document.getElementById("offlineBanner").classList.remove("hidden")
);

// 🔹 USTAWIENIA - CIEMNY MOTYW
const darkModeToggle = document.getElementById("darkModeToggle");

const darkModeEnabled = localStorage.getItem("darkMode") === "true";
if (darkModeEnabled) {
  document.body.classList.add("dark-mode");
  darkModeToggle.checked = true;
}
darkModeToggle.addEventListener("change", (e) => {
  if (e.target.checked) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "true");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "false");
  }
});

// 🔹 USTAWIENIA - POWIADOMIENIA
const notificationsToggle = document.getElementById("notificationsToggle");

const notificationsEnabled = localStorage.getItem("notificationsEnabled");
if (notificationsEnabled === null) {
  localStorage.setItem("notificationsEnabled", "true");
  notificationsToggle.checked = true;
} else {
  notificationsToggle.checked = notificationsEnabled === "true";
}
notificationsToggle.addEventListener("change", (e) => {
  localStorage.setItem("notificationsEnabled", e.target.checked ? "true" : "false");
  
  if (e.target.checked && Notification.permission === "default") {
    Notification.requestPermission();
  }
});