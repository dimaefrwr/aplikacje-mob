export class GeolocationManager {
  constructor() {
    this.locationOutput = document.getElementById("locationOutput");
    this.locationCard = document.getElementById("locationCard");
    this.latValue = document.getElementById("latValue");
    this.lngValue = document.getElementById("lngValue");
    this.accuracyValue = document.getElementById("accuracyValue");
    this.timeValue = document.getElementById("timeValue");
    this.mapsLink = document.getElementById("mapsLink");
    this.addressMain = document.getElementById("addressMain");
    this.addressDetails = document.getElementById("addressDetails");
  }
  
  init() {
    const getLocationBtn = document.getElementById("getLocation");
    if (getLocationBtn) {
      getLocationBtn.addEventListener("click", () => this.getLocation());
    }
  }
  
  getLocation() {
    this.locationOutput.textContent = "";
    this.locationCard.classList.add("hidden");
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.handleSuccess(pos),
        (error) => this.handleError(error)
      );
    } else {
      this.locationOutput.textContent = "Geolokalizacja nie jest wspierana.";
    }
  }
  
  async handleSuccess(pos) {
    const { latitude, longitude, accuracy } = pos.coords;
    const timestamp = new Date(pos.timestamp);
    
    this.latValue.textContent = latitude.toFixed(6) + "°";
    this.lngValue.textContent = longitude.toFixed(6) + "°";
    this.accuracyValue.textContent = Math.round(accuracy) + " metrów";
    this.timeValue.textContent = timestamp.toLocaleTimeString('pl-PL');
    
    this.locationCard.classList.remove("hidden");
    this.mapsLink.classList.remove("hidden");
    this.mapsLink.href = `https://www.google.com/maps?q=${latitude},${longitude}`;
    
    this.addressMain.textContent = "Wyszukiwanie adresu...";
    this.addressDetails.textContent = "";
    
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
        
        this.addressMain.textContent = `${country}${city ? ', ' + city : ''}`;
        this.addressDetails.textContent = `${road}${houseNumber ? ' ' + houseNumber : ''}`;
      } else {
        this.addressMain.textContent = "Nie udało się pobrać adresu";
      }
    } catch (error) {
      this.addressMain.textContent = "Błąd pobierania adresu (wymagany internet)";
    }
  }
  
  handleError(error) {
    this.locationOutput.textContent = "Nie udało się pobrać lokalizacji. " + 
      (error.code === 1 ? "Brak pozwolenia." : 
       error.code === 2 ? "Pozycja niedostępna." : 
       "Przekroczono limit czasu.");
  }

  async getCurrentLocationForPhoto() {
    if (!("geolocation" in navigator)) return null;
    
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = pos.coords;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        if (data.address) {
          const addr = data.address;
          return {
            country: addr.country || "",
            city: addr.city || addr.town || addr.village || "",
            road: addr.road || "",
            houseNumber: addr.house_number || "",
            coords: { latitude, longitude }
          };
        }
      } catch (err) {
        return { coords: { latitude, longitude } };
      }
    } catch (err) {
      console.log("Nie udało się pobrać lokalizacji");
      return null;
    }
  }
}