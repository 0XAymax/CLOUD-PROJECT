import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Heart,
  Star,
  Package,
  Calendar,
  Clock,
  Check,
  Loader,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  TrendingUp,
  Search,
  Sparkles,
  X
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { productApi, type Product } from "../../api/productApi";
import { categoryApi, type Category } from "../../api/categoryApi";
import { clientApi, type Client } from "../../api/clientApi";
import { saleApi, type SaleRequest } from "../../api/saleApi";
import { fetchCustomerPurchases, type CustomerPurchase } from "../../services/clientService";
import { useClientDashboard } from "../../layouts/DashboardLayout";
import RatingModal from "../../components/common/RatingModal";
import IntelligentSearchBar from "../../components/IntelligentSearchBar";
import { type SearchResult, type SearchPattern } from "../../api/searchApi";

interface CartItem extends Product {
  quantity: number;
}

interface ProfileData {
  nom: string;
  prenom: string;
  email: string;
  numeroTel: string;
  address: string;
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const { setClientDashboardState } = useClientDashboard();
  
  // États existants
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [sales, setSales] = useState<CustomerPurchase[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState<Array<{id: number; nom: string; image?: string}>>([]);
  const [profileData, setProfileData] = useState<ProfileData>({
    nom: user?.name || "Client",
    prenom: "",
    email: user?.email || "",
    numeroTel: "",
    address: "",
  });

  // États pour la recherche intelligente
  const [isIntelligentSearch, setIsIntelligentSearch] = useState(false);
  const [searchPatterns, setSearchPatterns] = useState<SearchPattern[]>([]);
  const [intelligentSearchQuery, setIntelligentSearchQuery] = useState("");

  // Persistance du panier
  const saveCartToLocalStorage = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem("user_cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Erreur sauvegarde panier:", error);
    }
  };

  const loadCartFromLocalStorage = (): CartItem[] => {
    try {
      const savedCart = localStorage.getItem("user_cart");
      if (savedCart) {
        return JSON.parse(savedCart);
      }
    } catch (error) {
      console.error("Erreur chargement panier:", error);
    }
    return [];
  };

  // Charger les produits
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productApi.getAll();
      const sortedProducts = (response.data || []).sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      setErrorMessage("Impossible de charger les produits");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Charger les catégories
  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
      setCategories([]);
    }
  };

  // Charger les données du client
  const fetchClientData = async () => {
    try {
      setLoadingData(true);

      const email = user?.email;
      if (!email) {
        console.error("Email utilisateur non disponible");
        return;
      }

      const clientResponse = await clientApi.getByEmail(email);

      if (clientResponse.data) {
        const client = clientResponse.data;
        setClientData(client);

        setProfileData({
          nom: client.nom || user?.name || "Client",
          prenom: client.prenom || "",
          email: client.email || user?.email || "",
          numeroTel: client.numeroTel || "",
          address: client.address || "",
        });

        const clientId = client.id;
        if (clientId) {
          try {
            const salesData = await fetchCustomerPurchases(clientId);
            setSales(salesData);

            const spent = salesData.reduce(
              (sum, sale) => sum + sale.quantite * (sale.produit?.prix ?? 0),
              0
            );
            setTotalSpent(spent);
            setTotalOrders(salesData.length);
          } catch (error) {
            console.error("Erreur lors de la récupération des ventes:", error);
            setSales([]);
            setTotalSpent(0);
            setTotalOrders(0);
          }
        }
      }
    } catch (error) {
      console.error("Erreur chargement données client:", error);
      setErrorMessage("Impossible de charger les données du client");
      setSales([]);
      setTotalSpent(0);
      setTotalOrders(0);
    } finally {
      setLoadingData(false);
    }
  };

  // Gestion du checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMessage("Votre panier est vide");
      return;
    }

    try {
      const clientId = clientData?.id;

      if (!clientId) {
        setErrorMessage("Impossible d'identifier le client. Veuillez vous reconnecter.");
        return;
      }

      const now = new Date();
      const dateVente = now.toISOString().split("T")[0];
      const timeString = now.toTimeString();
      const heureVente = timeString.split(" ")[0];

      // Créer les ventes
      const ventePromises = cart.map((item) => {
        if (!item.id) return Promise.resolve();
        
        const venteData: SaleRequest = {
          clientId: clientId,
          produitId: item.id,
          dateVente: dateVente,
          heureVente: heureVente,
          quantite: item.quantity,
        };

        return saleApi.create(venteData);
      });

      await Promise.all(ventePromises);

      setSuccessMessage("Commande confirmée avec succès !");
      
      // Préparer les produits achetés pour le modal de rating
      const purchasedItems = cart
        .filter(item => item.id !== undefined)
        .map(item => ({
          id: item.id!,
          nom: item.nom,
          image: item.image
        }));
      setPurchasedProducts(purchasedItems);
      
      // Vider le panier
      setCart([]);
      localStorage.removeItem("user_cart");
      
      // Recharger les données
      await Promise.all([fetchClientData(), fetchProducts()]);
      
      // Afficher le modal de rating
      setTimeout(() => {
        setShowRatingModal(true);
        setSuccessMessage("");
      }, 1500);
    } catch (error: any) {
      console.error("Checkout error:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Erreur lors de la confirmation de la commande";
      setErrorMessage(errorMsg);
    }
  };

  // Gestion de la recherche intelligente
  const handleIntelligentSearch = (results: SearchResult[], query: string, patterns: SearchPattern[]) => {
    const formattedResults: Product[] = results.map(item => ({
      id: item.id_produit,
      nom: item.name,
      description: item.description || "",
      prix: item.prix,
      quantite: item.quantite,
      rating: item.rating || 0,
      reviews_count: item.reviews_count || 0,
      product_rank: item.product_rank || 0,
      categorie: item.name_categorie ? { 
        id: item.id_categorie || 0, 
        nom: item.name_categorie 
      } : undefined,
      image: item.photo_url || undefined
    }));
    
    setSearchPatterns(patterns);
    setIntelligentSearchQuery(query);
    setFilteredProducts(formattedResults);
    setIsIntelligentSearch(true);
    
    setSuccessMessage(`🔍 Recherche intelligente: "${query}" • ${formattedResults.length} résultats trouvés`);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Réinitialiser la recherche intelligente
  const resetSearch = () => {
    setFilteredProducts(products);
    setIsIntelligentSearch(false);
    setSearchPatterns([]);
    setIntelligentSearchQuery("");
    setSearchTerm("");
  };

  // Fonctions de filtrage standard
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    filterProducts(value, selectedCategory);
  };

  const handleCategoryFilter = (catId: string) => {
    setSelectedCategory(catId);
    filterProducts(searchTerm, catId);
  };

  const filterProducts = (search: string, catId: string) => {
    let filtered = products;

    if (catId !== "all") {
      filtered = filtered.filter((p) => p.categorie?.id === parseInt(catId));
    }

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.nom?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFilteredProducts(filtered);
  };

  // Gestion de la wishlist
  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Gestion du panier
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const availableStock = product.quantite || 0;
    
    if (currentQuantityInCart >= availableStock) {
      setErrorMessage(`Stock insuffisant pour ${product.nom}. Stock disponible: ${availableStock}`);
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    saveCartToLocalStorage(newCart);
    setSuccessMessage(`${product.nom} ajouté au panier !`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const removeFromCart = (productId: number) => {
    const newCart = cart.filter((item) => item.id !== productId);
    setCart(newCart);
    saveCartToLocalStorage(newCart);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const product = products.find(p => p.id === productId);
    const availableStock = product?.quantite || 0;
    
    if (quantity > availableStock) {
      setErrorMessage(`Stock insuffisant. Stock disponible: ${availableStock}`);
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    let newCart: CartItem[];
    if (quantity <= 0) {
      newCart = cart.filter((item) => item.id !== productId);
    } else {
      newCart = cart.map((item) => (item.id === productId ? { ...item, quantity } : item));
    }
    setCart(newCart);
    saveCartToLocalStorage(newCart);
  };

  // Gestion des erreurs d'image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, productName: string) => {
    e.currentTarget.src = `https://placehold.co/300x300/1e293b/ffffff?text=${encodeURIComponent(
      productName || "Produit"
    )}`;
    e.currentTarget.onerror = null;
  };

  // Initialisation
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoadingData(true);

      await Promise.all([fetchProducts(), fetchCategories()]);

      const savedCart = loadCartFromLocalStorage();
      if (savedCart.length > 0) {
        setCart(savedCart);
      }

      if (user?.email) {
        await fetchClientData();
      }

      setLoadingData(false);
    };

    initializeDashboard();
  }, [user?.email]);

  // Synchroniser l'état avec le layout
  useEffect(() => {
    const productsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
    setClientDashboardState({
      activeSection,
      setActiveSection,
      cartCount: productsInCart,
    });
  }, [activeSection, cart, setClientDashboardState]);

  // Calculs
  const cartTotal = cart.reduce((sum, item) => sum + (item.prix || 0) * item.quantity, 0);
  const productsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Gestion du modal de rating
  const handleRatingSuccess = () => {
    setSuccessMessage("Merci pour votre notation !");
    setTimeout(() => {
      setSuccessMessage("");
      setActiveSection("ventes");
    }, 2000);
  };

  const handleRatingClose = () => {
    setShowRatingModal(false);
    setPurchasedProducts([]);
    setActiveSection("ventes");
  };

  return (
    <div className="space-y-6">
      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        products={purchasedProducts}
        onClose={handleRatingClose}
        onSuccess={handleRatingSuccess}
      />

      {/* Messages de succès/erreur */}
      {successMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* VUE D'ENSEMBLE */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black mb-2 text-white">Bienvenue, {profileData.nom}! 👋</h2>
            <p className="text-slate-400">Voici un aperçu de votre espace client</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Total Achats",
                value: totalOrders,
                icon: Package,
                color: "from-blue-600 to-cyan-600",
              },
              {
                label: "Total Dépensé",
                value: `${totalSpent.toFixed(2)} dhs`,
                icon: TrendingUp,
                color: "from-emerald-600 to-teal-600",
              },
              {
                label: "Wishlist",
                value: wishlist.length,
                icon: Heart,
                color: "from-red-600 to-pink-600",
              },
              {
                label: "Panier",
                value: productsInCart,
                icon: ShoppingCart,
                color: "from-purple-600 to-pink-600",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-black text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-xl font-bold mb-6 text-white">Derniers Achats</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {sales
                .sort((a, b) => {
                  const dateA = new Date(`${a.dateVente} ${a.heureVente}`);
                  const dateB = new Date(`${b.dateVente} ${b.heureVente}`);
                  return dateB.getTime() - dateA.getTime();
                })
                .slice(0, 10)
                .map((sale) => (
                <div
                  key={`${sale.client?.id ?? 'c'}-${sale.produit?.id ?? 'p'}-${sale.dateVente ?? 'd'}-${sale.heureVente ?? 't'}`}
                  className="flex items-center justify-between p-4 bg-slate-700/40 rounded-xl hover:bg-slate-700/60 transition-all"
                >
                  <div>
                    <p className="font-semibold text-white">{sale.produit?.nom || "Produit"}</p>
                    <p className="text-xs text-slate-400">
                      {sale.dateVente ? new Date(sale.dateVente).toLocaleDateString("fr-FR") : ""} à{" "}
                      {sale.heureVente}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{(sale.quantite * (sale.produit?.prix ?? 0)).toFixed(2)} dhs</p>
                    <p className="text-xs text-slate-400">{sale.quantite} unité(s)</p>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">Aucun achat pour le moment</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MES ACHATS (VENTES) */}
      {activeSection === "ventes" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black mb-2 text-white">Mes Achats</h2>
          {loadingData ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50">
              <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">Aucun achat pour le moment</p>
              <button
                onClick={() => setActiveSection("products")}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold mt-4"
              >
                Commencer à acheter
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div
                  key={`${sale.client?.id ?? 'c'}-${sale.produit?.id ?? 'p'}-${sale.dateVente ?? 'd'}-${sale.heureVente ?? 't'}`}
                  className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{sale.produit?.nom || "Produit"}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />{" "}
                          {sale.dateVente ? new Date(sale.dateVente).toLocaleDateString("fr-FR") : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {sale.heureVente}
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" /> {sale.quantite} article(s)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {(sale.quantite * (sale.produit?.prix ?? 0)).toFixed(2)} dhs
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOUTIQUE AVEC RECHERCHE INTELLIGENTE */}
      {activeSection === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black mb-2 text-white">Boutique</h2>
            {isIntelligentSearch && (
              <button
                onClick={resetSearch}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-white transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Réinitialiser la recherche
              </button>
            )}
          </div>

          {/* Barre de recherche intelligente */}
          <IntelligentSearchBar
            onSearch={handleIntelligentSearch}
            userId={clientData?.id}
            placeholder="Recherche intelligente: ASIN_123, nom produit ou 'produits sous 50$'..."
            className="mb-6"
          />

          {/* Patterns détectés */}
          {searchPatterns.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-300 mb-1">Patterns détectés:</p>
                <div className="flex flex-wrap gap-2">
                  {searchPatterns.map((pattern, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 text-sm"
                    >
                      {pattern.match}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filtres standard */}
          {!isIntelligentSearch && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher produits..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 focus:border-blue-500/50 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 focus:border-blue-500/50 text-white focus:outline-none"
              >
                <option value="all">Toutes catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Info recherche intelligente */}
          {isIntelligentSearch && (
            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-slate-700/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 font-medium">
                    Recherche intelligente: "{intelligentSearchQuery}"
                  </p>
                  <p className="text-sm text-slate-400">
                    {filteredProducts.length} résultats • {searchPatterns.length} patterns détectés
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection("cart")}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Panier ({productsInCart})
                </button>
              </div>
            </div>
          )}

          {/* Liste des produits */}
          {loadingProducts ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50">
              <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">
                {isIntelligentSearch ? "Aucun résultat pour votre recherche" : "Aucun produit trouvé"}
              </p>
              {isIntelligentSearch && (
                <button
                  onClick={resetSearch}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold mt-4"
                >
                  Voir tous les produits
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Statistiques de recherche */}
              {isIntelligentSearch && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
                    <p className="text-sm text-slate-400">Produits trouvés</p>
                    <p className="text-2xl font-bold text-white">{filteredProducts.length}</p>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
                    <p className="text-sm text-slate-400">Prix moyen</p>
                    <p className="text-2xl font-bold text-white">
                      {(
                        filteredProducts.reduce((sum, p) => sum + (p.prix || 0), 0) / filteredProducts.length
                      ).toFixed(2)} dhs
                    </p>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
                    <p className="text-sm text-slate-400">Note moyenne</p>
                    <p className="text-2xl font-bold text-white">
                      {(
                        filteredProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / filteredProducts.length
                      ).toFixed(1)}/5
                    </p>
                  </div>
                </div>
              )}

              {/* Grille de produits */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group relative">
                    <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700/50 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg">
                      <div className="relative h-44 md:h-52 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                        <img
                          src={
                            product.image ||
                            `https://placehold.co/300x200/1e293b/ffffff?text=${encodeURIComponent(product.nom.substring(0, 10))}`
                          }
                          alt={product.nom}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => handleImageError(e, product.nom)}
                        />
                        <button
                          onClick={() => product.id && toggleWishlist(product.id)}
                          className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur-sm rounded-xl hover:bg-red-500/20 transition-all"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              product.id && wishlist.includes(product.id)
                                ? "fill-red-500 text-red-500"
                                : "text-white"
                            }`}
                          />
                        </button>
                        {(product.quantite || 0) > 0 && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/20 backdrop-blur-sm rounded-lg">
                            <span className="text-xs font-bold text-emerald-300">{product.quantite} en stock</span>
                          </div>
                        )}
                        {(product.quantite || 0) === 0 && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-red-500/20 backdrop-blur-sm rounded-lg">
                            <span className="text-xs font-bold text-red-300">Rupture</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-slate-400 ml-1">
                            ({(product.rating || 0).toFixed(1)})
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-white line-clamp-1">{product.nom}</h3>

                        <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            {product.prix} DHS
                          </span>
                          <span className="text-xs text-slate-500">
                            {product.categorie?.nom || "N/A"}
                          </span>
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          disabled={(product.quantite || 0) === 0}
                          className={`w-full py-2 rounded-xl font-semibold text-xs transition-all ${
                            (product.quantite || 0) === 0
                              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
                          }`}
                        >
                          {(product.quantite || 0) === 0 ? "Rupture de stock" : "Ajouter au panier"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* LISTE DE SOUHAITS */}
      {activeSection === "wishlist" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black mb-2 text-white">Ma Liste de Souhaits</h2>
          {wishlist.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50">
              <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">Votre wishlist est vide</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter((p) => p.id && wishlist.includes(p.id))
                .map((product) => (
                  <div
                    key={product.id}
                    className="group bg-slate-800/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-500/50 transition-all"
                  >
                    <div className="relative h-48 bg-slate-700 overflow-hidden">
                      <img
                        src={
                          product.image ||
                          `https://placehold.co/300x300/1e293b/ffffff?text=${encodeURIComponent(
                            product.nom
                          )}`
                        }
                        alt={product.nom}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => handleImageError(e, product.nom)}
                      />
                      <button
                        onClick={() => product.id && toggleWishlist(product.id)}
                        className="absolute top-3 right-3 p-2 bg-slate-900/80 rounded-xl hover:bg-red-500/20 transition-all"
                      >
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-white line-clamp-2">{product.nom}</h3>
                      <p className="text-sm text-slate-400 line-clamp-1">{product.description}</p>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-slate-400 ml-1">
                          ({(product.rating || 0).toFixed(1)})
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          {product.prix?.toFixed(2)} dhs
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={(product.quantite || 0) === 0}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          (product.quantite || 0) === 0
                            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
                        }`}
                      >
                        {(product.quantite || 0) === 0 ? "Rupture de stock" : "Ajouter au panier"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* PANIER */}
      {activeSection === "cart" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black mb-2 text-white">Mon Panier</h2>
          {cart.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50">
              <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">Votre panier est vide</p>
              <button
                onClick={() => setActiveSection("products")}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold mt-4"
              >
                Continuer vos achats
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
                  >
                    <div className="flex gap-4">
                      <img
                        src={
                          item.image ||
                          `https://placehold.co/100x100/1e293b/ffffff?text=${encodeURIComponent(item.nom)}`
                        }
                        alt={item.nom}
                        className="w-24 h-24 object-cover rounded-xl"
                        onError={(e) => handleImageError(e, item.nom)}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2">{item.nom}</h3>
                        <p className="text-slate-400 text-sm mb-3">{item.prix?.toFixed(2)} dhs</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 bg-slate-700/60 rounded-xl p-1">
                            <button
                              onClick={() => item.id && updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded-lg hover:bg-slate-600 transition-all"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <span className="px-3 font-semibold text-white">{item.quantity}</span>
                            <button
                              onClick={() => item.id && updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded-lg hover:bg-slate-600 transition-all"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          <button
                            onClick={() => item.id && removeFromCart(item.id)}
                            className="p-2 rounded-xl hover:bg-red-500/20 text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          {((item.prix || 0) * item.quantity).toFixed(2)} dhs
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sticky top-4">
                  <h3 className="text-xl font-bold mb-6 text-white">Résumé</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-slate-400">
                      <span>Sous-total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Livraison</span>
                      <span>Gratuite</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                  >
                    Confirmer la commande
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;