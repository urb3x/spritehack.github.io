export class NotificationManager {
  constructor() {
    this.container = document.getElementById('notification-container');
  }

  show(title, message, type = 'info') {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `wurst-toast ${type === 'disabled' ? 'disabled' : ''}`;
    
    let icon = '⚡';
    if (type === 'success') icon = '✓';
    else if (type === 'disabled') icon = '✕';

    toast.innerHTML = `
      <span style="font-weight: 900; color: ${type === 'disabled' ? 'var(--wurst-red)' : 'var(--wurst-green)'};">${icon}</span>
      <div>
        <span style="font-weight: 800; color: #fff;">${title}</span>
        <span style="font-size: 11px; color: #9ca3af; margin-left: 4px;">${message}</span>
      </div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.2s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 200);
    }, 2000);
  }
}
