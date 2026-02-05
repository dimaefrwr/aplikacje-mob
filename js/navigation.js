import { updateStats } from './utils.js';

export class NavigationManager {
  constructor() {
    this.views = document.querySelectorAll(".view");
    this.homeBtn = document.getElementById("homeBtn");
    this.cameraBtn = document.getElementById("cameraBtn");
    this.galleryBtn = document.getElementById("galleryBtn");
    this.settingsBtn = document.getElementById("settingsBtn");
    
    this.navBtns = [this.homeBtn, this.cameraBtn, this.galleryBtn, this.settingsBtn];
  }
  
  init() {
    this.homeBtn.addEventListener("click", () => this.showView("homeView", this.homeBtn));
    this.cameraBtn.addEventListener("click", () => this.showView("cameraView", this.cameraBtn));
    this.galleryBtn.addEventListener("click", () => this.showView("galleryView", this.galleryBtn));
    this.settingsBtn.addEventListener("click", () => this.showView("settingsView", this.settingsBtn));
  }
  
  showView(id, activeBtn) {
    this.views.forEach(v => v.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    
    this.navBtns.forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
    
    // Trigger odpowiednie akcje dla widoków
    if (id === "homeView") {
      updateStats();
    }
    if (id === "galleryView") {
      window.dispatchEvent(new CustomEvent('loadGallery'));
    }
    if (id === "settingsView") {
      window.dispatchEvent(new CustomEvent('loadAlbumsList'));
    }
  }
}