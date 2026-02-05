import { registerServiceWorker } from './serviceWorker.js';
import { updateStats } from './utils.js';
import { NavigationManager } from './navigation.js';
import { GeolocationManager } from './geolocation.js';
import { AlbumsManager } from './albums.js';
import { CameraManager } from './camera.js';
import { GalleryManager } from './gallery.js';
import { PhotoEditorManager } from './photoEditor.js';
import { SettingsManager } from './settings.js';

registerServiceWorker();

document.addEventListener('DOMContentLoaded', () => {
  const geolocation = new GeolocationManager();
  const navigation = new NavigationManager();
  const albums = new AlbumsManager();
  const camera = new CameraManager(geolocation);
  const gallery = new GalleryManager();
  const photoEditor = new PhotoEditorManager();
  const settings = new SettingsManager();
  
  geolocation.init();
  navigation.init();
  albums.init();
  camera.init();
  gallery.init();
  photoEditor.init();
  settings.init();
  
  updateStats();
  
  console.log("✅ Aplikacja zainicjalizowana");
});