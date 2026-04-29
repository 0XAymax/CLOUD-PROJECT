import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Header from './components/Header';
import Footer from './components/Footer';

import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import NotFound from './pages/NotFound';

// Dashboards
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import VendeurDashboard from './pages/Dashboard/VendeurDashboard';
import AnalysteDashboard from './pages/Dashboard/AnalysteDashboard';
import ClientDashboard from './pages/Dashboard/ClientDashboard';
import InvestisseurDashboard from './pages/Dashboard/InvestisseurDashboard';
import CatalogueInvestisseur from './pages/Dashboard/CatalogueInvestisseur';

// Gestion
import GestionRoles from './pages/Gestion/GestionRoles';
import GestionEmployes from './pages/Gestion/GestionEmployes';
import GestionCategories from './pages/Gestion/GestionCategories';
import GestionInvestisseurs from './pages/Gestion/GestionInvestisseurs';
import GestionInvestissements from './pages/Gestion/GestionInvestissements';
import GestionProduits from './pages/Gestion/GestionProduits';
import GestionClients from './pages/Gestion/GestionClients';
import GestionVentes from './pages/Gestion/GestionVentes';

// Others
import ProductList from './pages/Products/ProductList';
import SalesManagement from './pages/Sales/SalesManagement';

import ProfilePage from './pages/Profile/ProfilePage';

import './App.css';
import './assets/styles/global.css';

const DashboardRedirect = () => {
  const storedUser = localStorage.getItem('user');
  const role = storedUser ? (JSON.parse(storedUser)?.role as string | undefined)?.toLowerCase() : undefined;

  switch (role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'vendeur':
      return <Navigate to="/gestion/ventes" replace />;
    case 'analyste':
      return <Navigate to="/dashboard/analyste" replace />;
    case 'client':
      return <Navigate to="/dashboard/client" replace />;
    case 'investisseur':
      return <Navigate to="/dashboard/investisseur" replace />;
    default:
      return <Navigate to="/dashboard/client" replace />;
  }
};

const App = () => {
  console.log('🚀 App component is rendering...');

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Routes>
          {/* ================= PUBLIC ================= */}
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={
              <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                <Header />
                <div className="flex-1 flex items-center justify-center py-12">
                  <Login />
                </div>
                <Footer />
              </div>
            }
          />
          <Route
            path="/signup"
            element={
              <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                <Header />
                <div className="flex-1 flex items-center justify-center py-12">
                  <Signup />
                </div>
                <Footer />
              </div>
            }
          />

          {/* ================= DASHBOARD LAYOUT ================= */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* /dashboard (générique) -> redirection selon rôle */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Dashboards */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/vendeur"
              element={
                <ProtectedRoute allowedRoles={['vendeur']}>
                  <VendeurDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analyste"
              element={
                <ProtectedRoute allowedRoles={['analyste']}>
                  <AnalysteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['analyste']}>
                  <AnalysteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/produits"
              element={
                <ProtectedRoute allowedRoles={['analyste']}>
                  <AnalysteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/ventes"
              element={
                <ProtectedRoute allowedRoles={['analyste']}>
                  <AnalysteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/clients"
              element={
                <ProtectedRoute allowedRoles={['analyste']}>
                  <AnalysteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/categories"
              element={
                <ProtectedRoute allowedRoles={['analyste']}>
                  <AnalysteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/rapports"
              element={
                <ProtectedRoute allowedRoles={['analyste']}>
                  <AnalysteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/etl"
              element={
                <ProtectedRoute allowedRoles={['analyste']}>
                  <AnalysteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/etl"
              element={
                <ProtectedRoute allowedRoles={['analyste']}>
                  <AnalysteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/client"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/investisseur"
              element={
                <ProtectedRoute allowedRoles={['investisseur']}>
                  <InvestisseurDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/catalogue/investisseur"
              element={
                <ProtectedRoute allowedRoles={['investisseur']}>
                  <CatalogueInvestisseur />
                </ProtectedRoute>
              }
            />

            {/* Gestion (Admin only) */}
            <Route
              path="/gestion/roles"
              element={<GestionRoles />}
            />
            <Route
              path="/gestion/employes"
              element={<GestionEmployes />}
            />
            <Route
              path="/gestion/categories"
              element={<GestionCategories />}
            />
            <Route
              path="/gestion/investisseurs"
              element={<GestionInvestisseurs />}
            />
            <Route
              path="/gestion/investissements"
              element={<GestionInvestissements />}
            />
            <Route
              path="/gestion/produits"
              element={<GestionProduits />}
            />
            <Route
              path="/gestion/clients"
              element={<GestionClients />}
            />
            <Route
              path="/gestion/ventes"
              element={<GestionVentes />}
            />

            {/* Others */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/sales" element={<SalesManagement />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
