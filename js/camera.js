import { showModal, notifyUser } from './utils.js';

export class CameraManager {
  constructor(geolocationManager) {
    this.geolocation = geolocationManager;
    this.video = document.getElementById("camera");
    this.captureBtn = document.getElementById("captureBtn");
    this.canvas = document.getElementById("photoCanvas");
    this.cameraBtn = document.getElementById("cameraBtn");
    this.stream = null;
  }
  
  init() {
    this.cameraBtn.addEventListener("click", () => this.startCamera());
    this.captureBtn.addEventListener("click", () => this.capture());
  }
  
  async startCamera() {
    try {
      this.captureBtn.disabled = true;
      this.video.style.opacity = "0.5";

      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      this.video.srcObject = this.stream;

      this.video.onloadedmetadata = () => {
        console.log("🎥 Kamera gotowa:", this.video.videoWidth, this.video.videoHeight);
        this.captureBtn.disabled = false;
        this.video.style.opacity = "1";
      };
    } catch (err) {
      showModal('Błąd kamery', 'Brak dostępu do kamery', 'error');
    }
  }
  
  async capture() {
    if (!this.video.videoWidth) {
      showModal('Błąd', 'Kamera jeszcze się nie uruchomiła!', 'error');
      return;
    }

    const ctx = this.canvas.getContext("2d");
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    
    ctx.drawImage(this.video, 0, 0);
    this.canvas.style.display = "block";

    const imgData = this.canvas.toDataURL("image/png");
    const selectedAlbum = document.getElementById("albumSelect").value;
    
    // Pobierz lokalizację
    const location = await this.geolocation.getCurrentLocationForPhoto();
    
    this.savePhoto(imgData, selectedAlbum, location);
    notifyUser("Zdjęcie zapisane w albumie: " + selectedAlbum);
    
    setTimeout(() => {
      this.canvas.style.display = "none";
    }, 2000);
  }
  
  savePhoto(data, album = "Wszystkie", location = null) {
    const photos = JSON.parse(localStorage.getItem("photos") || "[]");
    photos.push({
      data: data,
      timestamp: Date.now(),
      album: album,
      location: location
    });
    localStorage.setItem("photos", JSON.stringify(photos));
  }
}