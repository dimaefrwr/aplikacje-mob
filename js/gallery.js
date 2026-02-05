import { showConfirm } from './utils.js';

export class GalleryManager {
  constructor() {
    this.gallery = document.getElementById("gallery");
    this.galleryAlbumFilter = document.getElementById("galleryAlbumFilter");
    this.photoCount = document.getElementById("photoCount");
    this.emptyGallery = document.getElementById("emptyGallery");
  }
  
  init() {
    this.galleryAlbumFilter.addEventListener("change", () => this.loadGallery());
    window.addEventListener('loadGallery', () => this.loadGallery());
  }
  
  loadGallery() {
    const photos = JSON.parse(localStorage.getItem("photos") || "[]");
    const selectedAlbum = this.galleryAlbumFilter.value;
    
    let filteredPhotos = selectedAlbum === "Wszystkie" 
      ? photos 
      : photos.filter(p => p.album === selectedAlbum);
    
    this.photoCount.textContent = `${filteredPhotos.length} ${filteredPhotos.length === 1 ? 'zdjęcie' : 'zdjęć'}`;
    
    if (filteredPhotos.length === 0) {
      this.gallery.innerHTML = "";
      this.emptyGallery.classList.remove("hidden");
      return;
    }
    
    this.emptyGallery.classList.add("hidden");
    this.gallery.innerHTML = "";

    filteredPhotos.forEach((photo, index) => {
      const originalIndex = photos.indexOf(photo);
      this.renderPhotoBox(photo, originalIndex);
    });
  }
  
  renderPhotoBox(photo, originalIndex) {
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
    img.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent('openPhotoModal', { detail: originalIndex }));
    });

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
      this.deletePhoto(originalIndex);
    });

    actions.appendChild(delBtn);
    box.appendChild(img);
    box.appendChild(date);
    box.appendChild(actions);
    this.gallery.appendChild(box);
  }
  
  deletePhoto(idx) {
    showConfirm(
      'Usuwanie zdjęcia',
      'Czy na pewno chcesz usunąć to zdjęcie?',
      () => {
        const photos = JSON.parse(localStorage.getItem("photos") || "[]");
        photos.splice(idx, 1);
        localStorage.setItem("photos", JSON.stringify(photos));
        this.loadGallery();
      }
    );
  }
}