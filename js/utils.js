export function showModal(title, message, type = 'info') {
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  
  const content = document.createElement('div');
  content.className = 'modal-content-small';
  
  const icon = type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  
  const heading = document.createElement('h3');
  heading.textContent = `${icon} ${title}`;
  
  const text = document.createElement('p');
  text.textContent = message;
  
  const btn = document.createElement('button');
  btn.className = 'primary-btn-small';
  btn.textContent = 'OK';
  btn.addEventListener('click', () => modal.remove());
  
  content.appendChild(heading);
  content.appendChild(text);
  content.appendChild(btn);
  modal.appendChild(backdrop);
  modal.appendChild(content);
  
  backdrop.addEventListener('click', () => modal.remove());
  
  document.body.appendChild(modal);
}

export function showConfirm(title, message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  
  const content = document.createElement('div');
  content.className = 'modal-content-small';
  
  const heading = document.createElement('h3');
  heading.textContent = `❓ ${title}`;
  
  const text = document.createElement('p');
  text.textContent = message;
  
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'modal-buttons';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'secondary-btn';
  cancelBtn.textContent = 'Anuluj';
  cancelBtn.addEventListener('click', () => modal.remove());
  
  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'primary-btn-small';
  confirmBtn.textContent = 'Potwierdź';
  confirmBtn.addEventListener('click', () => {
    onConfirm();
    modal.remove();
  });
  
  buttonsDiv.appendChild(cancelBtn);
  buttonsDiv.appendChild(confirmBtn);
  content.appendChild(heading);
  content.appendChild(text);
  content.appendChild(buttonsDiv);
  modal.appendChild(backdrop);
  modal.appendChild(content);
  
  backdrop.addEventListener('click', () => modal.remove());
  
  document.body.appendChild(modal);
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Aktualizuj statystyki na stronie głównej
export function updateStats() {
  const photos = JSON.parse(localStorage.getItem("photos") || "[]");
  const albums = JSON.parse(localStorage.getItem("albums") || "[]").filter(a => a !== "Wszystkie");
  
  const totalPhotos = document.getElementById("totalPhotos");
  const totalAlbums = document.getElementById("totalAlbums");
  
  if (totalPhotos) totalPhotos.textContent = photos.length;
  if (totalAlbums) totalAlbums.textContent = albums.length;
}

// Wyświetl powiadomienie push
export function notifyUser(msg) {
  const notificationsEnabled = localStorage.getItem("notificationsEnabled");
  if (notificationsEnabled === "false") return;

  if (Notification.permission === "granted") {
    new Notification(msg);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") new Notification(msg);
    });
  }
}