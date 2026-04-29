type AlertType = 'success' | 'error' | 'warning' | 'info';

export const alertService = {
  show: (message: string, type: AlertType = 'info') => {
    // Simple implementation - could be replaced with a proper toast library
    const alertDiv = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
    };

    alertDiv.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(alertDiv);
      }, 300);
    }, 3000);
  },

  success: (message: string) => alertService.show(message, 'success'),
  error: (message: string) => alertService.show(message, 'error'),
  warning: (message: string) => alertService.show(message, 'warning'),
  info: (message: string) => alertService.show(message, 'info'),
};
