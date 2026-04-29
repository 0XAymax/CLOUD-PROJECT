import { useState, useEffect } from 'react';
import {
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Activity,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Target,
  PieChart,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import StatCard from '../../components/charts/StatCard';
import axiosInstance from "../../api/axiosConfig"

// Interfaces
interface Categorie {
  nom: string
  nbProduits: number
  chiffreAffaires?: number
  ventes?: number
  pourcentageProduits?: number
  margeMoyenne?: number
}

interface MonthlyStat {
  mois: string
  ca: number
  ventes: number
  orders?: number
  clients?: number
  profit?: number
  annee?: number
}

interface KPI {
  conversionRate: number
  averageOrderValue: number
  customerRetention: number
  npsScore: number
  growthRate: number
  profitMargin: number
  clientSatisfaction?: number
  tauxRupture?: number
}

interface Client {
  nom: string
  email?: string
  telephone?: string
  nombreVentes?: number
  chiffreAffaires?: number
  id?: number
}

interface DashboardStats {
  totalProduits: number
  totalClients: number
  totalVentes: number
  chiffreAffaires: number
  prixMoyen: number
  totalCategories: number
  produitsFaibleStock: number
  croissanceMensuelle?: number
  distributionCategories?: any[]
  top5Produits?: any[]
  dernieresVentes?: any[]
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"]

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalClients: 0,
    totalEmployees: 0,
    totalInvestors: 0,
  });

  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // États pour la section d'analyse
  const [kpiData, setKpiData] = useState<KPI | undefined>(undefined)
  const [categoriesData, setCategoriesData] = useState<Categorie[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([])
  const [bestClients, setBestClients] = useState<Client[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | undefined>(undefined)
  const [alertes, setAlertes] = useState<any[]>([])

  // Données de démonstration pour les catégories (fallback)
  const demoCategoriesData: Categorie[] = [
    { nom: "Électronique", nbProduits: 65, chiffreAffaires: 150000, ventes: 450, pourcentageProduits: 7, margeMoyenne: 35 },
    { nom: "Informatique", nbProduits: 55, chiffreAffaires: 120000, ventes: 320, pourcentageProduits: 6, margeMoyenne: 30 },
    { nom: "Accessoires", nbProduits: 45, chiffreAffaires: 75000, ventes: 400, pourcentageProduits: 22, margeMoyenne: 50 },
    { nom: "Objets connectés", nbProduits: 30, chiffreAffaires: 75000, ventes: 180, pourcentageProduits: 3, margeMoyenne: 45 },
    { nom: "Tablettes", nbProduits: 42, chiffreAffaires: 60000, ventes: 250, pourcentageProduits: 4, margeMoyenne: 35 },
    { nom: "Smart Home", nbProduits: 25, chiffreAffaires: 60000, ventes: 160, pourcentageProduits: 2, margeMoyenne: 52 },
    { nom: "Vêtements", nbProduits: 38, chiffreAffaires: 45000, ventes: 300, pourcentageProduits: 3, margeMoyenne: 45 },
    { nom: "Automobile", nbProduits: 35, chiffreAffaires: 45000, ventes: 200, pourcentageProduits: 3, margeMoyenne: 40 },
  ]

  // Charger toutes les données du dashboard
  const loadAllData = async () => {
    try {
      // Appel unique à l'API pour toutes les données
      const response = await axiosInstance.get("/api/dashboard/stats-globales");
      const globalData = response.data;
      const statsBasiques = globalData.statsBasiques;
      
      console.log("Données reçues:", globalData); // Pour debug
      
      // 1. Mettre à jour les statistiques principales
      setStats({
        totalSales: statsBasiques.totalVentes || 0,
        totalRevenue: statsBasiques.chiffreAffaires || 0,
        totalProducts: statsBasiques.totalProduits || 0,
        totalClients: statsBasiques.totalClients || 0,
        totalEmployees: 15, // Valeur temporaire - à remplacer si vous avez un endpoint
        totalInvestors: 8,  // Valeur temporaire - à remplacer si vous avez un endpoint
      });
      
      // 2. Mettre à jour les données analytiques si la section est ouverte
      if (showAnalytics) {
        // Statistiques de base
        setDashboardStats({
          totalProduits: statsBasiques.totalProduits || 0,
          totalClients: statsBasiques.totalClients || 0,
          totalVentes: statsBasiques.totalVentes || 0,
          chiffreAffaires: statsBasiques.chiffreAffaires || 0,
          prixMoyen: statsBasiques.prixMoyen || 0,
          totalCategories: statsBasiques.totalCategories || 0,
          produitsFaibleStock: statsBasiques.produitsFaibleStock || 0,
          distributionCategories: statsBasiques.distributionCategories || [],
          top5Produits: statsBasiques.top5Produits || [],
          dernieresVentes: statsBasiques.dernieresVentes || [],
        });
        
        // KPIs
        setKpiData({
          conversionRate: globalData.kpis?.conversionRate || 0,
          averageOrderValue: globalData.kpis?.averageOrderValue || 0,
          customerRetention: globalData.kpis?.customerRetention || 0,
          npsScore: globalData.kpis?.npsScore || 0,
          growthRate: globalData.kpis?.growthRate || 0,
          profitMargin: globalData.kpis?.profitMargin || 0,
          clientSatisfaction: 85, // Valeur par défaut
          tauxRupture: globalData.kpis?.tauxRupture || 0,
        });
        
        // Évolution CA
        setMonthlyStats(globalData.evolutionCA?.map((item: any) => ({
          mois: item.mois,
          ca: item.chiffreAffaires || 0,
          ventes: item.ventes || 0,
          annee: item.annee,
        })) || []);
        
        // Catégories
        if (statsBasiques.distributionCategories && statsBasiques.distributionCategories.length > 0) {
          const totalProduits = statsBasiques.totalProduits || 1;
          const categoriesFormatted = statsBasiques.distributionCategories.map((cat: any) => ({
            nom: cat.nom,
            nbProduits: cat.nbProduits || 0,
            chiffreAffaires: cat.chiffreAffaires || 0,
            ventes: cat.ventes || 0,
            pourcentageProduits: cat.pourcentageProduits || (cat.nbProduits / totalProduits) * 100,
            margeMoyenne: 35, // Valeur par défaut
          }));
          setCategoriesData(categoriesFormatted);
        } else {
          setCategoriesData(demoCategoriesData);
        }
        
        // Meilleurs clients
        setBestClients(globalData.topClients?.map((client: any) => ({
          nom: client.nom,
          chiffreAffaires: client.chiffreAffaires || 0,
          nombreVentes: client.nombreVentes || 0,
        })) || []);
        
        // Alertes
        setAlertes(globalData.alertes || []);
      }
      
    } catch (error) {
      console.error("Erreur chargement données dashboard:", error);
      
      // Données de démonstration en cas d'erreur
      setStats({
        totalSales: 1250,
        totalRevenue: 189500,
        totalProducts: 350,
        totalClients: 420,
        totalEmployees: 15,
        totalInvestors: 8,
      });
      
      if (showAnalytics) {
        setDashboardStats({
          totalProduits: 350,
          totalClients: 420,
          totalVentes: 1250,
          chiffreAffaires: 189500,
          prixMoyen: 39.99,
          totalCategories: 12,
          produitsFaibleStock: 8,
          croissanceMensuelle: 15.3,
        });
        
        setKpiData({
          conversionRate: 3.2,
          averageOrderValue: 89.99,
          customerRetention: 72.5,
          npsScore: 8.2,
          growthRate: 15.3,
          profitMargin: 28.7,
          clientSatisfaction: 85,
          tauxRupture: 2.5,
        });
        
        const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        setMonthlyStats(mois.map((mois) => ({
          mois,
          ca: 80000 + Math.random() * 40000,
          ventes: 200 + Math.random() * 150,
        })));
        
        setCategoriesData(demoCategoriesData);
        
        setBestClients([
          { nom: "Client A", chiffreAffaires: 15000, nombreVentes: 45 },
          { nom: "Client B", chiffreAffaires: 12000, nombreVentes: 32 },
          { nom: "Client C", chiffreAffaires: 9800, nombreVentes: 28 },
          { nom: "Client D", chiffreAffaires: 7500, nombreVentes: 21 },
          { nom: "Client E", chiffreAffaires: 6200, nombreVentes: 18 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, [showAnalytics]);

  // Préparer les données pour les graphiques
  const radarData = kpiData
    ? [
        { subject: "Conversion", A: kpiData.conversionRate * 10, fullMark: 100 },
        { subject: "Panier Moy.", A: Math.min((kpiData.averageOrderValue / 100) * 100, 100), fullMark: 100 },
        { subject: "Rétention", A: kpiData.customerRetention, fullMark: 100 },
        { subject: "NPS", A: kpiData.npsScore * 10, fullMark: 100 },
        { subject: "Croissance", A: Math.min(kpiData.growthRate * 3, 100), fullMark: 100 },
        { subject: "Marge", A: kpiData.profitMargin * 2, fullMark: 100 },
      ]
    : []

  const pieData = categoriesData
    .map((cat, i) => ({
      name: cat.nom,
      value: cat.chiffreAffaires || cat.nbProduits || 0,
      nbProduits: cat.nbProduits,
      ventes: cat.ventes || 0,
      marge: cat.margeMoyenne || 0,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)

  // Formater les meilleurs clients pour le graphique
  const formattedBestClients = bestClients
    .slice(0, 10)
    .map(client => ({
      nom: client.nom.length > 20 ? client.nom.substring(0, 18) + "..." : client.nom,
      chiffreAffaires: client.chiffreAffaires || 0,
      nombreVentes: client.nombreVentes || 0,
    }))

  return (
    <div className="p-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          
          <p className="text-gray-400 mb-6">
            Vue d'ensemble complète de la plateforme
          </p>

          {/* Cartes de Statistiques Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Ventes" 
              value={stats.totalSales.toLocaleString('fr-FR')} 
              icon={<ShoppingCart className="w-5 h-5" />} 
              color="blue" 
            />
            <StatCard 
              title="Employés" 
              value={stats.totalEmployees.toLocaleString('fr-FR')} 
              icon={<Users className="w-5 h-5" />} 
              color="blue" 
            />

            <StatCard 
              title="Produits" 
              value={stats.totalProducts.toLocaleString('fr-FR')} 
              icon={<Package className="w-5 h-5" />} 
              color="purple" 
            />
            <StatCard 
              title="Clients" 
              value={stats.totalClients.toLocaleString('fr-FR')} 
              icon={<Users className="w-5 h-5" />} 
              color="yellow" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Revenu Total"
              value={`${stats.totalRevenue.toLocaleString('fr-FR')} €`}
              icon={<DollarSign className="w-5 h-5" />}
              color="green"
            />
            <StatCard 
              title="Investisseurs" 
              value={stats.totalInvestors.toLocaleString('fr-FR')} 
              icon={<TrendingUp className="w-5 h-5" />} 
              color="green" 
            />
            <StatCard
              title="Panier Moyen"
              value={`${kpiData?.averageOrderValue?.toFixed(2) || "1008.31"} €`}
              icon={<ShoppingCart className="w-5 h-5" />}
              color="purple"
            />
          </div>

          {/* Section d'Analyse Avancée */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 mb-6">
              <button
                onClick={() => {
                  setShowAnalytics(!showAnalytics);
                  if (!showAnalytics) {
                    loadAllData();
                  }
                }}
                className="w-full flex items-center justify-between hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Analyses Avancées</h2>
                </div>
                <div className="flex items-center gap-2">
                  {showAnalytics && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadAllData();
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Actualiser
                    </button>
                  )}
                  {showAnalytics ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>
            </div>

            {showAnalytics && (
              <div className="space-y-6 animate-fadeIn">
                {/* Graphiques d'Analyse */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Évolution CA & Ventes */}
                  <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      Évolution CA & Ventes
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={monthlyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="mois" 
                          stroke="#94a3b8" 
                          fontSize={12} 
                          tickFormatter={(value) => {
                            const item = monthlyStats.find(m => m.mois === value);
                            return item?.annee ? `${value} ${item.annee.toString().slice(-2)}` : value;
                          }}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#94a3b8"
                          fontSize={12}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          label={{ 
                            value: "CA (€)", 
                            angle: -90, 
                            position: "insideLeft", 
                            style: { fill: "#94a3b8", fontSize: 11 } 
                          }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#94a3b8"
                          fontSize={12}
                          label={{ 
                            value: "Ventes", 
                            angle: -90, 
                            position: "insideRight", 
                            style: { fill: "#94a3b8", fontSize: 11 } 
                          }}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: "#1e293b", 
                            border: "1px solid #475569", 
                            borderRadius: "12px",
                            padding: "12px"
                          }}
                          formatter={(value: any, name?: string) => {
                            if (name === "CA") return [`${Number(value).toLocaleString('fr-FR')} €`, "Chiffre d'Affaires"]
                            if (name === "Ventes") return [value, "Nombre de ventes"]
                            return [value, name || ""]
                          }}
                          labelFormatter={(label, payload) => {
                            const item = payload?.[0]?.payload;
                            return item?.annee ? `${label} ${item.annee}` : label;
                          }}
                        />
                        <Legend />
                        <Bar 
                          yAxisId="left" 
                          dataKey="ca" 
                          name="CA" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]} 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="ventes" 
                          name="Ventes" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Radar KPIs */}
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                      <Target className="w-5 h-5 text-blue-400" />
                      Performance Globale (KPIs)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#475569" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: "#94a3b8", fontSize: 11 }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]} 
                          tick={{ fill: "#64748b", fontSize: 10 }} 
                        />
                        <Radar 
                          name="Performance" 
                          dataKey="A" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.5} 
                          strokeWidth={2} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#1e293b", 
                            border: "1px solid #475569", 
                            borderRadius: "8px" 
                          }}
                          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Score"]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Distribution par Catégorie */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    Répartition du CA par Catégorie
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <RechartsPie>
                      <Pie
                        data={pieData.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }: any) => {
                          const shortName = name.length > 10 ? name.substring(0, 8) + "..." : name
                          return `${shortName} ${(percent * 100).toFixed(0)}%`
                        }}
                        labelLine={false}
                      >
                        {pieData.slice(0, 8).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: string | undefined, props: any) => {
                          const payload = props.payload;
                          return [
                            `${Number(value).toLocaleString('fr-FR')} €`,
                            payload?.name || name,
                          ];
                        }}
                        contentStyle={{ 
                          backgroundColor: "#1e293b", 
                          border: "1px solid #475569", 
                          borderRadius: "8px" 
                        }}
                      />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                {/* Top Clients */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Top 10 Clients par CA
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={formattedBestClients} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis 
                        type="number" 
                        stroke="#94a3b8" 
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k €`}
                      />
                      <YAxis 
                        dataKey="nom" 
                        type="category" 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        width={150}
                        tick={{ fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1e293b", 
                          border: "1px solid #475569", 
                          borderRadius: "8px" 
                        }}
                        formatter={(value: any) => [
                          `${Number(value).toLocaleString('fr-FR')} €`, 
                          "Chiffre d'Affaires"
                        ]}
                        labelFormatter={(label) => `Client: ${label}`}
                      />
                      <Bar 
                        dataKey="chiffreAffaires" 
                        name="CA (€)" 
                        fill="#8b5cf6" 
                        radius={[0, 4, 4, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Métriques Détaillées */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-6 rounded-lg border border-blue-700/50">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-400" />
                      Produits
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Total Produits</span>
                        <span className="text-white font-bold">
                          {dashboardStats?.totalProduits?.toLocaleString('fr-FR') || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Catégories</span>
                        <span className="text-white font-bold">
                          {dashboardStats?.totalCategories?.toLocaleString('fr-FR') || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Stock Faible</span>
                        <span className="text-red-400 font-bold">
                          {dashboardStats?.produitsFaibleStock?.toLocaleString('fr-FR') || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Prix Moyen</span>
                        <span className="text-white font-bold">
                          {dashboardStats?.prixMoyen?.toFixed(2) || 0} €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-6 rounded-lg border border-green-700/50">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      Finances
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Marge Nette</span>
                        <span className="text-white font-bold">
                          {kpiData?.profitMargin?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Croissance</span>
                        <span className={`font-bold ${
                          (kpiData?.growthRate || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {(kpiData?.growthRate || 0) >= 0 ? '+' : ''}
                          {kpiData?.growthRate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Total CA</span>
                        <span className="text-white font-bold">
                          {dashboardStats?.chiffreAffaires?.toLocaleString('fr-FR') || 0} €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-lg border border-purple-700/50">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      Clients
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Total Clients</span>
                        <span className="text-white font-bold">
                          {dashboardStats?.totalClients?.toLocaleString('fr-FR') || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Rétention</span>
                        <span className="text-white font-bold">
                          {kpiData?.customerRetention?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Score NPS</span>
                        <span className="text-white font-bold">
                          {kpiData?.npsScore?.toFixed(1) || 0}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Satisfaction</span>
                        <span className="text-purple-400 font-bold">
                          {kpiData?.clientSatisfaction || 85}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alertes */}
                {alertes.length > 0 && (
                  <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 p-6 rounded-lg border border-red-700/50">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Alertes ({alertes.length})
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {alertes.map((alerte, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${
                            alerte.priorite === 'HAUTE' 
                              ? 'bg-red-900/20 border-red-700/50' 
                              : alerte.priorite === 'MOYENNE'
                              ? 'bg-amber-900/20 border-amber-700/50'
                              : 'bg-blue-900/20 border-blue-700/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-white">{alerte.message}</p>
                              <p className="text-sm text-slate-300 mt-1">
                                Type: {alerte.type} • Priorité: {alerte.priorite}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              alerte.priorite === 'HAUTE' 
                                ? 'bg-red-500/20 text-red-300' 
                                : alerte.priorite === 'MOYENNE'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {alerte.priorite}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights & Recommandations */}
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 p-6 rounded-lg border border-amber-700/50">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Insights & Recommandations
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/40 rounded-lg p-4">
                      <p className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Points Positifs
                      </p>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">✓</span>
                          <span>
                            Croissance du CA de <strong>{kpiData?.growthRate?.toFixed(1) || 0}%</strong>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">✓</span>
                          <span>
                            Taux de rétention client élevé (<strong>{kpiData?.customerRetention?.toFixed(1) || 0}%</strong>)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">✓</span>
                          <span>
                            Marge nette satisfaisante (<strong>{kpiData?.profitMargin?.toFixed(1) || 0}%</strong>)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">✓</span>
                          <span>
                            <strong>{dashboardStats?.totalClients || 0}</strong> clients actifs sur la plateforme
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-slate-800/40 rounded-lg p-4">
                      <p className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Points d'Attention
                      </p>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 mt-1">⚠</span>
                          <span>
                            <strong>{dashboardStats?.produitsFaibleStock || 0}</strong> produits en stock faible
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 mt-1">⚠</span>
                          <span>
                            Optimiser le taux de conversion (<strong>{kpiData?.conversionRate?.toFixed(1) || 0}%</strong>)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 mt-1">⚠</span>
                          <span>
                            Surveiller les catégories à faible marge
                          </span>
                        </li>
                        {alertes.length > 0 && (
                          <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">⚠</span>
                            <span>
                              <strong>{alertes.length}</strong> alertes nécessitent une attention
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;