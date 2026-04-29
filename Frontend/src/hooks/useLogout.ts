import { useAuth } from '../contexts/AuthContext';

export const useLogout = () => {
  const { logout } = useAuth();

  const handleLogout = (showConfirm: boolean = true) => {
    console.log('🚪 handleLogout appelé avec showConfirm:', showConfirm);
    
    if (showConfirm) {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
      console.log('✅ Confirmation:', confirmed);
      
      if (confirmed) {
        console.log('🔓 Déconnexion en cours...');
        logout();
      }
    } else {
      console.log('🔓 Déconnexion directe...');
      logout();
    }
  };

  return { handleLogout };
};
