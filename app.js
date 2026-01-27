/**
 * PWA Photo Locator - Main Application File
 * 
 * Struktura:
 * - Linie 1-50:    Service Worker, widoki, inicjalizacja
 * - Linie 51-150:  Statystyki, geolokalizacja z reverse geocoding
 * - Linie 151-350: Zarządzanie albumami (tworzenie, usuwanie, emoji)
 * - Linie 351-450: Kamera i zapisywanie zdjęć z lokalizacją
 * - Linie 451-550: Galeria, przeglądanie, usuwanie
 * - Linie 551-700: Edycja zdjęć (obrót, filtry, tekst)
 * - Linie 701-800: Eksport PDF z lokalizacją, motywy, ustawienia
 */

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

const navBtns = [homeBtn, cameraBtn, galleryBtn, settingsBtn];

homeBtn.addEventListener("click", () => showView("homeView", homeBtn));
cameraBtn.addEventListener("click", () => showView("cameraView", cameraBtn));
galleryBtn.addEventListener("click", () => showView("galleryView", galleryBtn));
settingsBtn.addEventListener("click", () => showView("settingsView", settingsBtn));

function showView(id, activeBtn) {
  views.forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  
  navBtns.forEach(btn => btn.classList.remove("active"));
  activeBtn.classList.add("active");
  
  if (id === "homeView") {
    updateStats();
  }
  if (id === "galleryView") {
    loadGallery();
  }
  if (id === "settingsView") {
    loadAlbumsList();
  }
}

// 🔹 STATYSTYKI
function updateStats() {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  const albums = getAlbums().filter(a => a !== "Wszystkie");
  
  document.getElementById("totalPhotos").textContent = photos.length;
  document.getElementById("totalAlbums").textContent = albums.length;
}

// 🔹 GEOLOKALIZACJA Z REVERSE GEOCODING
const locationOutput = document.getElementById("locationOutput");
const locationCard = document.getElementById("locationCard");
const latValue = document.getElementById("latValue");
const lngValue = document.getElementById("lngValue");
const accuracyValue = document.getElementById("accuracyValue");
const timeValue = document.getElementById("timeValue");
const mapsLink = document.getElementById("mapsLink");
const addressMain = document.getElementById("addressMain");
const addressDetails = document.getElementById("addressDetails");

document.getElementById("getLocation").addEventListener("click", () => {
  locationOutput.textContent = "";
  locationCard.classList.add("hidden");
  
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const timestamp = new Date(pos.timestamp);
        
        latValue.textContent = latitude.toFixed(6) + "°";
        lngValue.textContent = longitude.toFixed(6) + "°";
        accuracyValue.textContent = Math.round(accuracy) + " metrów";
        timeValue.textContent = timestamp.toLocaleTimeString('pl-PL');
        
        locationCard.classList.remove("hidden");
        mapsLink.classList.remove("hidden");
        mapsLink.href = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        addressMain.textContent = "Wyszukiwanie adresu...";
        addressDetails.textContent = "";
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data.address) {
            const addr = data.address;
            const country = addr.country || "";
            const city = addr.city || addr.town || addr.village || "";
            const road = addr.road || "";
            const houseNumber = addr.house_number || "";
            
            addressMain.textContent = `${country}${city ? ', ' + city : ''}`;
            addressDetails.textContent = `${road}${houseNumber ? ' ' + houseNumber : ''}`;
          } else {
            addressMain.textContent = "Nie udało się pobrać adresu";
          }
        } catch (error) {
          addressMain.textContent = "Błąd pobierania adresu (wymagany internet)";
        }
      },
      (error) => {
        locationOutput.textContent = "Nie udało się pobrać lokalizacji. " + 
          (error.code === 1 ? "Brak pozwolenia." : 
           error.code === 2 ? "Pozycja niedostępna." : 
           "Przekroczono limit czasu.");
      }
    );
  } else {
    locationOutput.textContent = "Geolokalizacja nie jest wspierana.";
  }
});

// 🔹 ZARZĄDZANIE ALBUMAMI
function getAlbums() {
  const albums = JSON.parse(localStorage.getItem("albums") || '[]');
  if (!albums.includes("Wszystkie")) {
    albums.unshift("Wszystkie");
  }
  return albums;
}

