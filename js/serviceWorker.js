export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
      .then(function(reg) {
        console.log("SW REGISTRATION OK");
      })
      .catch(function(err) {
        console.error("SW REGISTRATION FAILED:", err);
      });
  }
}