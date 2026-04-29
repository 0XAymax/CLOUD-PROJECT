"use client"

import { useState, useEffect, useRef } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
  Treemap,
} from "recharts"
import {
  Activity,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Target,
  DollarSign,
  Calendar,
  Zap,
  FileText,
  List,
  LayoutGrid,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Printer,
  FileDown,
  Filter,
  ChevronDown,
  ChevronUp,
  Upload,
} from "lucide-react"
import { useLocation } from "react-router-dom"
import StatCard from "../../components/charts/StatCard"
import axiosInstance from "../../api/axiosConfig"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import html2canvas from "html2canvas"
import CsvEtlUpload from "../../components/forms/CsvEtlUpload"

// Interfaces
interface Produit {
  id: number
  nom: string
  description?: string
  prix: number
  stock: number
  categorie?: { nom: string } | string
  nombreVentes?: number
  quantiteVendue?: number
  chiffreAffaires?: number
  marge?: number
  seuilAlerte?: number
  statut?: string
  image?: string
}

interface Client {
  nom: string
  email?: string
  telephone?: string
  nombreVentes?: number
  chiffreAffaires?: number
  id?: number
}

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
}

interface DashboardStats {
  totalProduits: number
  totalClients: number
  totalVentes: number
  chiffreAffaires: number
  prixMoyen: number
  totalCategories: number
  produitsFaibleStock: number
  produitsRupture?: number
  valeurStockTotal?: number
  top5Produits: Produit[]
  distributionCategories: Categorie[]
  dernieresVentes?: any[]
  alertes?: any[]
  nombreAlertes?: number
  croissanceMensuelle?: number
}

interface KPI {
  conversionRate: number
  averageOrderValue: number
  customerRetention: number
  npsScore: number
  growthRate: number
  profitMargin: number
  clientSatisfaction: number
  tauxRupture: number
}

interface Trend {
  period: string
  value: number
  change: number
  type: string
}

interface PerformanceMetric {
  metric: string
  value: number
  target: number
  status: string
  progress: number
  unit: string
}

interface StockStats {
  totalStockValue: number
  averageStockAge: number
  turnoverRate: number
  stockOutCount: number
  lowStockCount: number
}

interface Alert {
  type: string
  produit: string
  stockActuel?: number
  seuil?: number
  ventes?: number
  priorite: string
  message: string
  date?: string
}

interface ChartViewConfig {
  evolutionCA: "line" | "bar" | "area" | "composed"
  distributionCategories: "pie" | "bar" | "treemap" | "list"
  radarKPI: "radar" | "bar" | "radial"
  stockVentes: "scatter" | "bubble" | "line"
  tendances: "area" | "line" | "bar"
  performanceCategories: "composed" | "bar" | "line"
  topClients: "bar" | "horizontalBar" | "pie"
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"]

// Composant pour le contenu personnalisé du Treemap
const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, colors, index } = props

  if (!name) return null

  const shortName = name.length > 20 ? name.substring(0, 18) + "..." : name

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#1e293b',
          strokeWidth: 2,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={Math.min(14, width / 10)}
        fontWeight="bold"
      >
        {shortName}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 18}
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize={Math.min(12, width / 12)}
      >
        {(props.value / 1000).toFixed(0)}K €
      </text>
    </g>
  )
}