function saveAlbums(albums) {
  localStorage.setItem("albums", JSON.stringify(albums));
}

function updateAlbumSelectors() {
  const albums = getAlbums();
  
  const albumSelect = document.getElementById("albumSelect");
  const galleryAlbumFilter = document.getElementById("galleryAlbumFilter");
  const exportAlbumSelect = document.getElementById("exportAlbumSelect");
  
  albumSelect.innerHTML = albums.map(album => 
    `<option value="${album}">${getAlbumEmoji(album)} ${album}</option>`
  ).join("");
  
  galleryAlbumFilter.innerHTML = albums.map(album => 
    `<option value="${album}">${getAlbumEmoji(album)} ${album}</option>`
  ).join("");
  
  if (exportAlbumSelect) {
    exportAlbumSelect.innerHTML = albums.map(album => 
      `<option value="${album}">${getAlbumEmoji(album)} ${album}</option>`
    ).join("");
  }
}

function getAlbumEmoji(albumName) {
  const emojis = JSON.parse(localStorage.getItem("albumEmojis") || "{}");
  return emojis[albumName] || "📁";
}

function setAlbumEmoji(albumName, emoji) {
  const emojis = JSON.parse(localStorage.getItem("albumEmojis") || "{}");
  emojis[albumName] = emoji;
  localStorage.setItem("albumEmojis", JSON.stringify(emojis));
}

// Create album modal
const createAlbumModal = document.getElementById("createAlbumModal");
const createAlbumBtn = document.getElementById("createAlbumBtn");
const cancelAlbumBtn = document.getElementById("cancelAlbumBtn");
const saveAlbumBtn = document.getElementById("saveAlbumBtn");
const newAlbumName = document.getElementById("newAlbumName");
const selectedEmojiInput = document.getElementById("selectedEmoji");

createAlbumBtn.addEventListener("click", () => {
  createAlbumModal.classList.remove("hidden");
  newAlbumName.value = "";
  selectedEmojiInput.value = "📁";
  
  document.querySelectorAll(".emoji-option").forEach(e => e.classList.remove("selected"));
  document.querySelector('.emoji-option[data-emoji="📁"]').classList.add("selected");
  
  newAlbumName.focus();
});

document.querySelectorAll(".emoji-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".emoji-option").forEach(e => e.classList.remove("selected"));
    option.classList.add("selected");
    selectedEmojiInput.value = option.dataset.emoji;
  });
});

cancelAlbumBtn.addEventListener("click", () => {
  createAlbumModal.classList.add("hidden");
});

saveAlbumBtn.addEventListener("click", () => {
  const albumName = newAlbumName.value.trim();
  const emoji = selectedEmojiInput.value;
  
  if (albumName && albumName !== "Wszystkie") {
    const albums = getAlbums();
    if (!albums.includes(albumName)) {
      albums.push(albumName);
      saveAlbums(albums);
      setAlbumEmoji(albumName, emoji);
      
      updateAlbumSelectors();
      createAlbumModal.classList.add("hidden");
    } else {
      alert("Album o tej nazwie już istnieje!");
    }
  }
});

// Load albums list in settings
function loadAlbumsList() {
  const albums = getAlbums().filter(a => a !== "Wszystkie");
  const albumsList = document.getElementById("albumsList");
  
  if (albums.length === 0) {
    albumsList.innerHTML = '<p style="color: #666;">Brak utworzonych albumów</p>';
    return;
  }
  
  albumsList.innerHTML = albums.map(album => {
    const photos = JSON.parse(localStorage.getItem("photos") || "[]");
    const count = photos.filter(p => p.album === album).length;
    const emoji = getAlbumEmoji(album);
    
    return `
      <div class="album-item">
        <div>
          <span class="album-name">${emoji} ${album}</span>
          <span class="album-count">(${count} zdjęć)</span>
        </div>
        <div class="album-actions">
          <button class="delete-album-btn" onclick="deleteAlbum('${album}')">🗑️ Usuń</button>
        </div>
      </div>
    `;
  }).join("");
}

function deleteAlbum(albumName) {
  if (confirm(`Czy na pewno chcesz usunąć album "${albumName}"? Zdjęcia zostaną przeniesione do "Wszystkie".`)) {
    const albums = getAlbums().filter(a => a !== albumName);
    saveAlbums(albums);
    
    const photos = JSON.parse(localStorage.getItem("photos") || "[]");
    photos.forEach(photo => {
      if (photo.album === albumName) {
        photo.album = "Wszystkie";
      }
    });
    localStorage.setItem("photos", JSON.stringify(photos));
    
    updateAlbumSelectors();
    loadAlbumsList();
  }
}

