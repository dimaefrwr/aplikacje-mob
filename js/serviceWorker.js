export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(registration => {
        console.log("✅ Service Worker zarejestrowany:", registration.scope);
      })
      .catch(err => {
        console.error("❌ Błąd rejestracji SW:", err);
      });
  }
}