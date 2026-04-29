import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { dashboardApi } from '../../api/dashboardApi';
import StatCard from '../../components/charts/StatCard';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Ventes"
          value={stats?.totalSales || 0}
          icon="💰"
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Revenu Total"
          value={`${stats?.totalRevenue || 0}€`}
          icon="📈"
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Produits"
          value={stats?.totalProducts || 0}
          icon="📦"
          color="purple"
        />
        <StatCard
          title="Clients"
          value={stats?.totalClients || 0}
          icon="👥"
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ventes par Mois</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { mois: 'Jan', ventes: 12 },
              { mois: 'Fév', ventes: 19 },
              { mois: 'Mar', ventes: 3 },
              { mois: 'Avr', ventes: 5 },
              { mois: 'Mai', ventes: 2 },
              { mois: 'Juin', ventes: 3 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ventes" stroke="#3b82f6" strokeWidth={2} name="Ventes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ventes par Catégorie</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Électronique', value: 300 },
                  { name: 'Vêtements', value: 150 },
                  { name: 'Alimentation', value: 100 },
                  { name: 'Autres', value: 50 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent !== undefined ? `${name} (${(percent * 100).toFixed(0)}%)` : name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { color: '#3b82f6' },
                  { color: '#10b981' },
                  { color: '#f59e0b' },
                  { color: '#ef4444' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Produits les Plus Vendus</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { produit: 'Produit A', quantite: 65 },
            { produit: 'Produit B', quantite: 59 },
            { produit: 'Produit C', quantite: 80 },
            { produit: 'Produit D', quantite: 81 },
            { produit: 'Produit E', quantite: 56 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="produit" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantite" fill="#3b82f6" name="Quantité Vendue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