updateAlbumSelectors();

// 🔹 OBSŁUGA KAMERY
const video = document.getElementById("camera");
const captureBtn = document.getElementById("captureBtn");
const canvas = document.getElementById("photoCanvas");
const gallery = document.getElementById("gallery");

let stream;

async function startCamera() {
  try {
    captureBtn.disabled = true;
    video.style.opacity = "0.5";

    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "environment" } 
    });
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

captureBtn.addEventListener("click", async () => {
  if (!video.videoWidth) {
    alert("Kamera jeszcze się nie uruchomiła!");
    return;
  }

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  ctx.drawImage(video, 0, 0);
  canvas.style.display = "block";

  const imgData = canvas.toDataURL("image/png");
  const selectedAlbum = document.getElementById("albumSelect").value;
  
  // Pobierz lokalizację
  let location = null;
  if ("geolocation" in navigator) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = pos.coords;
      
      // Reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        if (data.address) {
          const addr = data.address;
          location = {
            country: addr.country || "",
            city: addr.city || addr.town || addr.village || "",
            road: addr.road || "",
            houseNumber: addr.house_number || "",
            coords: { latitude, longitude }
          };
        }
      } catch (err) {
        location = { coords: { latitude, longitude } };
      }
    } catch (err) {
      console.log("Nie udało się pobrać lokalizacji");
    }
  }
  
  savePhoto(imgData, selectedAlbum, location);
  notifyUser("Zdjęcie zapisane w albumie: " + selectedAlbum);
  
  setTimeout(() => {
    canvas.style.display = "none";
  }, 2000);
});

// 🔹 POWIADOMIENIA
function notifyUser(msg) {
  const notificationsEnabled = localStorage.getItem("notificationsEnabled");
  if (notificationsEnabled === "false") return;

  if (Notification.permission === "granted") {
    new Notification(msg);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") new Notification(msg);
    });
  }
}

// 🔹 GALERIA Z ALBUMAMI
function savePhoto(data, album = "Wszystkie", location = null) {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  photos.push({
    data: data,
    timestamp: Date.now(),
    album: album,
    location: location
  });
  localStorage.setItem("photos", JSON.stringify(photos));
}

function loadGallery() {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  const selectedAlbum = document.getElementById("galleryAlbumFilter").value;
  
  let filteredPhotos = selectedAlbum === "Wszystkie" 
    ? photos 
    : photos.filter(p => p.album === selectedAlbum);
  
  const photoCount = document.getElementById("photoCount");
  const emptyGallery = document.getElementById("emptyGallery");
  
  photoCount.textContent = `${filteredPhotos.length} ${filteredPhotos.length === 1 ? 'zdjęcie' : 'zdjęć'}`;
  
  if (filteredPhotos.length === 0) {
    gallery.innerHTML = "";
    emptyGallery.classList.remove("hidden");
    return;
  }
  
  emptyGallery.classList.add("hidden");
  gallery.innerHTML = "";

  filteredPhotos.forEach((photo, index) => {
    const originalIndex = photos.indexOf(photo);
    renderPhotoBox(photo, originalIndex, gallery);
  });
}

function renderPhotoBox(photo, originalIndex, container) {
  const box = document.createElement("div");
  box.classList.add("photo-box");

  if (photo.album !== "Wszystkie") {
    const badge = document.createElement("div");
    badge.classList.add("photo-album-badge");
    badge.textContent = photo.album;
    box.appendChild(badge);
  }

  const img = document.createElement("img");
  img.src = photo.data;
  img.classList.add("gallery-photo");
  img.addEventListener("click", () => openPhotoModal(originalIndex));

  const date = document.createElement("div");
  date.classList.add("photo-date");
  const d = new Date(photo.timestamp);
  date.textContent = `${d.toLocaleDateString('pl-PL')} ${d.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}`;

  const actions = document.createElement("div");
  actions.classList.add("photo-actions");

  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑️ Usuń";
  delBtn.classList.add("delete-photo-btn");
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deletePhoto(originalIndex);
  });

  actions.appendChild(delBtn);
  box.appendChild(img);
  box.appendChild(date);
  box.appendChild(actions);
  container.appendChild(box);
}

