import { useEffect, useState } from 'react';
import { 
  Package, 
  DollarSign, 
  Search, 
  Star,
  Loader,
  AlertCircle,
  Check
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi, type Category } from '../../api/categoryApi';
import { clientApi, type Client } from '../../api/clientApi';
import { saleApi, type SaleRequest } from '../../api/saleApi';
import type { Product } from '../../api/productApi';

const CatalogueInvestisseur = () => {
  // États pour le catalogue
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // États pour les clients
  const [clients, setClients] = useState<Client[]>([]);
  
  // Messages
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Modal de vente
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [saleQuantity, setSaleQuantity] = useState<number>(1);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchClients();
  }, []);

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

  // Charger les clients
  const fetchClients = async () => {
    try {
      const response = await clientApi.getAll();
      const sortedClients = (response.data || []).sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
      setClients(sortedClients);
    } catch (error) {
      console.error("Erreur chargement clients:", error);
      setClients([]);
    }
  };

  // Filtrage des produits
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

  // Gestion des erreurs d'image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, productName: string) => {
    e.currentTarget.src = `https://placehold.co/300x300/1e293b/ffffff?text=${encodeURIComponent(
      productName || "Produit"
    )}`;
    e.currentTarget.onerror = null;
  };

  // Ouvrir le modal de vente/investissement
  const openSaleModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedClient(null);
    setSaleQuantity(1);
    setShowSaleModal(true);
  };

  // Effectuer un investissement
  const handleInvestment = async () => {
    if (!selectedProduct || !selectedClient || saleQuantity <= 0) {
      setErrorMessage("Veuillez sélectionner un client et une quantité valide");
      return;
    }

    if (saleQuantity > (selectedProduct.quantite || 0)) {
      setErrorMessage(`Stock insuffisant. Stock disponible: ${selectedProduct.quantite}`);
      return;
    }

    try {
      const now = new Date();
      const dateVente = now.toISOString().split("T")[0];
      const timeString = now.toTimeString();
      const heureVente = timeString.split(" ")[0];

      const venteData: SaleRequest = {
        clientId: selectedClient,
        produitId: selectedProduct.id!,
        dateVente: dateVente,
        heureVente: heureVente,
        quantite: saleQuantity,
      };

      await saleApi.create(venteData);
      setSuccessMessage("Investissement enregistré avec succès !");
      setShowSaleModal(false);
      
      // Recharger les produits
      await fetchProducts();
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Erreur lors de l'investissement:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Erreur lors de l'enregistrement de l'investissement";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  return (
    <>
      {/* Messages de succès/erreur */}
      {successMessage && (
        <div className="mb-6 bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* En-tête */}
        <div>
          <h2 className="text-3xl font-black mb-2 text-white">Catalogue Produits</h2>
          <p className="text-slate-400">Explorez et investissez dans nos produits</p>
        </div>

        {/* Section Catalogue avec bouton Investir */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher produits..."
                value={searchTerm || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 focus:border-blue-500/50 text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 focus:border-blue-500/50 text-white focus:outline-none"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Grille de produits */}
          {loadingProducts ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">Aucun produit trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-slate-900/60 rounded-xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  {/* Image produit */}
                  <div className="relative aspect-square overflow-hidden bg-slate-800">
                    <img
                      src={product.image || `https://placehold.co/300x300/1e293b/ffffff?text=${encodeURIComponent(product.nom || "Produit")}`}
                      alt={product.nom}
                      onError={(e) => handleImageError(e, product.nom || "Produit")}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.quantite !== undefined && product.quantite <= 5 && (
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold ${
                        product.quantite === 0 
                          ? 'bg-red-500/90' 
                          : 'bg-orange-500/90'
                      }`}>
                        {product.quantite === 0 ? 'Épuisé' : `${product.quantite} restant${product.quantite > 1 ? 's' : ''}`}
                      </div>
                    )}
                  </div>

                  {/* Infos produit */}
                  <div className="p-4">
                    <h4 className="font-bold text-white mb-1 line-clamp-1">{product.nom}</h4>
                    <p className="text-slate-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(product.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                      <span className="text-slate-400 text-xs ml-1">
                        ({(product.rating || 0).toFixed(1)})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {product.prix?.toFixed(2)} dhs
                      </span>
                      <span className="text-slate-500 text-xs">Stock: {product.quantite}</span>
                    </div>

                    {/* Bouton Investir */}
                    <button
                      onClick={() => openSaleModal(product)}
                      disabled={!product.quantite || product.quantite === 0}
                      className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Investir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'investissement */}
      {showSaleModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Investir dans un Produit</h3>
            
            <div className="mb-4">
              <label className="block text-slate-300 mb-2 font-semibold">Produit</label>
              <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700">
                <p className="text-white font-bold">{selectedProduct.nom}</p>
                <p className="text-slate-400 text-sm">Prix: {selectedProduct.prix?.toFixed(2)} dhs</p>
                <p className="text-slate-400 text-sm">Stock disponible: {selectedProduct.quantite}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-slate-300 mb-2 font-semibold">Client</label>
              <select
                value={selectedClient || ""}
                onChange={(e) => setSelectedClient(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-900/60 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.prenom} - {client.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 mb-2 font-semibold">Quantité</label>
              <input
                type="number"
                min="1"
                max={selectedProduct.quantite}
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-900/60 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="mb-6 bg-slate-900/60 rounded-lg p-3 border border-slate-700">
              <p className="text-slate-400 text-sm">Total:</p>
              <p className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {((selectedProduct.prix || 0) * saleQuantity).toFixed(2)} dhs
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSaleModal(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleInvestment}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-white font-semibold transition-all"
              >
                Confirmer l'Investissement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CatalogueInvestisseur;
