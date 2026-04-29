import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  UserCog,
  Shield,
  Briefcase,
  Layers,
  DollarSign,
  Zap,
  X,
  TrendingDown,
  Home,
  Heart,
  Activity,
  PieChart,
  FileText,
  Upload,
} from 'lucide-react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: string;
  setActiveSection?: (section: string) => void;
  cartCount?: number;
};

const Sidebar = ({ isOpen, onClose, activeSection, setActiveSection, cartCount = 0 }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isClientDashboard = location.pathname === '/dashboard/client';

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/gestion/roles', label: 'Gestion des Rôles', icon: Shield },
        { path: '/gestion/employes', label: 'Gestion des Employés', icon: UserCog },
        { path: '/gestion/categories', label: 'Gestion des Catégories', icon: Layers },
        { path: '/gestion/investisseurs', label: 'Gestion des Investisseurs', icon: Briefcase },
        { path: '/gestion/investissements', label: 'Gestion des Investissements', icon: TrendingDown },
        { path: '/gestion/produits', label: 'Gestion des Produits', icon: Package },
        { path: '/gestion/clients', label: 'Gestion des Clients', icon: Users },
        { path: '/gestion/ventes', label: 'Gestion des Ventes', icon: DollarSign },
      ];
    }

    if (user?.role === 'vendeur') {
      return [
        { path: '/gestion/ventes', label: 'Gestion des Ventes', icon: DollarSign },
        { path: '/gestion/clients', label: 'Gestion des Clients', icon: Users },
        { path: '/dashboard/vendeur', label: 'Catalogue', icon: LayoutDashboard },
      ];
    }

    if (user?.role === 'analyste') {
      return [
        { path: '/dashboard/analyste', label: "Vue d'ensemble", icon: Home },
        { path: '/analytics', label: 'Analytics', icon: Activity },
        { path: '/analytics/produits', label: 'Produits', icon: Package },
        { path: '/analytics/ventes', label: 'Ventes', icon: TrendingUp },
        { path: '/analytics/clients', label: 'Clients', icon: Users },
        { path: '/analytics/categories', label: 'Catégories', icon: PieChart },
        { path: '/analytics/etl', label: 'Import CSV / ETL', icon: Upload },
        { path: '/analytics/rapports', label: 'Rapports', icon: FileText },
      ];
    }

    if (user?.role === 'client') {
      // Si on est sur le dashboard client, afficher les sections internes
      if (isClientDashboard && setActiveSection) {
        return [
          { id: 'overview', label: 'Vue d\'ensemble', icon: Home },
          { id: 'ventes', label: 'Mes Achats', icon: Package },
          { id: 'products', label: 'Boutique', icon: ShoppingBag },
          { id: 'wishlist', label: 'Liste de Souhaits', icon: Heart },
          { id: 'cart', label: 'Panier', icon: ShoppingCart, badge: cartCount },
        ];
      }
      // Sinon, afficher les liens de navigation classiques
      return [
        { path: '/dashboard/client', label: 'Mon Espace', icon: LayoutDashboard },
        { path: '/products', label: 'Catalogue', icon: ShoppingBag },
        { path: '/my-orders', label: 'Mes Commandes', icon: ShoppingCart },
      ];
    }

    if (user?.role === 'investisseur') {
      return [
        { path: '/dashboard/investisseur', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/catalogue/investisseur', label: 'Catalogue', icon: ShoppingBag },
        { path: '/gestion/investissements', label: 'Gestion des Investissements', icon: TrendingDown },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50
        bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl
        transform transition-transform duration-300 md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="h-20 px-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                TechShop
              </h2>
              <p className="text-xs text-slate-400 font-medium capitalize">{user?.role}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white md:hidden transition-colors">
            <X />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item: any) => {
            const Icon = item.icon;

            // Si c'est une section interne (client dashboard)
            if (item.id && isClientDashboard && setActiveSection) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg text-white'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            // Sinon, c'est un lien de navigation classique
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
