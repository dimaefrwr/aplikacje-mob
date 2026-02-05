import { showModal, updateStats } from './utils.js';

export class SettingsManager {
  constructor() {
    this.themeButtons = document.querySelectorAll(".theme-btn");
    this.darkModeToggle = document.getElementById("darkModeToggle");
    this.notificationsToggle = document.getElementById("notificationsToggle");
    this.exportPdfBtn = document.getElementById("exportPdfBtn");
    this.exportAlbumSelect = document.getElementById("exportAlbumSelect");
  }
  
  init() {
    this.initThemes();
    this.initDarkMode();
    this.initNotifications();
    this.initExport();
    this.initOnlineOffline();
  }
  
  initThemes() {
    const savedTheme = localStorage.getItem("theme") || "purple";
    document.body.classList.add(`theme-${savedTheme}`);
    const activeBtn = document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    this.themeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const theme = btn.dataset.theme;
        
        document.body.classList.remove("theme-purple", "theme-blue", "theme-green", "theme-pink", "theme-orange");
        document.body.classList.add(`theme-${theme}`);
        
        this.themeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        localStorage.setItem("theme", theme);
      });
    });
  }
  
  initDarkMode() {
    const darkModeEnabled = localStorage.getItem("darkMode") === "true";
    if (darkModeEnabled) {
      document.body.classList.add("dark-mode");
      this.darkModeToggle.checked = true;
    }

    this.darkModeToggle.addEventListener("change", (e) => {
      if (e.target.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "true");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "false");
      }
    });
  }
  
  initNotifications() {
    const notificationsEnabled = localStorage.getItem("notificationsEnabled");
    if (notificationsEnabled === null) {
      localStorage.setItem("notificationsEnabled", "true");
      this.notificationsToggle.checked = true;
    } else {
      this.notificationsToggle.checked = notificationsEnabled === "true";
    }

    this.notificationsToggle.addEventListener("change", (e) => {
      localStorage.setItem("notificationsEnabled", e.target.checked ? "true" : "false");
      
      if (e.target.checked && Notification.permission === "default") {
        Notification.requestPermission();
      }
    });
  }
  
  initExport() {
    this.exportPdfBtn.addEventListener("click", async () => {
      const photos = JSON.parse(localStorage.getItem("photos") || "[]");
      const selectedAlbum = this.exportAlbumSelect.value;
      
      const filteredPhotos = selectedAlbum === "Wszystkie" 
        ? photos 
        : photos.filter(p => p.album === selectedAlbum);
      
      if (filteredPhotos.length === 0) {
        showModal('Błąd', 'Brak zdjęć do eksportu!', 'error');
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
      showModal('Sukces', 'PDF został wygenerowany!', 'success');
    });
  }
  
  initOnlineOffline() {
    window.addEventListener("online", () =>
      document.getElementById("offlineBanner").classList.add("hidden")
    );

    window.addEventListener("offline", () =>
      document.getElementById("offlineBanner").classList.remove("hidden")
    );
  }
}