document.getElementById("galleryAlbumFilter").addEventListener("change", loadGallery);

function deletePhoto(idx) {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  photos.splice(idx, 1);
  localStorage.setItem("photos", JSON.stringify(photos));
  loadGallery();
}

// 🔹 PHOTO MODAL Z EDYCJĄ
const modal = document.getElementById("photoModal");
const modalImage = document.getElementById("modalImage");
const modalAlbum = document.getElementById("modalAlbum");
const modalDate = document.getElementById("modalDate");
const modalClose = document.querySelector(".modal-close");
const modalBackdrop = document.querySelector(".modal-backdrop");

const rotateBtn = document.getElementById("rotateBtn");
const filterBtn = document.getElementById("filterBtn");
const textBtn = document.getElementById("textBtn");

let currentPhotoIndex = null;
let currentRotation = 0;

function openPhotoModal(index) {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  const photo = photos[index];
  
  currentPhotoIndex = index;
  currentRotation = photo.rotation || 0;
  
  modalImage.src = photo.data;
  modalImage.style.transform = `rotate(${currentRotation}deg)`;
  
  modalAlbum.textContent = photo.album !== "Wszystkie" ? `📁 Album: ${photo.album}` : "";
  
  const date = new Date(photo.timestamp);
  modalDate.textContent = `📅 ${date.toLocaleDateString('pl-PL')} ${date.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}`;
  
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  currentPhotoIndex = null;
}

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);

// OBRÓĆ ZDJĘCIE
rotateBtn.addEventListener("click", () => {
  if (currentPhotoIndex === null) return;
  
  currentRotation = (currentRotation + 90) % 360;
  modalImage.style.transform = `rotate(${currentRotation}deg)`;
  
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  photos[currentPhotoIndex].rotation = currentRotation;
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = photos[currentPhotoIndex].data;
  
  img.onload = () => {
    if (currentRotation === 90 || currentRotation === 270) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((currentRotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    photos[currentPhotoIndex].data = canvas.toDataURL("image/png");
    localStorage.setItem("photos", JSON.stringify(photos));
    
    loadGallery();
  };
});

// FILTRY
const filterModal = document.getElementById("filterModal");
const closeFilterModal = document.getElementById("closeFilterModal");

filterBtn.addEventListener("click", () => {
  filterModal.classList.remove("hidden");
});

closeFilterModal.addEventListener("click", () => {
  filterModal.classList.add("hidden");
});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentPhotoIndex === null) return;
    
    const filterType = btn.dataset.filter;
    applyFilter(filterType);
    filterModal.classList.add("hidden");
  });
});

function applyFilter(filterType) {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  const photo = photos[currentPhotoIndex];
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = photo.data;
  
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    switch(filterType) {
      case "grayscale":
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        break;
      case "sepia":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;
      case "invert":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
        break;
      case "brightness":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.3);
          data[i + 1] = Math.min(255, data[i + 1] * 1.3);
          data[i + 2] = Math.min(255, data[i + 2] * 1.3);
        }
        break;
      case "contrast":
        const factor = 1.5;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
        break;
      case "blur":
        const tempData = new Uint8ClampedArray(data);
        for (let i = 4; i < data.length - 4; i += 4) {
          data[i] = (tempData[i - 4] + tempData[i] + tempData[i + 4]) / 3;
          data[i + 1] = (tempData[i - 3] + tempData[i + 1] + tempData[i + 5]) / 3;
          data[i + 2] = (tempData[i - 2] + tempData[i + 2] + tempData[i + 6]) / 3;
        }
        break;
    }
    
    ctx.putImageData(imageData, 0, 0);
    photos[currentPhotoIndex].data = canvas.toDataURL("image/png");
    localStorage.setItem("photos", JSON.stringify(photos));
    
    modalImage.src = photos[currentPhotoIndex].data;
    loadGallery();
  };
}

// DODAJ TEKST
const textModal = document.getElementById("textModal");
const photoText = document.getElementById("photoText");
const textColor = document.getElementById("textColor");
const cancelText = document.getElementById("cancelText");
const saveText = document.getElementById("saveText");

