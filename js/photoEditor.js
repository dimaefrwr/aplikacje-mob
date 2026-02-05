export class PhotoEditorManager {
  constructor() {
    this.modal = document.getElementById("photoModal");
    this.modalImage = document.getElementById("modalImage");
    this.modalAlbum = document.getElementById("modalAlbum");
    this.modalDate = document.getElementById("modalDate");
    this.modalClose = document.querySelector(".modal-close");
    this.modalBackdrop = this.modal.querySelector(".modal-backdrop");
    
    this.rotateBtn = document.getElementById("rotateBtn");
    this.filterBtn = document.getElementById("filterBtn");
    this.textBtn = document.getElementById("textBtn");
    
    this.filterModal = document.getElementById("filterModal");
    this.closeFilterModal = document.getElementById("closeFilterModal");
    
    this.textModal = document.getElementById("textModal");
    this.photoText = document.getElementById("photoText");
    this.textColor = document.getElementById("textColor");
    this.cancelText = document.getElementById("cancelText");
    this.saveText = document.getElementById("saveText");
    
    this.currentPhotoIndex = null;
    this.currentRotation = 0;
  }
  
  init() {
    window.addEventListener('openPhotoModal', (e) => this.openPhotoModal(e.detail));
    
    this.modalClose.addEventListener("click", () => this.closeModal());
    this.modalBackdrop.addEventListener("click", () => this.closeModal());
    
    this.rotateBtn.addEventListener("click", () => this.rotatePhoto());
    this.filterBtn.addEventListener("click", () => this.openFilterModal());
    this.textBtn.addEventListener("click", () => this.openTextModal());
    
    // Filter modal
    this.closeFilterModal.addEventListener("click", () => this.closeFilterModal_func());
    this.filterModal.querySelector(".modal-backdrop").addEventListener("click", () => this.closeFilterModal_func());
    
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (this.currentPhotoIndex === null) return;
        const filterType = btn.dataset.filter;
        this.applyFilter(filterType);
        this.closeFilterModal_func();
      });
    });
    
    // Text modal
    this.cancelText.addEventListener("click", () => this.closeTextModal());
    this.saveText.addEventListener("click", () => this.saveTextToPhoto());
    this.textModal.querySelector(".modal-backdrop").addEventListener("click", () => this.closeTextModal());
  }
  
  openPhotoModal(index) {
    const photos = JSON.parse(localStorage.getItem("photos") || "[]");
    const photo = photos[index];
    
    this.currentPhotoIndex = index;
    this.currentRotation = photo.rotation || 0;
    
    this.modalImage.src = photo.data;
    this.modalImage.style.transform = `rotate(${this.currentRotation}deg)`;
    
    this.modalAlbum.textContent = photo.album !== "Wszystkie" ? `📁 Album: ${photo.album}` : "";
    
    const date = new Date(photo.timestamp);
    this.modalDate.textContent = `📅 ${date.toLocaleDateString('pl-PL')} ${date.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}`;
    
    this.modal.classList.remove("hidden");
  }
  
  closeModal() {
    this.modal.classList.add("hidden");
    this.currentPhotoIndex = null;
  }
  
  rotatePhoto() {
    if (this.currentPhotoIndex === null) return;
    
    this.currentRotation = (this.currentRotation + 90) % 360;
    this.modalImage.style.transform = `rotate(${this.currentRotation}deg)`;
    
    const photos = JSON.parse(localStorage.getItem("photos") || "[]");
    photos[this.currentPhotoIndex].rotation = this.currentRotation;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = photos[this.currentPhotoIndex].data;
    
    img.onload = () => {
      if (this.currentRotation === 90 || this.currentRotation === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((this.currentRotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      photos[this.currentPhotoIndex].data = canvas.toDataURL("image/png");
      localStorage.setItem("photos", JSON.stringify(photos));
      
      window.dispatchEvent(new Event('loadGallery'));
    };
  }
  
  openFilterModal() {
    this.filterModal.classList.remove("hidden");
  }
  
  closeFilterModal_func() {
    this.filterModal.classList.add("hidden");
  }
  
  applyFilter(filterType) {
    const photos = JSON.parse(localStorage.getItem("photos") || "[]");
    const photo = photos[this.currentPhotoIndex];
    
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
      photos[this.currentPhotoIndex].data = canvas.toDataURL("image/png");
      localStorage.setItem("photos", JSON.stringify(photos));
      
      this.modalImage.src = photos[this.currentPhotoIndex].data;
      window.dispatchEvent(new Event('loadGallery'));
    };
  }
  
  openTextModal() {
    this.textModal.classList.remove("hidden");
    this.photoText.value = "";
    this.photoText.focus();
  }
  
  closeTextModal() {
    this.textModal.classList.add("hidden");
  }
  
  saveTextToPhoto() {
    if (this.currentPhotoIndex === null || !this.photoText.value.trim()) return;
    
    const photos = JSON.parse(localStorage.getItem("photos") || "[]");
    const photo = photos[this.currentPhotoIndex];
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = photo.data;
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      ctx.font = `${Math.floor(img.width / 15)}px Arial`;
      ctx.fillStyle = this.textColor.value;
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      
      const text = this.photoText.value;
      const x = canvas.width / 2;
      const y = canvas.height - 50;
      
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
      
      photos[this.currentPhotoIndex].data = canvas.toDataURL("image/png");
      localStorage.setItem("photos", JSON.stringify(photos));
      
      this.modalImage.src = photos[this.currentPhotoIndex].data;
      this.closeTextModal();
      
      window.dispatchEvent(new Event('loadGallery'));
    };
  }
}