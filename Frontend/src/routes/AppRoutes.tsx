import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';
import ClientDashboard from '../pages/Dashboard/ClientDashboard';
import VendeurDashboard from '../pages/Dashboard/VendeurDashboard';
import AnalysteDashboard from '../pages/Dashboard/AnalysteDashboard';
import ProductList from '../pages/Products/ProductList';
import SalesManagement from '../pages/Sales/SalesManagement';
import LandingPage from '../pages/LandingPage';
import NotFound from '../pages/NotFound';
import Login from '../components/Login';
import Signup from '../components/Signup';

const AppRoutes = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
  const userRole = user?.role?.toLowerCase();

  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {isAuthenticated ? (
          <>
            {/* Routes avec DashboardLayout selon le rôle */}
            <Route element={<DashboardLayout />}>
              {/* Route dashboard par défaut selon le rôle */}
              <Route path="/dashboard" element={
                userRole === 'admin' ? <AdminDashboard /> :
                userRole === 'client' ? <ClientDashboard /> :
                userRole === 'vendeur' ? <VendeurDashboard /> :
                userRole === 'analyste' ? <AnalysteDashboard /> :
                <Dashboard />
              } />
              
              {/* Routes analytics - Accessibles à tous pour le développement */}
              <Route path="/dashboard/analyste" element={<AnalysteDashboard />} />
              <Route path="/analytics" element={<AnalysteDashboard />} />
              <Route path="/analytics/produits" element={<AnalysteDashboard />} />
              <Route path="/analytics/ventes" element={<AnalysteDashboard />} />
              <Route path="/analytics/clients" element={<AnalysteDashboard />} />
              <Route path="/analytics/categories" element={<AnalysteDashboard />} />
              <Route path="/analytics/etl" element={<AnalysteDashboard />} />
              <Route path="/analytics/rapports" element={<AnalysteDashboard />} />
              
              {/* Routes spécifiques admin/vendeur */}
              {(userRole === 'admin' || userRole === 'vendeur') && (
                <>
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/sales" element={<SalesManagement />} />
                </>
              )}
              
              {/* Routes spécifiques client */}
              {userRole === 'client' && (
                <Route path="/shop" element={<ClientDashboard />} />
              )}
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