const AnalysteDashboard = () => {
  const location = useLocation()

  const getActiveSection = () => {
    const path = location.pathname
    if (path === "/dashboard/analyste") return "overview"
    if (path === "/analytics") return "analytics"
    if (path === "/analytics/produits") return "products"
    if (path === "/analytics/ventes") return "sales"
    if (path === "/analytics/clients") return "clients"
    if (path === "/analytics/categories") return "categories"
    if (path === "/analytics/etl") return "etl"
    if (path === "/analytics/rapports") return "reports"
    return "overview"
  }

  const activeSection = getActiveSection()

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [timeRange, setTimeRange] = useState("last30days")
  const [chartViewConfig, setChartViewConfig] = useState<ChartViewConfig>({
    evolutionCA: "composed",
    distributionCategories: "pie",
    radarKPI: "radar",
    stockVentes: "scatter",
    tendances: "area",
    performanceCategories: "composed",
    topClients: "horizontalBar",
  })
  const [analystInfo] = useState({
    nom: "Jean Dupont",
    poste: "Analyste Senior",
    email: "jean.dupont@entreprise.com",
    dateGeneration: new Date().toLocaleDateString('fr-FR'),
    periodeRapport: "30 derniers jours"
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const dashboardRef = useRef<HTMLDivElement>(null)

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | undefined>(undefined)
  const [kpiData, setKpiData] = useState<KPI | undefined>(undefined)
  const [topProducts, setTopProducts] = useState<Produit[]>([])
  const [bestClients, setBestClients] = useState<Client[]>([])
  const [categoriesData, setCategoriesData] = useState<Categorie[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Produit[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([])
  const [trends, setTrends] = useState<Trend[]>([])
  const [performance, setPerformance] = useState<PerformanceMetric[]>([])
  const [stockStats, setStockStats] = useState<StockStats | undefined>(undefined)
  const [alertes, setAlertes] = useState<Alert[]>([])
  const [scatterData, setScatterData] = useState<any[]>([])
  const [currentProductPage, setCurrentProductPage] = useState(1)
  const productsPerPage = 10

  // Données de démonstration
  const demoCategoriesData: Categorie[] = [
    { nom: "Maison & Domotique", nbProduits: 15, chiffreAffaires: 15000, ventes: 120, pourcentageProduits: 1, margeMoyenne: 32 },
    { nom: "Audio & Video", nbProduits: 25, chiffreAffaires: 30000, ventes: 180, pourcentageProduits: 2, margeMoyenne: 28 },
    { nom: "Tablettes", nbProduits: 42, chiffreAffaires: 60000, ventes: 250, pourcentageProduits: 4, margeMoyenne: 35 },
    { nom: "Automobile", nbProduits: 35, chiffreAffaires: 45000, ventes: 200, pourcentageProduits: 3, margeMoyenne: 40 },
    { nom: "Vêtements", nbProduits: 38, chiffreAffaires: 45000, ventes: 300, pourcentageProduits: 3, margeMoyenne: 45 },
    { nom: "Accessoires", nbProduits: 45, chiffreAffaires: 75000, ventes: 400, pourcentageProduits: 22, margeMoyenne: 50 },
    { nom: "Mediples", nbProduits: 50, chiffreAffaires: 90000, ventes: 350, pourcentageProduits: 22, margeMoyenne: 38 },
    { nom: "Sports", nbProduits: 32, chiffreAffaires: 48000, ventes: 190, pourcentageProduits: 4, margeMoyenne: 42 },
    { nom: "Beauté", nbProduits: 40, chiffreAffaires: 60000, ventes: 280, pourcentageProduits: 4, margeMoyenne: 55 },
    { nom: "Informatique", nbProduits: 55, chiffreAffaires: 120000, ventes: 320, pourcentageProduits: 6, margeMoyenne: 30 },
    { nom: "Jardin", nbProduits: 22, chiffreAffaires: 33000, ventes: 140, pourcentageProduits: 2, margeMoyenne: 48 },
    { nom: "Livres", nbProduits: 18, chiffreAffaires: 27000, ventes: 130, pourcentageProduits: 2, margeMoyenne: 25 },
    { nom: "Meubles", nbProduits: 28, chiffreAffaires: 42000, ventes: 150, pourcentageProduits: 3, margeMoyenne: 60 },
    { nom: "Objets connectés", nbProduits: 30, chiffreAffaires: 75000, ventes: 180, pourcentageProduits: 3, margeMoyenne: 45 },
    { nom: "Smart Home", nbProduits: 25, chiffreAffaires: 60000, ventes: 160, pourcentageProduits: 2, margeMoyenne: 52 },
    { nom: "Électronique", nbProduits: 65, chiffreAffaires: 150000, ventes: 450, pourcentageProduits: 7, margeMoyenne: 35 },
  ]

  const loadAllData = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      // Charger les stats globales et tous les produits en parallèle
      const [statsRes, produitsRes] = await Promise.all([
        axiosInstance.get("/api/dashboard/stats-globales"),
        axiosInstance.get("/produits")
      ])
      const globalData = statsRes.data
      const allProducts = produitsRes.data

      setDashboardStats(globalData.statsBasiques)
      setKpiData(globalData.kpis)
      setMonthlyStats(globalData.evolutionCA)
      setCategoriesData(globalData.statsBasiques?.distributionCategories?.length > 0
        ? globalData.statsBasiques.distributionCategories
        : demoCategoriesData)
      setStockStats(globalData.statsStock)
      setAlertes(globalData.alertes)
      setTrends(globalData.tendances)
      setPerformance(globalData.performances?.metrics || [])
      setBestClients(globalData.topClients || [])

      // Créer une map de tous les produits avec leurs infos complètes (stock, prix, catégorie)
      const allProductsMap = new Map<string, any>(
        (allProducts || []).map((p: any) => [p.nom, {
          ...p,
          stock: p.quantite ?? p.stock ?? 0,
          prix: p.prix || 0,
          categorie: p.categorie?.nom || p.categorie || "Non catégorisé"
        }])
      )

      // Enrichir topProduits avec les données complètes depuis la liste des produits
      const enrichedTopProduits = (globalData.topProduits || []).map((p: Produit) => {
        const fullData = allProductsMap.get(p.nom)
        if (fullData) {
          return {
            ...p,
            stock: fullData.stock,
            prix: fullData.prix,
            categorie: fullData.categorie,
            image: fullData.image
          }
        }
        return p
      })
      setTopProducts(enrichedTopProduits)

      if (globalData.statsBasiques?.top5Produits) {
        const lowStock = globalData.statsBasiques.top5Produits.filter((p: Produit) => p.stock < 5)
        setLowStockProducts(lowStock)

        const scatter = globalData.statsBasiques.top5Produits.map((produit: Produit) => ({
          x: produit.stock,
          y: produit.nombreVentes || 0,
          name: produit.nom,
          ca: produit.chiffreAffaires || 0,
          marge: produit.marge || 0,
        }))
        setScatterData(scatter)
      }

      setSuccessMessage("Données mises à jour")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Erreur chargement données:", error)
      setErrorMessage("Impossible de charger les données. Utilisation des données de démonstration.")

      // Charger les données de démonstration
      setCategoriesData(demoCategoriesData)

      // Données de démonstration
      setDashboardStats({
        totalProduits: 1200,
        totalClients: 450,
        totalVentes: 3200,
        chiffreAffaires: 125000,
        prixMoyen: 39.99,
        totalCategories: demoCategoriesData.length,
        produitsFaibleStock: 12,
        top5Produits: [],
        distributionCategories: demoCategoriesData,
        croissanceMensuelle: 15.3,
      })

      setKpiData({
        conversionRate: 3.2,
        averageOrderValue: 89.99,
        customerRetention: 72.5,
        npsScore: 8.2,
        growthRate: 15.3,
        profitMargin: 28.7,
        clientSatisfaction: 85,
        tauxRupture: 2.5,
      })

      // Données mensuelles de démo
      const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]
      setMonthlyStats(mois.map((mois) => ({
        mois,
        ca: 80000 + Math.random() * 40000,
        ventes: 200 + Math.random() * 150,
        orders: 180 + Math.random() * 100,
        clients: 35 + Math.random() * 20,
        profit: 25000 + Math.random() * 15000,
      })))

      // Tendances de démo
      setTrends([
        { period: "Sem 1", value: 15000, change: 5.2, type: "CA" },
        { period: "Sem 2", value: 16500, change: 8.7, type: "CA" },
        { period: "Sem 3", value: 14200, change: -2.1, type: "CA" },
        { period: "Sem 4", value: 17800, change: 12.4, type: "CA" },
        { period: "Sem 5", value: 19500, change: 15.8, type: "CA" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchFilteredData = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(
        `/dashboard/stats/filtre?dateDebut=${dateRange.start}&dateFin=${dateRange.end}`,
      )
      const data = res.data
      setDashboardStats((prev) => ({ ...(prev ?? ({} as DashboardStats)), ...data }))
      setSuccessMessage("Données filtrées avec succès")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      setErrorMessage("Erreur lors du filtrage")
    } finally {
      setLoading(false)
    }
  }

  const exportData = (format: string) => {
    const data = {
      dashboardStats,
      kpiData,
      topProducts,
      bestClients,
      categoriesData,
      monthlyStats,
      trends,
      performance,
      stockStats,
      alertes,
      exportDate: new Date().toISOString(),
    }

    if (format === "csv") {
      const csvContent = convertToCSV(data)
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard-export-${new Date().getTime()}.csv`
      a.click()
    } else if (format === "json") {
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard-export-${new Date().getTime()}.json`
      a.click()
    }

    setSuccessMessage(`Données exportées en ${format.toUpperCase()}`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const convertToCSV = (obj: Record<string, any>) => {
    const header = Object.keys(obj).join(",")
    const values = Object.values(obj)
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : v))
      .join(",")
    return `${header}\n${values}`
  }

  const applyTimeFilter = () => {
    let startDate = new Date()
    let endDate = new Date()

    switch (timeRange) {
      case "today":
        startDate = endDate = new Date()
        break
      case "last7days":
        startDate = new Date(new Date().setDate(new Date().getDate() - 7))
        break
      case "last30days":
        startDate = new Date(new Date().setDate(new Date().getDate() - 30))
        break
      case "last90days":
        startDate = new Date(new Date().setDate(new Date().getDate() - 90))
        break
      case "custom":
        startDate = new Date(dateRange.start)
        endDate = new Date(dateRange.end)
        break
    }

    setDateRange({
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    })

    fetchFilteredData()
  }

  // Fonction pour exporter en PDF
  const exportToPDF = async () => {
    if (!dashboardRef.current) return

    setLoading(true)
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // En-tête du rapport
      doc.setFillColor(41, 128, 185)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.text("RAPPORT D'ANALYSE", 105, 20, { align: 'center' })

      doc.setFontSize(12)
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 30, { align: 'center' })

      // Informations de l'analyste
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Analyste: ${analystInfo.nom}`, 20, 50)
      doc.text(`Poste: ${analystInfo.poste}`, 20, 56)
      doc.text(`Période: ${analystInfo.periodeRapport}`, 20, 62)
      
      // Résumé exécutif
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text("RÉSUMÉ EXÉCUTIF", 20, 80)
      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)

      const summary = `
        Ce rapport présente une analyse complète des performances commerciales pour la période spécifiée.
        Le chiffre d'affaires total s'élève à ${dashboardStats?.chiffreAffaires?.toLocaleString('fr-FR')} € avec une croissance de ${kpiData?.growthRate?.toFixed(1)}% par rapport à la période précédente.
        ${dashboardStats?.produitsFaibleStock || 0} produits nécessitent une attention immédiate en raison de stocks faibles.
      `

      doc.text(doc.splitTextToSize(summary, 170), 20, 90)

      let yPosition = 120

      // KPI Principaux
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text("INDICATEURS CLÉS DE PERFORMANCE", 20, yPosition)
      yPosition += 10

      const kpiTableData = [
        ['Chiffre d\'Affaires', `${dashboardStats?.chiffreAffaires?.toLocaleString('fr-FR') || '0'} €`, `${kpiData?.growthRate?.toFixed(1) || '0.0'}%`],
        ['Ventes Totales', dashboardStats?.totalVentes?.toString() || '0', ''],
        ['Clients', dashboardStats?.totalClients?.toString() || '0', `${kpiData?.customerRetention?.toFixed(1) || '0.0'}% rétention`],
        ['Panier Moyen', `${kpiData?.averageOrderValue?.toFixed(2) || '0.00'} €`, ''],
        ['Marge Nette', `${kpiData?.profitMargin?.toFixed(1) || '0.0'}%`, ''],
        ['Taux Conversion', `${kpiData?.conversionRate?.toFixed(1) || '0.0'}%`, ''],
      ]

      autoTable(doc, {
        startY: yPosition,
        head: [['Indicateur', 'Valeur', 'Commentaire']],
        body: kpiTableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 20

      // Analyse par Catégorie
      doc.setFontSize(12)
      doc.text("ANALYSE PAR CATÉGORIE", 20, yPosition)
      yPosition += 10

      const categoryTableData = categoriesData
        .slice(0, 10)
        .map(cat => [
          cat.nom,
          `${cat.chiffreAffaires?.toLocaleString('fr-FR')} €`,
          cat.nbProduits.toString(),
          cat.ventes?.toString() || '0',
          `${cat.margeMoyenne?.toFixed(1) || '0'}%`
        ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Catégorie', 'CA', 'Produits', 'Ventes', 'Marge Moyenne']],
        body: categoryTableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 20

      // Alertes
      if (alertes.length > 0) {
        doc.setFontSize(12)
        doc.text("ALERTES ET POINTS DE VIGILANCE", 20, yPosition)
        yPosition += 10

        const alertTableData = alertes.slice(0, 5).map(alerte => [
          alerte.type,
          alerte.produit,
          alerte.priorite,
          alerte.message.substring(0, 50) + '...'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Type', 'Produit', 'Priorité', 'Message']],
          body: alertTableData,
          theme: 'grid',
          headStyles: { fillColor: [231, 76, 60] },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 20
      }

      // Recommandations
      doc.setFontSize(12)
      doc.text("RECOMMANDATIONS STRATÉGIQUES", 20, yPosition)
      yPosition += 10

      const recommendations = [
        `1. Réapprovisionner ${lowStockProducts.length} produits en stock faible`,
        `2. Augmenter la visibilité des catégories à forte marge (${categoriesData.filter(c => (c.margeMoyenne || 0) > 40).length} catégories identifiées)`,
        "3. Développer des campagnes de fidélisation pour améliorer le taux de rétention",
        "4. Optimiser les stocks des produits à rotation lente"
      ]

      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      recommendations.forEach((rec) => {
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(rec, 25, yPosition)
        yPosition += 8
      })

      // Pied de page
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} / ${pageCount}`, 105, 290, { align: 'center' })
        doc.text(`© ${new Date().getFullYear()} - Dashboard Analytique`, 105, 295, { align: 'center' })
      }

      // Sauvegarder le PDF
      doc.save(`rapport-analytique-${new Date().getTime()}.pdf`)

      setSuccessMessage("Rapport PDF généré avec succès")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error)
      setErrorMessage("Erreur lors de la génération du PDF")
    } finally {
      setLoading(false)
    }
  }

  // Exporter en HTML/Image
  const exportToImage = async () => {
    if (!dashboardRef.current) return

    setLoading(true)
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a'
      })

      const imgData = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = imgData
      link.download = `dashboard-screenshot-${new Date().getTime()}.png`
      link.click()

      setSuccessMessage("Capture d'écran exportée avec succès")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Erreur lors de l'export d'image:", error)
      setErrorMessage("Erreur lors de l'export d'image")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
    const interval = setInterval(loadAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadAllData()
    const interval = setInterval(loadAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  const radarData = kpiData
    ? [
      { subject: "Conversion", A: kpiData.conversionRate * 10, fullMark: 100 },
      { subject: "Panier Moy.", A: (kpiData.averageOrderValue / 100) * 100, fullMark: 100 },
      { subject: "Rétention", A: kpiData.customerRetention, fullMark: 100 },
      { subject: "NPS", A: kpiData.npsScore * 10, fullMark: 100 },
      { subject: "Croissance", A: kpiData.growthRate * 3, fullMark: 100 },
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

  const treemapData = categoriesData
    .filter(cat => cat.chiffreAffaires && cat.chiffreAffaires > 0)
    .map((cat, i) => ({
      name: cat.nom,
      size: cat.chiffreAffaires || 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }))
    .sort((a, b) => b.size - a.size)

  const barData = categoriesData
    .filter(cat => cat.chiffreAffaires && cat.chiffreAffaires > 0)
    .map((cat) => ({
      name: cat.nom.length > 12 ? cat.nom.substring(0, 10) + "..." : cat.nom,
      fullName: cat.nom,
      CA: cat.chiffreAffaires || 0,
      Produits: cat.nbProduits || 0,
      Ventes: cat.ventes || 0,
      Marge: cat.margeMoyenne || 0,
    }))
    .sort((a, b) => b.CA - a.CA)
    .slice(0, 10)

  const ChartViewSelector = ({
    chartType,
    onTypeChange,
    options
  }: {
    chartType: string,
    onTypeChange: (type: any) => void,
    options: Array<{ value: string, label: string, icon: React.ReactNode }>
  }) => (
    <div className="flex gap-1 bg-slate-700/50 p-1 rounded-lg">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onTypeChange(option.value)}
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-all ${chartType === option.value
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-300 hover:bg-slate-600/50"
            }`}
          title={option.label}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  )

  return (
    <div ref={dashboardRef}>
      {loading && !dashboardStats ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : !dashboardStats ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Impossible de charger les données.</p>
          <button onClick={loadAllData} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-green-300">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300">
              {errorMessage}
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres Avancés
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="relative group">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                Exporter
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={exportToPDF}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 rounded-t-lg flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Rapport PDF Complet
                </button>
                <button
                  onClick={() => exportData("csv")}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Données CSV
                </button>
                <button
                  onClick={() => exportData("json")}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Données JSON
                </button>
                <button
                  onClick={exportToImage}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 rounded-b-lg flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Capture d'écran
                </button>
              </div>
            </div>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Mise à jour..." : "Actualiser"}
            </button>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Période</label>
                  <select
                    value={timeRange}
                    onChange={(e) => {
                      setTimeRange(e.target.value)
                      if (e.target.value !== "custom") {
                        setTimeout(() => applyTimeFilter(), 100)
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
                  >
                    <option value="today">Aujourd'hui</option>
                    <option value="last7days">7 derniers jours</option>
                    <option value="last30days">30 derniers jours</option>
                    <option value="last90days">90 derniers jours</option>
                    <option value="custom">Période personnalisée</option>
                  </select>
                </div>

                {timeRange === "custom" && (
                  <>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Date début</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Date fin</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {timeRange === "custom" && (
                  <button
                    onClick={applyTimeFilter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Appliquer Filtre
                  </button>
                )}
                <button
                  onClick={() => {
                    setTimeRange("last30days")
                    setTimeout(() => loadAllData(), 100)
                  }}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}

          {/* Navigation supprimée (horizontal menu) - géré par sidebar */}

          {/* VUE D'ENSEMBLE */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Chiffre d'Affaires"
                  value={`${(dashboardStats?.chiffreAffaires || 0).toLocaleString('fr-FR')} €`}
                  icon={<DollarSign className="w-6 h-6" />}
                  color="green"
                  trend={
                    kpiData?.growthRate ? { value: kpiData.growthRate, isPositive: kpiData.growthRate >= 0 } : undefined
                  }
                />
                <StatCard
                  title="Total Ventes"
                  value={dashboardStats?.totalVentes?.toLocaleString('fr-FR') || "0"}
                  icon={<ShoppingCart className="w-6 h-6" />}
                  color="blue"
                />
                <StatCard
                  title="Total Clients"
                  value={dashboardStats?.totalClients?.toLocaleString('fr-FR') || "0"}
                  icon={<Users className="w-6 h-6" />}
                  color="purple"
                />
                <StatCard
                  title="Produits"
                  value={dashboardStats?.totalProduits?.toLocaleString('fr-FR') || "0"}
                  icon={<Package className="w-6 h-6" />}
                  color="yellow"
                />
              </div>

              {/* Évolution CA & Ventes avec sélecteur de graphique */}
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Évolution CA & Ventes
                  </h3>
                  <ChartViewSelector
                    chartType={chartViewConfig.evolutionCA}
                    onTypeChange={(type) => setChartViewConfig(prev => ({ ...prev, evolutionCA: type }))}
                    options={[
                      { value: "composed", label: "Composé", icon: <BarChart3 className="w-4 h-4" /> },
                      { value: "line", label: "Ligne", icon: <LineChartIcon className="w-4 h-4" /> },
                      { value: "bar", label: "Barres", icon: <BarChartIcon className="w-4 h-4" /> },
                      { value: "area", label: "Aire", icon: <AreaChartIcon className="w-4 h-4" /> },
                    ]}
                  />
                </div>

                <ResponsiveContainer width="100%" height={320}>
                  {chartViewConfig.evolutionCA === "composed" ? (
                    <ComposedChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                      <YAxis
                        yAxisId="left"
                        stroke="#94a3b8"
                        fontSize={12}
                        label={{ value: "CA (€)", angle: -90, position: "insideLeft", style: { fill: "#94a3b8", fontSize: 11 } }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#94a3b8"
                        fontSize={12}
                        label={{ value: "Ventes", angle: -90, position: "insideRight", style: { fill: "#94a3b8", fontSize: 11 } }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "12px" }}
                        formatter={(value, name) => {
                          if (name === "CA") return [`${Number(value).toLocaleString('fr-FR')} €`, "Chiffre d'Affaires"]
                          if (name === "Ventes") return [value, "Nombre de ventes"]
                          return [value, name]
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="ca" name="CA" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="ventes" name="Ventes" stroke="#10b981" strokeWidth={3} />
                    </ComposedChart>
                  ) : chartViewConfig.evolutionCA === "line" ? (
                    <LineChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "12px" }} />
                      <Legend />
                      <Line type="monotone" dataKey="ca" name="CA (€)" stroke="#3b82f6" strokeWidth={3} />
                      <Line type="monotone" dataKey="ventes" name="Ventes" stroke="#10b981" strokeWidth={3} />
                    </LineChart>
                  ) : chartViewConfig.evolutionCA === "bar" ? (
                    <BarChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "12px" }} />
                      <Legend />
                      <Bar dataKey="ca" name="CA (€)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ventes" name="Ventes" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={monthlyStats}>
                      <defs>
                        <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "12px" }} />
                      <Legend />
                      <Area type="monotone" dataKey="ca" name="CA (€)" stroke="#3b82f6" fill="url(#colorCa)" strokeWidth={2} />
                      <Area type="monotone" dataKey="ventes" name="Ventes" stroke="#10b981" fill="url(#colorVentes)" strokeWidth={2} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Radar & Pie Charts */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Radar KPI avec sélecteur */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      Radar KPIs
                    </h3>
                    <ChartViewSelector
                      chartType={chartViewConfig.radarKPI}
                      onTypeChange={(type) => setChartViewConfig(prev => ({ ...prev, radarKPI: type }))}
                      options={[
                        { value: "radar", label: "Radar", icon: <Target className="w-4 h-4" /> },
                        { value: "bar", label: "Barres", icon: <BarChartIcon className="w-4 h-4" /> },
                      ]}
                    />
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    {chartViewConfig.radarKPI === "radar" ? (
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#475569" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                        <Radar name="Performance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} strokeWidth={2} />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                      </RadarChart>
                    ) : (
                      <BarChart data={radarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                        <Bar dataKey="A" name="Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Distribution catégories avec sélecteur */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-400" />
                      Répartition par Catégorie
                    </h3>
                    <ChartViewSelector
                      chartType={chartViewConfig.distributionCategories}
                      onTypeChange={(type) => setChartViewConfig(prev => ({ ...prev, distributionCategories: type }))}
                      options={[
                        { value: "pie", label: "Camembert", icon: <PieChartIcon className="w-4 h-4" /> },
                        { value: "bar", label: "Barres", icon: <BarChartIcon className="w-4 h-4" /> },
                        { value: "treemap", label: "Treemap", icon: <LayoutGrid className="w-4 h-4" /> },
                      ]}
                    />
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    {chartViewConfig.distributionCategories === "pie" ? (
                      <RechartsPie>
                        <Pie
                          data={pieData.slice(0, 8)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
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
                          formatter={(value, name, props) => {
                            const payload = props.payload
                            return [
                              `${Number(value).toLocaleString('fr-FR')} €`,
                              payload?.name || name,
                            ]
                          }}
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                        />
                      </RechartsPie>
                    ) : chartViewConfig.distributionCategories === "bar" ? (
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                          formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} €`, "Chiffre d'Affaires"]}
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                        />
                        <Bar dataKey="CA" name="CA (€)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <Treemap
                        data={treemapData}
                        dataKey="size"
                        stroke="#1e293b"
                        fill="#3b82f6"
                        content={
                          <CustomTreemapContent colors={CHART_COLORS} />
                        }
                      >
                        <Tooltip
                          formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} €`, "Chiffre d'Affaires"]}
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                        />
                      </Treemap>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Alertes */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Alertes ({alertes.length})
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alertes.slice(0, 6).map((alerte, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border transform transition-transform hover:scale-[1.02] ${alerte.priorite === "HAUTE"
                          ? "border-red-500/30 bg-red-500/10"
                          : alerte.priorite === "MOYENNE"
                            ? "border-amber-500/30 bg-amber-500/10"
                            : "border-blue-500/30 bg-blue-500/10"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-slate-400">{alerte.type}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${alerte.priorite === "HAUTE"
                              ? "bg-red-500/20 text-red-300"
                              : alerte.priorite === "MOYENNE"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                        >
                          {alerte.priorite}
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium">{alerte.produit}</p>
                      <p className="text-xs text-slate-400 mt-1">{alerte.message}</p>
                      {alerte.date && <p className="text-xs text-slate-500 mt-2">{alerte.date}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Analytics Avancé
              </h3>

              {/* Tendances avec sélecteur */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Tendances Hebdomadaires
                  </h3>
                  <ChartViewSelector
                    chartType={chartViewConfig.tendances}
                    onTypeChange={(type) => setChartViewConfig(prev => ({ ...prev, tendances: type }))}
                    options={[
                      { value: "area", label: "Aire", icon: <AreaChartIcon className="w-4 h-4" /> },
                      { value: "line", label: "Ligne", icon: <LineChartIcon className="w-4 h-4" /> },
                      { value: "bar", label: "Barres", icon: <BarChartIcon className="w-4 h-4" /> },
                    ]}
                  />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  {chartViewConfig.tendances === "area" ? (
                    <AreaChart data={trends}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fill="url(#colorValue)" name="Valeur (€)" />
                    </AreaChart>
                  ) : chartViewConfig.tendances === "line" ? (
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} name="Valeur (€)" />
                    </LineChart>
                  ) : (
                    <BarChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                      <Bar dataKey="value" name="Valeur (€)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Scatter Chart avec sélecteur */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Corrélation Stock / Ventes
                  </h3>
                  <ChartViewSelector
                    chartType={chartViewConfig.stockVentes}
                    onTypeChange={(type) => setChartViewConfig(prev => ({ ...prev, stockVentes: type }))}
                    options={[
                      { value: "scatter", label: "Nuage", icon: <Scatter className="w-4 h-4" /> },
                      { value: "line", label: "Ligne", icon: <LineChartIcon className="w-4 h-4" /> },
                    ]}
                  />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  {chartViewConfig.stockVentes === "scatter" ? (
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" dataKey="x" name="Stock" stroke="#94a3b8" fontSize={12} />
                      <YAxis type="number" dataKey="y" name="Ventes" stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                      />
                      <Legend />
                      <Scatter name="Produits" data={scatterData} fill="#f59e0b">
                        {scatterData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Scatter>
                      <ReferenceLine x={50} stroke="#3b82f6" strokeDasharray="3 3" />
                      <ReferenceLine y={5} stroke="#10b981" strokeDasharray="3 3" />
                    </ScatterChart>
                  ) : (
                    <LineChart data={scatterData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                      <Legend />
                      <Line type="monotone" dataKey="x" name="Stock" stroke="#3b82f6" strokeWidth={3} />
                      <Line type="monotone" dataKey="y" name="Ventes" stroke="#f59e0b" strokeWidth={3} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* PRODUITS */}
          {activeSection === "products" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Analyse des Produits
              </h3>

              {lowStockProducts.length > 0 && (
                <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 p-6 rounded-lg border border-red-700/50 mb-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                    Alertes Stock Faible ({lowStockProducts.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lowStockProducts.map((product, i) => (
                      <div key={i} className="bg-slate-800/40 rounded-lg p-4 border border-red-500/30 hover:border-red-500/50 transition-colors">
                        <h5 className="font-semibold text-white">{product.nom}</h5>
                        <p className="text-red-300 text-sm">{product.stock} unités restantes</p>
                        {product.seuilAlerte && (
                          <p className="text-slate-400 text-xs">Seuil: {product.seuilAlerte}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
                <h4 className="text-xl font-bold mb-6 text-white">Niveaux de Stock par Produit</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={dashboardStats?.top5Produits || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="nom" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                    <Legend />
                    <Bar dataKey="stock" name="Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="nombreVentes" name="Ventes" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table des produits avec pagination */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                  <h4 className="text-xl font-bold text-white">Liste des Produits</h4>
                  <div className="text-sm text-slate-400">
                    Affichage {((currentProductPage - 1) * productsPerPage) + 1} - {Math.min(currentProductPage * productsPerPage, topProducts.length)} sur {topProducts.length} produits
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Produit</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Catégorie</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Prix</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Stock</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Ventes</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">CA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts
                        .slice((currentProductPage - 1) * productsPerPage, currentProductPage * productsPerPage)
                        .map((product, i) => (
                          <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/40 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {/* Image du produit ou fallback */}
                                <div
                                  className="w-10 h-10 rounded-md flex items-center justify-center border border-slate-600"
                                  style={{ backgroundColor: `hsl(${((currentProductPage - 1) * productsPerPage + i) * 30 % 360}, 70%, 20%)` }}
                                >
                                  <span className="text-xs font-bold text-white">
                                    {product.nom?.charAt(0) || 'P'}
                                  </span>
                                </div>

                                <div>
                                  <div className="font-medium text-white">{product.nom}</div>
                                  <div className="text-xs text-slate-400 truncate max-w-[200px]">
                                    {product.nom?.length > 30 ? `${product.nom?.substring(0, 30)}...` : product.nom}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              {typeof product.categorie === 'object' ? product.categorie?.nom : product.categorie || "Non catégorisé"}
                            </td>
                            <td className="px-6 py-4 text-blue-400">
                              {product.prix ? product.prix.toFixed(2) :
                                ((product.quantiteVendue || 0) > 0
                                  ? ((product.chiffreAffaires || 0) / (product.quantiteVendue || 1)).toFixed(2)
                                  : "0.00")} €
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-bold ${(product.stock || 0) > 20
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : (product.stock || 0) > 5
                                      ? "bg-amber-500/20 text-amber-300"
                                      : "bg-red-500/20 text-red-300"
                                  }`}
                              >
                                {product.stock || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              {product.quantiteVendue || 0}
                            </td>
                            <td className="px-6 py-4 text-emerald-400 font-medium">
                              {product.chiffreAffaires?.toLocaleString('fr-FR') || "0"} €
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Page {currentProductPage} sur {Math.ceil(topProducts.length / productsPerPage)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentProductPage(1)}
                      disabled={currentProductPage === 1}
                      className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      «
                    </button>
                    <button
                      onClick={() => setCurrentProductPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentProductPage === 1}
                      className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Précédent
                    </button>

                    {/* Numéros de pages */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(topProducts.length / productsPerPage) }, (_, i) => i + 1)
                        .filter(page => {
                          const totalPages = Math.ceil(topProducts.length / productsPerPage)
                          if (totalPages <= 5) return true
                          if (page === 1 || page === totalPages) return true
                          if (Math.abs(page - currentProductPage) <= 1) return true
                          return false
                        })
                        .map((page, idx, arr) => (
                          <span key={page} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="px-2 text-slate-500">...</span>
                            )}
                            <button
                              onClick={() => setCurrentProductPage(page)}
                              className={`px-3 py-2 rounded-lg text-sm ${currentProductPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                              {page}
                            </button>
                          </span>
                        ))
                      }
                    </div>

                    <button
                      onClick={() => setCurrentProductPage(prev => Math.min(prev + 1, Math.ceil(topProducts.length / productsPerPage)))}
                      disabled={currentProductPage === Math.ceil(topProducts.length / productsPerPage)}
                      className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Suivant
                    </button>
                    <button
                      onClick={() => setCurrentProductPage(Math.ceil(topProducts.length / productsPerPage))}
                      disabled={currentProductPage === Math.ceil(topProducts.length / productsPerPage)}
                      className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VENTES */}
          {activeSection === "sales" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Analytique des Ventes
              </h3>

              <div className="grid lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Ventes totales"
                  value={dashboardStats?.totalVentes?.toLocaleString('fr-FR') || "0"}
                  icon={<ShoppingCart className="w-6 h-6" />}
                  color="blue"
                />
                <StatCard
                  title="Chiffre d'affaires"
                  value={`${(dashboardStats?.chiffreAffaires || 0).toLocaleString('fr-FR')} €`}
                  icon={<DollarSign className="w-6 h-6" />}
                  color="green"
                />
                <StatCard
                  title="Panier moyen"
                  value={`${kpiData?.averageOrderValue?.toFixed(2) || "0.00"} €`}
                  icon={<ShoppingCart className="w-6 h-6" />}
                  color="purple"
                />
                <StatCard
                  title="Taux conversion"
                  value={`${kpiData?.conversionRate?.toFixed(1) || "0.0"}%`}
                  icon={<TrendingUp className="w-6 h-6" />}
                  color="yellow"
                />
              </div>

              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
                <h4 className="text-xl font-bold mb-6 text-white">Évolution Mensuelle des Ventes</h4>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="ventes" name="Ventes" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} />
                    <Line type="monotone" dataKey="orders" name="Commandes" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Tendances */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h4 className="text-xl font-bold mb-6 text-white">Tendances par Période</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {trends.map((trend, i) => (
                    <div key={i} className="bg-slate-700/40 rounded-lg p-4 text-center hover:bg-slate-700/60 transition-colors">
                      <p className="text-slate-400 text-sm">{trend.period}</p>
                      <p className="text-xl font-bold text-white">{trend.value.toLocaleString('fr-FR')} €</p>
                      <p className={`text-xs font-semibold ${trend.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {trend.change >= 0 ? "↗" : "↘"} {Math.abs(trend.change)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CLIENTS */}
          {activeSection === "clients" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Analyse Clients
              </h3>

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h4 className="text-lg font-bold text-white">Top Clients par CA</h4>
                    <ChartViewSelector
                      chartType={chartViewConfig.topClients}
                      onTypeChange={(type) => setChartViewConfig(prev => ({ ...prev, topClients: type }))}
                      options={[
                        { value: "horizontalBar", label: "Barres", icon: <BarChartIcon className="w-4 h-4" /> },
                        { value: "bar", label: "Vertical", icon: <BarChart3 className="w-4 h-4" /> },
                        { value: "pie", label: "Camembert", icon: <PieChartIcon className="w-4 h-4" /> },
                      ]}
                    />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    {chartViewConfig.topClients === "horizontalBar" ? (
                      <BarChart data={bestClients.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                        <YAxis dataKey="nom" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                        <Bar dataKey="chiffreAffaires" name="CA (€)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    ) : chartViewConfig.topClients === "bar" ? (
                      <BarChart data={bestClients.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="nom" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                        <Bar dataKey="chiffreAffaires" name="CA (€)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <RechartsPie>
                        <Pie
                          data={bestClients.slice(0, 6).map((client, i) => ({
                            name: client.nom,
                            value: client.chiffreAffaires || 0,
                            fill: CHART_COLORS[i % CHART_COLORS.length],
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {bestClients.slice(0, 6).map((_, i) => (
                            <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                      </RechartsPie>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h4 className="text-lg font-bold mb-6 text-white">Métriques Clients</h4>
                  <div className="space-y-4">
                    {[
                      { label: "Clients totaux", value: dashboardStats?.totalClients || 0, unit: "" },
                      { label: "Taux rétention", value: kpiData?.customerRetention || 0, unit: "%" },
                      { label: "Score NPS", value: kpiData?.npsScore || 0, unit: "/10" },
                      { label: "Panier moyen", value: kpiData?.averageOrderValue || 0, unit: "€" },
                      { label: "Satisfaction", value: kpiData?.clientSatisfaction || 0, unit: "%" },
                    ].map((metric, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-700/40 rounded-lg hover:bg-slate-700/60 transition-colors">
                        <span className="text-slate-300">{metric.label}</span>
                        <span className="text-xl font-bold text-white">
                          {typeof metric.value === 'number' && metric.value % 1 !== 0 ? metric.value.toFixed(1) : metric.value}
                          {metric.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Liste clients */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h4 className="text-lg font-bold mb-6 text-white">Détail Clients</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bestClients.map((client, i) => (
                    <div key={i} className="bg-slate-700/40 rounded-lg p-4 flex items-center gap-4 hover:bg-slate-700/60 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">{client.nom?.charAt(0) || "C"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{client.nom}</p>
                        <p className="text-xs text-slate-400">{client.nombreVentes || 0} achats</p>
                        {client.email && <p className="text-xs text-slate-500 truncate">{client.email}</p>}
                      </div>
                      <p className="text-lg font-bold text-emerald-400 flex-shrink-0">
                        {client.chiffreAffaires?.toLocaleString('fr-FR') || "0"} €
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CATÉGORIES */}
          {activeSection === "categories" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Analyse par Catégorie
              </h3>

              {/* Distribution CA avec sélecteur */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h4 className="text-lg font-bold text-white">Distribution CA par Catégorie</h4>
                  <ChartViewSelector
                    chartType={chartViewConfig.distributionCategories}
                    onTypeChange={(type) => setChartViewConfig(prev => ({ ...prev, distributionCategories: type }))}
                    options={[
                      { value: "pie", label: "Camembert", icon: <PieChartIcon className="w-4 h-4" /> },
                      { value: "bar", label: "Barres", icon: <BarChartIcon className="w-4 h-4" /> },
                      { value: "treemap", label: "Treemap", icon: <LayoutGrid className="w-4 h-4" /> },
                      { value: "list", label: "Liste", icon: <List className="w-4 h-4" /> },
                    ]}
                  />
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 min-h-[400px]">
                  {chartViewConfig.distributionCategories === "pie" ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <RechartsPie>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, percent }: any) => {
                            const shortName = name.length > 15 ? name.substring(0, 13) + "..." : name
                            return `${shortName}: ${(percent * 100).toFixed(1)}%`
                          }}
                          labelLine={true}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} €`, "Chiffre d'Affaires"]}
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : chartViewConfig.distributionCategories === "bar" ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K €`} />
                        <Tooltip
                          formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} €`, "Chiffre d'Affaires"]}
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                        />
                        <Legend />
                        <Bar dataKey="CA" name="CA (€)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : chartViewConfig.distributionCategories === "treemap" ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <Treemap
                        data={treemapData}
                        dataKey="size"
                        stroke="#1e293b"
                        fill="#3b82f6"
                        content={<CustomTreemapContent colors={CHART_COLORS} />}
                      >
                        <Tooltip
                          formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} €`, "Chiffre d'Affaires"]}
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                        />
                      </Treemap>
                    </ResponsiveContainer>
                  ) : (
                    <div className="overflow-y-auto max-h-[350px]">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Catégorie</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">CA</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Produits</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Ventes</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Marge</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Part</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoriesData
                            .sort((a, b) => (b.chiffreAffaires || 0) - (a.chiffreAffaires || 0))
                            .map((cat, i) => {
                              const totalCA = categoriesData.reduce((sum, c) => sum + (c.chiffreAffaires || 0), 0)
                              const percentage = totalCA > 0 ? ((cat.chiffreAffaires || 0) / totalCA * 100).toFixed(1) : "0.0"

                              return (
                                <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/40">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                      />
                                      <span className="font-medium text-white">{cat.nom}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-emerald-400 font-semibold">
                                    {(cat.chiffreAffaires || 0).toLocaleString('fr-FR')} €
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">{cat.nbProduits}</td>
                                  <td className="px-4 py-3 text-blue-400">{cat.ventes || 0}</td>
                                  <td className="px-4 py-3 text-amber-400">{cat.margeMoyenne?.toFixed(1) || "0.0"}%</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                                        <div
                                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                      <span className="text-slate-300 text-sm w-10">{percentage}%</span>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance par catégorie avec sélecteur */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h4 className="text-lg font-bold mb-6 text-white">Performance par Catégorie</h4>
                  <ChartViewSelector
                    chartType={chartViewConfig.performanceCategories}
                    onTypeChange={(type) => setChartViewConfig(prev => ({ ...prev, performanceCategories: type }))}
                    options={[
                      { value: "composed", label: "Composé", icon: <BarChart3 className="w-4 h-4" /> },
                      { value: "bar", label: "Barres", icon: <BarChartIcon className="w-4 h-4" /> },
                      { value: "line", label: "Ligne", icon: <LineChartIcon className="w-4 h-4" /> },
                    ]}
                  />
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  {chartViewConfig.performanceCategories === "composed" ? (
                    <ComposedChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" height={60} />
                      <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "CA") return [`${Number(value).toLocaleString('fr-FR')} €`, "Chiffre d'Affaires"]
                          if (name === "Produits") return [value, "Nombre de produits"]
                          return [value, name]
                        }}
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="Produits" name="Produits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="CA" name="CA (€)" stroke="#10b981" strokeWidth={3} />
                    </ComposedChart>
                  ) : chartViewConfig.performanceCategories === "bar" ? (
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "CA") return [`${Number(value).toLocaleString('fr-FR')} €`, "Chiffre d'Affaires"]
                          if (name === "Produits") return [value, "Nombre de produits"]
                          return [value, name]
                        }}
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                      />
                      <Legend />
                      <Bar dataKey="Produits" name="Produits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="CA" name="CA (€)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "CA") return [`${Number(value).toLocaleString('fr-FR')} €`, "Chiffre d'Affaires"]
                          if (name === "Produits") return [value, "Nombre de produits"]
                          return [value, name]
                        }}
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="Produits" name="Produits" stroke="#3b82f6" strokeWidth={3} />
                      <Line type="monotone" dataKey="CA" name="CA (€)" stroke="#10b981" strokeWidth={3} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Détail catégories */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h4 className="text-lg font-bold mb-6 text-white">Détail par Catégorie</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoriesData
                    .sort((a, b) => (b.chiffreAffaires || 0) - (a.chiffreAffaires || 0))
                    .slice(0, 12)
                    .map((cat, i) => (
                      <div key={i} className="bg-slate-700/40 rounded-lg p-5 hover:bg-slate-700/60 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                          <h5 className="font-bold text-white text-lg truncate" title={cat.nom}>{cat.nom}</h5>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Produits</span>
                            <span className="text-white font-semibold">{cat.nbProduits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">CA</span>
                            <span className="text-emerald-400 font-semibold">
                              {(cat.chiffreAffaires || 0).toLocaleString('fr-FR')} €
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Ventes</span>
                            <span className="text-blue-400 font-semibold">{cat.ventes || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Marge moyenne</span>
                            <span className="text-amber-400 font-semibold">
                              {cat.margeMoyenne?.toFixed(1) || "0.0"}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ETL / IMPORT CSV */}
          {activeSection === "etl" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Upload className="w-7 h-7 text-cyan-400" />
                    Import CSV et ETL
                  </h2>
                  <p className="text-slate-400 mt-1">
                    Importer des données de ventes via fichier CSV avec traitement ETL automatique
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                <CsvEtlUpload />

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    À propos du processus ETL
                  </h3>
                  <div className="space-y-3 text-slate-300">
                    <div>
                      <h4 className="font-semibold text-white mb-1">Extract (Extraction)</h4>
                      <p className="text-sm text-slate-400">
                        Lecture et validation du fichier CSV uploadé avec parsing ligne par ligne.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Transform (Transformation)</h4>
                      <p className="text-sm text-slate-400">
                        Nettoyage des données, validation des types, normalisation et détection des doublons.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Load (Chargement)</h4>
                      <p className="text-sm text-slate-400">
                        Insertion des nouvelles données et mise à jour des existantes avec rapport détaillé.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-blue-300 mb-2">Format CSV attendu</h4>
                    <code className="text-xs text-slate-300 block">
                      nom,description,prix,stock,categorie,seuilAlerte,image
                    </code>
                    <p className="text-xs text-slate-400 mt-2">
                      Consultez le fichier <span className="font-mono bg-slate-700 px-1 rounded">exemple_produits.csv</span> et
                      <span className="font-mono bg-slate-700 px-1 ml-1 rounded">IMPORT_CSV_README.md</span> pour plus de détails.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RAPPORTS */}
          {activeSection === "reports" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Rapports et Exports
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Rapport Complet PDF",
                    desc: "Document PDF professionnel avec toutes les données",
                    icon: FileText,
                    action: exportToPDF,
                    color: "from-blue-600 to-cyan-600"
                  },
                  {
                    title: "Rapport Mensuel",
                    desc: "Performance complète du mois",
                    icon: Calendar,
                    action: () => exportData("csv"),
                    color: "from-purple-600 to-pink-600"
                  },
                  {
                    title: "Analyse Produits",
                    desc: "Top produits et gestion des stocks",
                    icon: Package,
                    action: () => exportData("json"),
                    color: "from-emerald-600 to-green-600"
                  },
                  {
                    title: "Analyse Clients",
                    desc: "Comportement et fidélité clients",
                    icon: Users,
                    action: exportToImage,
                    color: "from-amber-600 to-orange-600"
                  },
                ].map((report, i) => {
                  const IconComponent = report.icon
                  return (
                    <div
                      key={i}
                      className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all group"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`mb-4 p-3 rounded-full bg-gradient-to-r ${report.color}`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{report.title}</h4>
                        <p className="text-sm text-slate-400 mb-4">{report.desc}</p>
                        <button
                          onClick={report.action}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-sm font-medium transition-all transform group-hover:scale-105"
                        >
                          Générer le Rapport
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AnalysteDashboard