textBtn.addEventListener("click", () => {
  textModal.classList.remove("hidden");
  photoText.value = "";
  photoText.focus();
});

cancelText.addEventListener("click", () => {
  textModal.classList.add("hidden");
});

saveText.addEventListener("click", () => {
  if (currentPhotoIndex === null || !photoText.value.trim()) return;
  
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  const photo = photos[currentPhotoIndex];
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = photo.data;
  
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    ctx.font = `${Math.floor(img.width / 15)}px Arial`;
    ctx.fillStyle = textColor.value;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    
    const text = photoText.value;
    const x = canvas.width / 2;
    const y = canvas.height - 50;
    
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    
    photos[currentPhotoIndex].data = canvas.toDataURL("image/png");
    localStorage.setItem("photos", JSON.stringify(photos));
    
    modalImage.src = photos[currentPhotoIndex].data;
    textModal.classList.add("hidden");
    
    loadGallery();
  };
});

// 🔹 EKSPORT DO PDF Z LOKALIZACJĄ
const exportPdfBtn = document.getElementById("exportPdfBtn");
const exportAlbumSelect = document.getElementById("exportAlbumSelect");

exportPdfBtn.addEventListener("click", async () => {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  const selectedAlbum = exportAlbumSelect.value;
  
  const filteredPhotos = selectedAlbum === "Wszystkie" 
    ? photos 
    : photos.filter(p => p.album === selectedAlbum);
  
  if (filteredPhotos.length === 0) {
    alert("Brak zdjęć do eksportu!");
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  
  for (let i = 0; i < filteredPhotos.length; i++) {
    const photo = filteredPhotos[i];
    
    if (i > 0) pdf.addPage();
    
    pdf.addImage(photo.data, 'PNG', 10, 10, 190, 120);
    
    const date = new Date(photo.timestamp);
    let yPos = 140;
    
    pdf.setFontSize(10);
    pdf.text(`Album: ${photo.album}`, 10, yPos);
    yPos += 5;
    
    pdf.text(`Data: ${date.toLocaleDateString('pl-PL')} ${date.toLocaleTimeString('pl-PL')}`, 10, yPos);
    yPos += 5;
    
    if (photo.location) {
      const loc = photo.location;
      if (loc.country || loc.city) {
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Lokalizacja:`, 10, yPos);
        yPos += 4;
        
        if (loc.country && loc.city) {
          pdf.text(`  ${loc.country}, ${loc.city}`, 10, yPos);
          yPos += 4;
        }
        
        if (loc.road) {
          const address = `  ${loc.road}${loc.houseNumber ? ' ' + loc.houseNumber : ''}`;
          pdf.text(address, 10, yPos);
          yPos += 4;
        }
        
        if (loc.coords) {
          pdf.text(`  GPS: ${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`, 10, yPos);
        }
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
      }
    }
  }
  
  pdf.save(`${selectedAlbum}_${Date.now()}.pdf`);
});

// 🔹 MOTYWY KOLORYSTYCZNE
const themeButtons = document.querySelectorAll(".theme-btn");

const savedTheme = localStorage.getItem("theme") || "purple";
document.body.classList.add(`theme-${savedTheme}`);
document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`)?.classList.add("active");

themeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const theme = btn.dataset.theme;
    
    document.body.classList.remove("theme-purple", "theme-blue", "theme-green", "theme-pink", "theme-orange");
    document.body.classList.add(`theme-${theme}`);
    
    themeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    localStorage.setItem("theme", theme);
  });
});

// 🔹 OFFLINE
window.addEventListener("online", () =>
  document.getElementById("offlineBanner").classList.add("hidden")
);

window.addEventListener("offline", () =>
  document.getElementById("offlineBanner").classList.remove("hidden")
);

// 🔹 CIEMNY MOTYW
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

// 🔹 POWIADOMIENIA USTAWIENIA
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

// MODAL BACKDROPS
createAlbumModal.querySelector(".modal-backdrop").addEventListener("click", () => {
  createAlbumModal.classList.add("hidden");
});

filterModal.querySelector(".modal-backdrop").addEventListener("click", () => {
  filterModal.classList.add("hidden");
});

textModal.querySelector(".modal-backdrop").addEventListener("click", () => {
  textModal.classList.add("hidden");
});

// INICJALIZACJA
updateStats();