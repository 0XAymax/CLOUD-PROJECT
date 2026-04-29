import { useEffect, useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  Loader,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  Star,
  PieChart as PieChartIcon
} from 'lucide-react';
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
import StatCard from '../../components/charts/StatCard';
import { dashboardApi, type DashboardStats } from '../../api/dashboardApi';
import { saleApi } from '../../api/saleApi';
import { investmentApi, type Investment } from '../../api/investmentApi';

const InvestisseurDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les ventes
  const [sales, setSales] = useState<any[]>([]);
  const [, setLoadingSales] = useState(true);

  // États pour les investissements
  const [investments, setInvestments] = useState<Investment[]>([]);

  // États pour les analyses
  const [productPerformance, setProductPerformance] = useState<any[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Charger toutes les données en parallèle
        const [statsRes, salesRes, investmentsRes] = await Promise.all([
          dashboardApi.getStats(),
          saleApi.getAll(),
          investmentApi.getAll()
        ]);

        // Stats principales du backend
        const backendStats = statsRes.data;
        setStats(backendStats);

        // Ventes depuis le backend (utilisé pour les tendances mensuelles)
        const sortedSales = (salesRes.data || []).sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
        setSales(sortedSales);
        setLoadingSales(false);

        // Investissements
        setInvestments(investmentsRes.data || []);

        // Utiliser les données du backend pour categoryPerformance
        if (backendStats.distributionCategories && backendStats.distributionCategories.length > 0) {
          const categoryData = backendStats.distributionCategories.map((cat: any) => ({
            category: cat.nom || cat.name || 'N/A',
            totalRevenue: cat.chiffreAffaires || cat.totalRevenue || 0,
            totalSales: cat.ventes || cat.nbVentes || 0,
            quantity: cat.nbProduits || 0
          }));
          setCategoryPerformance(categoryData);
        }

        // Utiliser top5Produits du backend pour productPerformance
        if (backendStats.top5Produits && backendStats.top5Produits.length > 0) {
          const productData = backendStats.top5Produits.map((prod: any) => ({
            product: {
              nom: prod.nom,
              prix: prod.prix,
              categorie: prod.categorie
            },
            totalSales: prod.nombreVentes || 0,
            totalRevenue: prod.chiffreAffaires || 0,
            quantity: prod.quantiteVendue || 0
          }));
          setProductPerformance(productData);
        }

        console.log('✅ Données chargées depuis le backend:', {
          stats: backendStats,
          sales: salesRes.data?.length,
          investments: investmentsRes.data?.length,
          categoryPerformance: backendStats.distributionCategories?.length,
          productPerformance: backendStats.top5Produits?.length
        });

      } catch (e: any) {
        console.error("❌ Erreur chargement données:", e);
        setError(e?.response?.data?.message || e.message || "Erreur de connexion au backend");
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Analyser les tendances mensuelles à partir des ventes
  useEffect(() => {
    if (sales.length > 0) {
      const monthlyData = new Map<string, { revenue: number, sales: number }>();

      sales.forEach((sale: any) => {
        if (sale.dateVente) {
          const date = new Date(sale.dateVente);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          const existing = monthlyData.get(monthKey) || { revenue: 0, sales: 0 };
          existing.sales += 1;
          existing.revenue += (sale.quantite || 0) * (sale.produit?.prix || 0);
          monthlyData.set(monthKey, existing);
        }
      });

      const trends = Array.from(monthlyData.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      setMonthlyTrends(trends);
    }
  }, [sales]);

  // Préparer les données pour le graphique des ventes par catégorie (Pie Chart)
  const categoryChartData = categoryPerformance.map(c => ({
    name: c.category,
    value: c.totalRevenue,
    ventes: c.totalSales,
    quantite: c.quantity
  }));

  // Préparer les données pour le graphique des top produits (Bar Chart)
  const topProductsChartData = productPerformance.slice(0, 10).map(p => ({
    name: p.product?.nom || 'N/A',
    revenus: p.totalRevenue,
    ventes: p.totalSales,
    quantite: p.quantity
  }));

  // Préparer les données pour les tendances mensuelles (Line Chart)
  const monthlyTrendsChartData = monthlyTrends.map(t => {
    const monthStr = String(t.month || '');
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthIdx = parseInt(month || '1') - 1;
    return {
      mois: `${monthNames[monthIdx] || 'N/A'} ${year || ''}`,
      revenus: t.revenue || 0,
      ventes: t.sales || 0
    };
  });

  // Couleurs pour le Pie Chart
  const COLORS = [
    '#3b82f6', // blue
    '#a855f7', // purple
    '#22c55e', // green
    '#fbbf24', // yellow
    '#ef4444', // red
    '#ec4899', // pink
    '#0ea5e9', // sky
  ];

  // Calculer le ROI moyen et les statistiques d'investissement
  const calculateInvestmentMetrics = () => {
    if (investments.length === 0) return { totalInvested: 0, avgROI: 0, bestCategory: 'N/A' };

    const totalInvested = investments.reduce((sum, inv) => sum + (inv.montantInvestissement || 0), 0);
    
    // Grouper les investissements par catégorie
    const investmentsByCategory = new Map<string, number>();
    investments.forEach(inv => {
      const categoryName = (inv.produit as any)?.categorie?.nom || 'Non catégorisé';
      const currentAmount = investmentsByCategory.get(categoryName) || 0;
      investmentsByCategory.set(categoryName, currentAmount + (inv.montantInvestissement || 0));
    });

    // Calculer le ROI par catégorie (le montant investi est divisé sur tous les produits de la catégorie)
    const categoryROIs: number[] = [];
    investmentsByCategory.forEach((investedAmount, categoryName) => {
      // Trouver tous les produits de cette catégorie
      const categoryProducts = productPerformance.filter(p => p.product?.categorie?.nom === categoryName);
      
      if (categoryProducts.length > 0) {
        // Calculer le revenu total de la catégorie
        const categoryRevenue = categoryProducts.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
        
        // Calculer le ROI de la catégorie
        const roi = investedAmount > 0 ? ((categoryRevenue - investedAmount) / investedAmount) * 100 : 0;
        categoryROIs.push(roi);
      }
    });

    const avgROI = categoryROIs.length > 0 
      ? categoryROIs.reduce((sum, roi) => sum + roi, 0) / categoryROIs.length 
      : 0;

    const bestCategory = categoryPerformance.length > 0 ? categoryPerformance[0].category : 'N/A';

    return { totalInvested, avgROI, bestCategory };
  };

  const investmentMetrics = calculateInvestmentMetrics();

  return (
    <>
      <div className="space-y-8">
        {/* En-tête */}
        <div>
          <h2 className="text-3xl font-black mb-2 text-white">Dashboard Investisseur</h2>
          <p className="text-slate-400">Analyse complète pour optimiser vos investissements</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-12 h-12 text-blue-400 animate-spin" />
            <p className="ml-4 text-slate-400">Chargement des données depuis le backend...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Erreur de connexion</h3>
            <p className="text-slate-300 mb-4">{error}</p>
            <p className="text-sm text-slate-400">Vérifiez que le backend est démarré sur le port 9090</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Investissements Totaux"
                value={`${investmentMetrics.totalInvested.toLocaleString()} DH`}
                icon={<DollarSign className="w-6 h-6" />}
                color="blue"
              />
              <StatCard
                title="ROI Moyen"
                value={`${investmentMetrics.avgROI.toFixed(1)}%`}
                icon={<TrendingUp className="w-6 h-6" />}
                color="green"
              />
              <StatCard
                title="Revenu Total"
                value={`${(stats?.chiffreAffaires || stats?.totalRevenue || 0).toLocaleString()} DH`}
                icon={<ShoppingCart className="w-6 h-6" />}
                color="purple"
              />
              <StatCard
                title="Produits Actifs"
                value={stats?.totalProduits || stats?.totalProducts || 0}
                icon={<Package className="w-6 h-6" />}
                color="yellow"
              />
            </div>

            {/* Meilleure Catégorie et Recommandation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl border border-green-500/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-8 h-8 text-green-400" />
                  <h3 className="text-2xl font-bold text-white">Meilleure Catégorie</h3>
                </div>
                <p className="text-4xl font-black text-green-400 mb-2">{investmentMetrics.bestCategory}</p>
                <p className="text-slate-300">
                  Revenu: <span className="font-bold text-green-400">
                    {categoryPerformance.length > 0 ? categoryPerformance[0].totalRevenue.toLocaleString() : 0} DH
                  </span>
                </p>
                <p className="text-slate-400 mt-2">Catégorie la plus performante en termes de revenus</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Opportunités</h3>
                </div>
                <p className="text-lg text-slate-300 mb-3">
                  <span className="font-bold text-blue-400">{productPerformance.length}</span> produits en vente
                </p>
                <p className="text-lg text-slate-300 mb-3">
                  <span className="font-bold text-purple-400">{categoryPerformance.length}</span> catégories actives
                </p>
                <p className="text-slate-400">Diversifiez vos investissements pour maximiser les profits</p>
              </div>
            </div>

            {/* Graphiques d'analyse */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenus par Catégorie */}
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <PieChartIcon className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Revenus par Catégorie</h3>
                </div>
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${percent !== undefined ? (percent * 100).toFixed(0) : 'N/A'}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryChartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number | undefined) => value !== undefined ? `${value.toLocaleString()} DH` : 'N/A'}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-slate-400">
                    Aucune donnée disponible
                  </div>
                )}
              </div>

              {/* Top 10 Produits par Revenus */}
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Top 10 Produits</h3>
                </div>
                {topProductsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={topProductsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        formatter={(value: number | undefined) => value !== undefined ? `${value.toLocaleString()} DH` : 'N/A'}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="revenus" fill="#3b82f6" name="Revenus (DH)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-slate-400">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </div>

            {/* Tendances Mensuelles */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Tendances Mensuelles</h3>
              </div>
              {monthlyTrendsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={monthlyTrendsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="mois" stroke="#9ca3af" />
                    <YAxis yAxisId="left" stroke="#22c55e" />
                    <YAxis yAxisId="right" orientation="right" stroke="#a855f7" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="revenus" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Revenus (DH)"
                      dot={{ fill: '#22c55e', r: 4 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="ventes" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      name="Nombre de ventes"
                      dot={{ fill: '#a855f7', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-slate-400">
                  Aucune donnée disponible
                </div>
              )}
            </div>

            {/* Analyse détaillée des catégories */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <PieChartIcon className="w-6 h-6 text-blue-400" />
                Analyse des Catégories
              </h3>
              {categoryPerformance.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">Aucune donnée de catégorie disponible</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Catégorie</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Revenus</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Ventes</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Quantité</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Recommandation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryPerformance.map((cat, idx) => {
                        const avgRevenue = cat.totalRevenue / cat.totalSales;
                        let recommendation = '';
                        let recommendationColor = '';
                        
                        if (idx === 0) {
                          recommendation = '🏆 Excellent investissement';
                          recommendationColor = 'text-green-400';
                        } else if (avgRevenue > 1000) {
                          recommendation = '⭐ Très rentable';
                          recommendationColor = 'text-blue-400';
                        } else if (avgRevenue > 500) {
                          recommendation = '👍 Rentable';
                          recommendationColor = 'text-yellow-400';
                        } else {
                          recommendation = '⚠️ À surveiller';
                          recommendationColor = 'text-orange-400';
                        }

                        return (
                          <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                            <td className="py-3 px-4 text-white font-medium">{cat.category}</td>
                            <td className="py-3 px-4 text-emerald-400 font-bold">
                              {cat.totalRevenue.toLocaleString()} DH
                            </td>
                            <td className="py-3 px-4 text-slate-300">{cat.totalSales}</td>
                            <td className="py-3 px-4 text-slate-300">{cat.quantity}</td>
                            <td className={`py-3 px-4 font-semibold ${recommendationColor}`}>
                              {recommendation}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top Produits à Investir */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-purple-400" />
                Top 15 Produits - Opportunités d'Investissement
              </h3>
              {productPerformance.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">Aucun produit disponible</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Rang</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Produit</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Catégorie</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Prix</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Ventes</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Quantité</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Revenus</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productPerformance.slice(0, 15).map((perf, idx) => {
                        let scoreEmoji = '';
                        let scoreColor = '';
                        
                        if (idx < 3) {
                          scoreEmoji = '🔥 Hot';
                          scoreColor = 'text-red-400';
                        } else if (idx < 7) {
                          scoreEmoji = '⭐ Fort';
                          scoreColor = 'text-yellow-400';
                        } else {
                          scoreEmoji = '👍 Bon';
                          scoreColor = 'text-green-400';
                        }

                        return (
                          <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                            <td className="py-3 px-4">
                              <span className={`font-bold ${idx < 3 ? 'text-yellow-400 text-lg' : 'text-slate-400'}`}>
                                #{idx + 1}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white font-medium">{perf.product.nom}</td>
                            <td className="py-3 px-4 text-slate-300">
                              {perf.product.categorie?.nom || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {perf.product.prix?.toFixed(2)} DH
                            </td>
                            <td className="py-3 px-4 text-blue-400">{perf.totalSales}</td>
                            <td className="py-3 px-4 text-purple-400">{perf.quantity}</td>
                            <td className="py-3 px-4 text-emerald-400 font-bold">
                              {perf.totalRevenue.toLocaleString()} DH
                            </td>
                            <td className={`py-3 px-4 font-semibold ${scoreColor}`}>
                              {scoreEmoji}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default InvestisseurDashboard;