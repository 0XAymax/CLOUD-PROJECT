import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'vendeur' | 'analyste' | 'client' | 'investisseur')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Attendre que le chargement soit terminé
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard approprié si le rôle n'est pas autorisé
    switch (user.role) {
      case 'admin':
        return <Navigate to="/dashboard/admin" replace />;
      case 'vendeur':
        return <Navigate to="/dashboard/vendeur" replace />;
      case 'analyste':
        return <Navigate to="/dashboard/analyste" replace />;
      case 'client':
        return <Navigate to="/dashboard/client" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
