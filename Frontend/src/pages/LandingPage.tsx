import { useState, useEffect } from "react"
import {
  Zap,
  Shield,
  Truck,
  HeadphonesIcon,
  Star,
  ShoppingBag,
  Sparkles,
  Award,
  Smartphone,
  Laptop,
  Headphones,
  Gamepad2,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  MapPin,
  Phone,
  Loader,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Wifi,
  Search,
  X,
  Eye,
  Package,
  Tag,
  TrendingUp,
  LogIn,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { productApi } from "../api/productApi"
import { categoryApi } from "../api/categoryApi"

interface Product {
  id: number
  nom: string
  description: string
  prix: number
  image?: string
  quantite?: number
  categorie?: {
    id: number
    nom: string
  }
  rating?: number
  nombreVentes?: number
}

interface Category {
  id?: number
  nom: string
  description?: string
}

export default function LandingPage() {
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [topProduct, setTopProduct] = useState<Product | null>(null)
  const [categoryScrollIndex, setCategoryScrollIndex] = useState(0)
  const [productScrollIndex, setProductScrollIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)

  const defaultCategories = [
    { id: 1, name: "Phones", icon: Smartphone, color: "from-blue-500 to-cyan-500" },
    { id: 2, name: "Computers", icon: Laptop, color: "from-purple-500 to-pink-500" },
    { id: 3, name: "Accessories", icon: Headphones, color: "from-orange-500 to-red-500" },
    { id: 4, name: "Laptops", icon: Laptop, color: "from-green-500 to-emerald-500" },
    { id: 5, name: "Monitors", icon: Monitor, color: "from-yellow-500 to-orange-500" },
    { id: 6, name: "Networking", icon: Wifi, color: "from-indigo-500 to-purple-500" },
    { id: 7, name: "PC Gaming", icon: Gamepad2, color: "from-teal-500 to-cyan-500" },
  ]

  const features = [
    {
      icon: Shield,
      title: "Paiements Sécurisés",
      description: "Transactions 100% sécurisées avec cryptage",
    },
    {
      icon: Truck,
      title: "Livraison Rapide",
      description: "Expédition express sous 24-48 heures",
    },
    {
      icon: Award,
      title: "Qualité Premium",
      description: "Produits authentiques avec garantie",
    },
    {
      icon: HeadphonesIcon,
      title: "Support 24/7",
      description: "Service client expert à tout moment",
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Charger les produits
        const productsResponse = await productApi.getAll()
        const productsData: Product[] = Array.isArray(productsResponse.data) 
          ? productsResponse.data.filter((p) => p.id !== undefined) as Product[]
          : []
        
        setAllProducts(productsData)
        // Ne pas définir products ici, laisser le useEffect de filtrage le faire
        
        // Trouver le produit le plus vendu
        const mostSoldProduct = productsData.reduce((prev, current) => {
          return (current.nombreVentes || 0) > (prev.nombreVentes || 0) ? current : prev
        }, productsData[0] || null)
        setTopProduct(mostSoldProduct)
        
        // Charger les catégories
        try {
          const categoriesResponse = await categoryApi.getAll()
          const categoriesData: Category[] = Array.isArray(categoriesResponse.data)
            ? categoriesResponse.data
            : []
          setCategories(categoriesData)
        } catch (catError) {
          console.warn('Catégories non disponibles, utilisation des catégories par défaut')
          setCategories([])
        }
        
        setError(null)
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err)
        setError('Impossible de charger les données.')
        setProducts([])
        setAllProducts([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrer les produits en fonction de la recherche et de la catégorie
  useEffect(() => {
    let filtered = [...allProducts]
    
    // Filtrer par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else {
      // Filtrer par rating > 2.5 seulement si pas de recherche active
      filtered = filtered.filter(product => (product.rating || 0) > 2.5)
    }
    
    // Filtrer par catégorie
    if (selectedCategory !== null) {
      filtered = filtered.filter(product => product.categorie?.id === selectedCategory)
    }
    
    // Trier par rating décroissant
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    
    setProducts(filtered)
  }, [searchQuery, selectedCategory, allProducts])

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 -z-20" />
      <div className="fixed inset-0 opacity-20 -z-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes shimmer { 0%, 100% { background-position: 200% 0; } 50% { background-position: -200% 0; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.5); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative w-11 h-11 animate-glow rounded-xl flex items-center justify-center font-bold text-slate-950 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 shadow-lg shadow-blue-500/25">
                <Zap className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent animate-shimmer">
                TechShop
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/')} className="text-white font-medium hover:text-blue-400 transition-colors border-b-2 border-blue-400 pb-1">
                Accueil
              </button>
              <a href="#a-propos" className="text-slate-300 font-medium hover:text-blue-400 transition-colors">À propos</a>
              <a href="#produits" className="text-slate-300 font-medium hover:text-blue-400 transition-colors">Boutique</a>
              <a href="#contact" className="text-slate-300 font-medium hover:text-blue-400 transition-colors">Contact</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Search Bar */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-slate-400 focus:outline-none w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-slate-700 rounded">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-sm">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span className="text-white text-sm">Produit le Plus Vendu 🔥</span>
              </div>

              <h1 className="text-4xl font-black text-white">
                {topProduct?.nom || "Chargement..."}
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Premium
                </span>
              </h1>

              <p className="text-slate-400">{topProduct?.description || ""}</p>

              <button
                onClick={() => navigate('/login')}
                className="group px-6 py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-white font-semibold flex items-center gap-2 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Acheter Maintenant
              </button>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-slate-900"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-slate-400 text-sm">{topProduct?.nombreVentes || 0} Ventes</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl px-4 py-2 text-white">
                <span className="text-xs">Prix</span>
                <p className="text-2xl font-black">{topProduct?.prix || 0} DHS</p>
              </div>

              <div className="relative h-80 lg:h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                <img
                  src={topProduct?.image || "https://placehold.co/500x400/1e293b/ffffff?text=Produit"}
                  alt={topProduct?.nom || "Produit le plus vendu"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About TechShop Section */}
      <section id="a-propos" className="py-12 lg:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 text-blue-400 text-sm mb-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              À Propos de Nous
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Bienvenue chez{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                TechShop
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              TechShop est votre destination de confiance pour tous vos besoins d'achat en ligne. 
              Depuis notre création, nous nous engageons à offrir une expérience d'achat exceptionnelle avec 
              une large gamme de produits de qualité, des prix compétitifs et un service client irréprochable.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Notre mission est de rendre vos achats simples et agréables. Nous sélectionnons soigneusement 
              chaque produit pour garantir votre satisfaction, offrons des paiements sécurisés, une livraison 
              rapide et un support disponible 24/7. Chez TechShop, votre confiance est notre priorité et nous 
              sommes là pour vous accompagner dans chacun de vos achats.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5"
            >
              Rejoignez-nous
            </button>
          </div>
        </div>
      </section>

      {/* Categories Carousel Section */}
      <section className="py-12 lg:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-400 text-sm mb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Catégories
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Parcourir par{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Catégorie
                </span>
              </h2>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Toutes
            </button>
          </div>

          {/* Carousel avec boutons de navigation */}
          <div className="relative group">
            {/* Bouton Précédent */}
            <button
              onClick={() => setCategoryScrollIndex(Math.max(0, categoryScrollIndex - 1))}
              disabled={categoryScrollIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed -translate-x-6"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Bouton Suivant */}
            <button
              onClick={() => {
                const maxIndex = Math.max(0, (categories.length > 0 ? categories : defaultCategories).length - 5);
                setCategoryScrollIndex(Math.min(maxIndex, categoryScrollIndex + 1));
              }}
              disabled={categoryScrollIndex >= Math.max(0, (categories.length > 0 ? categories : defaultCategories).length - 5)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed translate-x-6"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <div className="overflow-hidden">
              <div 
                className="flex gap-4 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${categoryScrollIndex * 176}px)` }}
              >
                {(categories.length > 0 ? categories : defaultCategories).map((category, index) => {
                  const isSelected = categories.length > 0 
                    ? selectedCategory === category.id
                    : false;
                  const Icon = defaultCategories[index]?.icon || Sparkles;
                  const colorClass = defaultCategories[index]?.color || "from-blue-500 to-cyan-500";
                  
                  return (
                    <button
                      key={category.id || index}
                      onClick={() => setSelectedCategory(
                        categories.length > 0 
                          ? (selectedCategory === category.id ? null : (category.id ?? null))
                          : null
                      )}
                      className={`flex-shrink-0 w-40 transition-all duration-300 ${
                        isSelected ? 'scale-110' : 'hover:scale-105'
                      }`}
                    >
                      <div className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-br ' + colorClass + ' border-transparent shadow-2xl shadow-blue-500/40'
                          : 'bg-slate-900/60 backdrop-blur-xl border-slate-700/50 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20'
                      }`}>
                        <div className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-white/20'
                            : 'bg-gradient-to-br ' + colorClass
                        }`}>
                          <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-white'}`} />
                        </div>
                        <p className={`text-sm font-bold text-center transition-colors ${
                          isSelected ? 'text-white' : 'text-slate-300'
                        }`}>
                          {'nom' in category ? category.nom : category.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Indicateurs de pagination */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.ceil((categories.length > 0 ? categories : defaultCategories).length / 5) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCategoryScrollIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === Math.floor(categoryScrollIndex / 5)
                      ? 'w-8 bg-gradient-to-r from-blue-500 to-cyan-500'
                      : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
          <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 text-sm">{feature.description}</p>
          </div>
        ))}
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section id="produits" className="py-12 lg:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-400 text-sm mb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                Nos Produits
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Explorez nos
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Produits
                </span>
              </h2>
              
              {/* Search Bar */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50 max-w-md mt-4">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white placeholder-slate-400 focus:outline-none w-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-slate-700 rounded">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>

              {searchQuery && (
                <p className="text-slate-400 text-sm mt-2">
                  {products.length} résultat{products.length !== 1 ? 's' : ''} pour "{searchQuery}"
                </p>
              )}
              {selectedCategory !== null && (
                <p className="text-slate-400 text-sm mt-2">
                  Catégorie: {categories.find(c => c.id === selectedCategory)?.nom}
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg mb-4">
                {searchQuery || selectedCategory !== null 
                  ? "Aucun produit trouvé avec ces critères"
                  : "Aucun produit disponible"
                }
              </p>
              {(searchQuery || selectedCategory !== null) && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory(null)
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-all"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Product Carousel */}
              <div className="relative group">
                {/* Navigation Buttons */}
                <button
                  onClick={() => setProductScrollIndex(Math.max(0, productScrollIndex - 1))}
                  disabled={productScrollIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed -translate-x-1/2"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => setProductScrollIndex(Math.min(Math.ceil(products.length / 4) - 1, productScrollIndex + 1))}
                  disabled={productScrollIndex >= Math.ceil(products.length / 4) - 1}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed translate-x-1/2"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Carousel Container */}
                <div className="overflow-hidden px-2">
                  <div 
                    className="flex gap-4 md:gap-6 transition-transform duration-500 ease-out"
                    style={{ 
                      transform: `translateX(-${productScrollIndex * 100}%)` 
                    }}
                  >
                    {products.map((product) => (
                      <div 
                        key={product.id} 
                        className="flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowProductModal(true)
                        }}
                      >
                        <div className="group/card relative h-full">
                          <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700/50 group-hover/card:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 hover:scale-105">
                            <div className="relative h-44 md:h-52 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                              <img
                                src={product.image || `https://placehold.co/300x200/1e293b/ffffff?text=${encodeURIComponent(product.nom.substring(0, 10))}`}
                                alt={product.nom}
                                className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                              />
                              {/* Quick View Badge */}
                              <div className="absolute top-2 right-2 p-2 rounded-full bg-blue-600/80 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>

                            <div className="p-4 space-y-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                                  />
                                ))}
                              </div>

                              <h3 className="text-sm font-semibold text-white line-clamp-1">{product.nom}</h3>

                              <div className="flex items-center gap-2">
                                <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                  {product.prix} DHS
                                </span>
                              </div>

                              <div className="flex gap-1.5 pt-1">
                                <div className="w-3 h-3 rounded-full bg-red-500 border border-slate-600" />
                                <div className="w-3 h-3 rounded-full bg-blue-500 border border-slate-600" />
                                <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination Indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: Math.ceil(products.length / 4) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setProductScrollIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === productScrollIndex 
                          ? 'w-8 bg-gradient-to-r from-blue-600 to-cyan-600' 
                          : 'w-2 bg-slate-700 hover:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowProductModal(false)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-blue-500/10 animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 transition-all duration-200 group"
            >
              <X className="w-5 h-5 text-slate-400 group-hover:text-white" />
            </button>

            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Product Image */}
              <div className="relative">
                <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
                  <img
                    src={selectedProduct.image || `https://placehold.co/400x400/1e293b/ffffff?text=${encodeURIComponent(selectedProduct.nom)}`}
                    alt={selectedProduct.nom}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge */}
                  {selectedProduct.quantite && selectedProduct.quantite > 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/50">
                      <span className="text-green-400 text-xs font-semibold">En Stock</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery (optional - can be added later) */}
                <div className="flex gap-2 mt-3">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="w-16 h-16 rounded-lg border-2 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer overflow-hidden bg-slate-800"
                    >
                      <img
                        src={selectedProduct.image || `https://placehold.co/80x80/1e293b/ffffff?text=${i}`}
                        alt={`Thumbnail ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex flex-col space-y-4">
                {/* Category Badge */}
                <div className="inline-flex items-center gap-2 w-fit">
                  <Tag className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    {categories.find(c => c.id === selectedProduct.categorie?.id)?.nom || "Catégorie"}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-2xl font-black text-white mb-2">
                    {selectedProduct.nom}
                  </h2>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(selectedProduct.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                        />
                      ))}
                    </div>
                    <span className="text-slate-400 text-xs">
                      ({selectedProduct.rating?.toFixed(1) || "0.0"})
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    Description
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {selectedProduct.description || "Découvrez ce produit exceptionnel qui allie qualité et performance. Conçu avec les dernières technologies pour répondre à tous vos besoins."}
                  </p>
                </div>

                {/* Specifications */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs">Prix</p>
                    <p className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {selectedProduct.prix} DHS
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs">Stock</p>
                    <p className="text-white text-sm font-semibold">
                      {selectedProduct.quantite || 0} unités
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs">Référence</p>
                    <p className="text-white text-xs font-mono">
                      #{selectedProduct.id}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs">Popularité</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-white text-xs font-semibold">Haute</span>
                    </div>
                  </div>
                </div>

                {/* Login Button */}
                <div className="pt-4">
                  <button 
                    onClick={() => {
                      setShowProductModal(false);
                      window.location.href = '/login';
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Commander
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="relative z-10 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Zap className="w-5 h-5 text-slate-950" />
                </div>
                <h3 className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  TechShop
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Votre destination de confiance pour la technologie et l'innovation premium.
              </p>
              <div className="flex gap-3">
                <button className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 group">
                  <Instagram className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </button>
                <button className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 group">
                  <Facebook className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </button>
                <button className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 group">
                  <Twitter className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm">support@techshop.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm">123 Tech Street, Silicon Valley, CA 94025</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-slate-500 text-sm">© 2025 TechShop. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
