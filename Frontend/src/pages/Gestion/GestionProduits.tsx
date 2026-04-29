import { useState, useEffect } from 'react';
import { productApi, type Product } from '../../api/productApi';
import { categoryApi, type Category } from '../../api/categoryApi';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Loader from '../../components/common/Loader';

export default function GestionProduits() {
  const [produits, setProduits] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduit, setEditingProduit] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({
    nom: '',
    prix: 0,
    description: '',
    image: '',
    quantite: 0,
    categorie: undefined
  });

  useEffect(() => {
    fetchProduits();
    fetchCategories();
  }, []);

  const fetchProduits = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAll();
      setProduits(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      alert('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Préparer les données à envoyer au backend
      const dataToSend: any = {
        nom: formData.nom,
        prix: formData.prix,
        description: formData.description,
        image: formData.image,
        quantite: formData.quantite
      };

      // Si une catégorie est sélectionnée, envoyer l'objet complet
      if (formData.categorie?.id) {
        dataToSend.categorie = {
          id: formData.categorie.id
        };
      }

      if (editingProduit?.id) {
        await productApi.update(editingProduit.id, dataToSend);
        alert('Produit modifié avec succès');
      } else {
        await productApi.create(dataToSend);
        alert('Produit créé avec succès');
      }
      fetchProduits();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement du produit');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await productApi.delete(id);
        alert('Produit supprimé avec succès');
        fetchProduits();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const handleEdit = (produit: Product) => {
    setEditingProduit(produit);
    setFormData({
      nom: produit.nom,
      prix: produit.prix,
      description: produit.description || '',
      image: produit.image || '',
      quantite: produit.quantite || 0,
      categorie: produit.categorie
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduit(null);
    setFormData({
      nom: '',
      prix: 0,
      description: '',
      image: '',
      quantite: 0,
      categorie: undefined
    });
  };

  const filteredProduits = produits.filter(prod =>
    prod.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.categorie?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="p-6 max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nouveau Produit
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Qté
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Avis
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rang
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[200px]">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider sticky right-0 bg-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {filteredProduits.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-400">
                    Aucun produit trouvé
                  </td>
              </tr>
            ) : (
              filteredProduits.map((produit) => (
                <tr key={produit.id} className="hover:bg-slate-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                    {produit.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {produit.nom}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                    {produit.prix?.toFixed(2)} DH
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {produit.quantite || 0}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {produit.categorie?.nom || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {produit.rating ? `⭐ ${produit.rating.toFixed(1)}` : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {produit.reviews_count || 0}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {produit.rank ? `#${produit.rank}` : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300 max-w-[200px] truncate">
                    {produit.description || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-slate-800">
                    <button
                      onClick={() => handleEdit(produit)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => produit.id && handleDelete(produit.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal pour ajouter/modifier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-3xl mx-4 my-8 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingProduit ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du produit"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix (DH) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantité en stock
                  </label>
                  <input
                    type="number"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.categorie?.id || ''}
                    onChange={(e) => {
                      const selectedCat = categories.find(c => c.id === parseInt(e.target.value));
                      setFormData({ ...formData, categorie: selectedCat ? { id: selectedCat.id, nom: selectedCat.nom } : undefined });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Description du produit..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingProduit ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
