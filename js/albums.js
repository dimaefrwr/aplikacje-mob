import { showModal, showConfirm, updateStats } from './utils.js';

export class AlbumsManager {
  constructor() {
    this.createAlbumModal = document.getElementById("createAlbumModal");
    this.createAlbumBtn = document.getElementById("createAlbumBtn");
    this.cancelAlbumBtn = document.getElementById("cancelAlbumBtn");
    this.saveAlbumBtn = document.getElementById("saveAlbumBtn");
    this.newAlbumName = document.getElementById("newAlbumName");
    this.selectedEmojiInput = document.getElementById("selectedEmoji");
  }
  
  init() {
    this.updateAlbumSelectors();
    
    // Create album modal
    this.createAlbumBtn.addEventListener("click", () => this.openCreateModal());
    this.cancelAlbumBtn.addEventListener("click", () => this.closeCreateModal());
    this.saveAlbumBtn.addEventListener("click", () => this.saveAlbum());
    
    document.querySelectorAll(".emoji-option").forEach(option => {
      option.addEventListener("click", () => {
        document.querySelectorAll(".emoji-option").forEach(e => e.classList.remove("selected"));
        option.classList.add("selected");
        this.selectedEmojiInput.value = option.dataset.emoji;
      });
    });
    
    // Modal backdrop
    this.createAlbumModal.querySelector(".modal-backdrop").addEventListener("click", () => {
      this.closeCreateModal();
    });
    
    // Load albums list listener
    window.addEventListener('loadAlbumsList', () => this.loadAlbumsList());
  }
  
  getAlbums() {
    const albums = JSON.parse(localStorage.getItem("albums") || '[]');
    if (!albums.includes("Wszystkie")) {
      albums.unshift("Wszystkie");
    }
    return albums;
  }
  
  saveAlbums(albums) {
    localStorage.setItem("albums", JSON.stringify(albums));
  }
  
  updateAlbumSelectors() {
    const albums = this.getAlbums();
    
    const albumSelect = document.getElementById("albumSelect");
    const galleryAlbumFilter = document.getElementById("galleryAlbumFilter");
    const exportAlbumSelect = document.getElementById("exportAlbumSelect");
    
    [albumSelect, galleryAlbumFilter, exportAlbumSelect].forEach(select => {
      if (!select) return;
      
      // ✅ Bezpieczne czyszczenie - zamiast innerHTML = ''
      select.replaceChildren();
      
      albums.forEach(album => {
        const option = document.createElement('option');
        option.value = album;
        option.textContent = `${this.getAlbumEmoji(album)} ${album}`;
        select.appendChild(option);
      });
    });
  }
  
  getAlbumEmoji(albumName) {
    const emojis = JSON.parse(localStorage.getItem("albumEmojis") || "{}");
    return emojis[albumName] || "📁";
  }
  
  setAlbumEmoji(albumName, emoji) {
    const emojis = JSON.parse(localStorage.getItem("albumEmojis") || "{}");
    emojis[albumName] = emoji;
    localStorage.setItem("albumEmojis", JSON.stringify(emojis));
  }
  
  openCreateModal() {
    this.createAlbumModal.classList.remove("hidden");
    this.newAlbumName.value = "";
    this.selectedEmojiInput.value = "📁";
    
    document.querySelectorAll(".emoji-option").forEach(e => e.classList.remove("selected"));
    const defaultEmoji = document.querySelector('.emoji-option[data-emoji="📁"]');
    if (defaultEmoji) defaultEmoji.classList.add("selected");
    
    this.newAlbumName.focus();
  }
  
  closeCreateModal() {
    this.createAlbumModal.classList.add("hidden");
  }
  
  saveAlbum() {
    const albumName = this.newAlbumName.value.trim();
    const emoji = this.selectedEmojiInput.value;
    
    if (albumName && albumName !== "Wszystkie") {
      const albums = this.getAlbums();
      if (!albums.includes(albumName)) {
        albums.push(albumName);
        this.saveAlbums(albums);
        this.setAlbumEmoji(albumName, emoji);
        
        this.updateAlbumSelectors();
        this.closeCreateModal();
      } else {
        showModal('Błąd', 'Album o tej nazwie już istnieje!', 'error');
      }
    }
  }
  
  loadAlbumsList() {
    const albums = this.getAlbums().filter(a => a !== "Wszystkie");
    const albumsList = document.getElementById("albumsList");
    
    if (!albumsList) return;
    
    if (albums.length === 0) {
      // ✅ Bezpieczne czyszczenie i dodawanie
      albumsList.replaceChildren();
      const emptyMsg = document.createElement('p');
      emptyMsg.style.color = '#666';
      emptyMsg.textContent = 'Brak utworzonych albumów';
      albumsList.appendChild(emptyMsg);
      return;
    }
    
    // ✅ Bezpieczne czyszczenie
    albumsList.replaceChildren();
    
    albums.forEach(album => {
      const photos = JSON.parse(localStorage.getItem("photos") || "[]");
      const count = photos.filter(p => p.album === album).length;
      const emoji = this.getAlbumEmoji(album);
      
      const item = document.createElement('div');
      item.className = 'album-item';
      
      const leftDiv = document.createElement('div');
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'album-name';
      nameSpan.textContent = `${emoji} ${album}`;
      
      const countSpan = document.createElement('span');
      countSpan.className = 'album-count';
      countSpan.textContent = `(${count} zdjęć)`;
      
      leftDiv.appendChild(nameSpan);
      leftDiv.appendChild(countSpan);
      
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'album-actions';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-album-btn';
      deleteBtn.textContent = '🗑️ Usuń';
      deleteBtn.addEventListener('click', () => this.deleteAlbum(album));
      
      actionsDiv.appendChild(deleteBtn);
      item.appendChild(leftDiv);
      item.appendChild(actionsDiv);
      albumsList.appendChild(item);
    });
  }
  
  deleteAlbum(albumName) {
    showConfirm(
      'Usuwanie albumu',
      `Czy na pewno chcesz usunąć album "${albumName}"? Zdjęcia zostaną przeniesione do "Wszystkie".`,
      () => {
        const albums = this.getAlbums().filter(a => a !== albumName);
        this.saveAlbums(albums);
        
        const photos = JSON.parse(localStorage.getItem("photos") || "[]");
        photos.forEach(photo => {
          if (photo.album === albumName) {
            photo.album = "Wszystkie";
          }
        });
        localStorage.setItem("photos", JSON.stringify(photos));
        
        this.updateAlbumSelectors();
        this.loadAlbumsList();
        updateStats();
      }
    );
  }
}