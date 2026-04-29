import { useState, useEffect } from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';
import DashboardNavbar from '@/components/common/DashboardNavbar';

type OutletContext = {
  setClientDashboardState: (state: {
    activeSection: string;
    setActiveSection: (section: string) => void;
    cartCount: number;
  }) => void;
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [clientDashboardState, setClientDashboardState] = useState<{
    activeSection: string;
    setActiveSection: (section: string) => void;
    cartCount: number;
  } | null>(null);
  const location = useLocation();

  // Mapper les routes aux titres
  useEffect(() => {
    const pathToTitle: { [key: string]: string } = {
      '/dashboard': 'Tableau de Bord',
      '/dashboard/admin': 'Tableau de Bord Admin',
      '/dashboard/vendeur': 'Catalogue',
      '/dashboard/analyste': 'Tableau de Bord Analyste',
      '/analytics': 'Analytics Avancé',
      '/analytics/produits': 'Analyse des Produits',
      '/analytics/ventes': 'Analytique des Ventes',
      '/analytics/clients': 'Analyse Clients',
      '/analytics/categories': 'Analyse par Catégorie',
      '/analytics/rapports': 'Rapports et Exports',
      '/dashboard/client': 'Tableau de Bord Client',
      '/dashboard/investisseur': 'Tableau de Bord Investisseur',
      '/catalogue/investisseur': 'Catalogue Produits',
      '/products': 'Gestion des Produits',
      '/sales': 'Gestion des Ventes',
      '/shop': 'Boutique',
      '/gestion/clients': 'Gestion des Clients',
      '/gestion/categories': 'Gestion des Catégories',
      '/gestion/ventes': 'Gestion des Ventes',
      '/gestion/products': 'Gestion des Produits',
      '/gestion/produits': 'Gestion des Produits',
      '/gestion/roles': 'Gestion des Rôles',
      '/gestion/investissements': 'Gestion des Investissements',
      '/gestion/employes': 'Gestion des Employés',
      '/profile': 'Mon Profil',
    };

    const path = location.pathname;
    let title = pathToTitle[path] || 'Tableau de Bord';

    // Si on est sur le dashboard client, utiliser la section active
    if (path === '/dashboard/client' && clientDashboardState?.activeSection) {
      const sectionTitles: { [key: string]: string } = {
        'overview': 'Vue d\'ensemble',
        'ventes': 'Mes Achats',
        'products': 'Boutique',
        'wishlist': 'Liste de Souhaits',
        'cart': 'Panier',
      };
      title = sectionTitles[clientDashboardState.activeSection] || 'Tableau de Bord Client';
    }

    setPageTitle(title);
  }, [location.pathname, clientDashboardState?.activeSection]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex md:pl-64 transition-all duration-300">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={clientDashboardState?.activeSection}
        setActiveSection={clientDashboardState?.setActiveSection}
        cartCount={clientDashboardState?.cartCount}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 flex items-center justify-between gap-4 h-20 px-6 border-b border-slate-800/50 bg-slate-900 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-300 hover:text-white md:hidden transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{pageTitle}</h1>
            </div>
          </div>

          <DashboardNavbar />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ setClientDashboardState } satisfies OutletContext} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

export function useClientDashboard() {
  return useOutletContext<OutletContext>();
}
