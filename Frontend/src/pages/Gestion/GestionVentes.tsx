import { useState, useEffect } from 'react';
import { saleApi, type Sale, type SaleRequest } from '../../api/saleApi';
import { clientApi, type Client } from '../../api/clientApi';
import { productApi, type Product } from '../../api/productApi';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Loader from '../../components/common/Loader';

export default function GestionVentes() {
  const [ventes, setVentes] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [produits, setProduits] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVente, setEditingVente] = useState<Sale | null>(null);
  const [formData, setFormData] = useState<Sale>({
    client: undefined,
    produit: undefined,
    quantite: 1,
    dateVente: '',
    heureVente: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [venteRes, clientRes, produitRes] = await Promise.all([
        saleApi.getAll(),
        clientApi.getAll(),
        productApi.getAll()
      ]);
      // Trier les ventes par date décroissante
      const sortedVentes = (venteRes.data || []).sort((a: Sale, b: Sale) => {
        const dateA = a.dateVente ? new Date(a.dateVente).getTime() : 0;
        const dateB = b.dateVente ? new Date(b.dateVente).getTime() : 0;
        return dateB - dateA;
      });
      setVentes(sortedVentes);
      setClients(clientRes.data);
      setProduits(produitRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validation
      if (!formData.client?.id) {
        alert('Veuillez sélectionner un client');
        return;
      }
      if (!formData.produit?.id) {
        alert('Veuillez sélectionner un produit');
        return;
      }
      if (!formData.quantite || formData.quantite <= 0) {
        alert('La quantité doit être supérieure à 0');
        return;
      }

      // Préparer les données au bon format pour le backend (VenteRequestDTO)
      const now = new Date();
      const dateVente = editingVente?.dateVente || now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const heureVente = editingVente?.heureVente || now.toTimeString().split(' ')[0]; // Format: HH:MM:SS

      const dataToSend: SaleRequest = {
        clientId: formData.client.id,
        produitId: formData.produit.id,
        quantite: formData.quantite,
        dateVente,
        heureVente
      };

      if (editingVente?.client?.id && editingVente?.produit?.id && editingVente?.dateVente && editingVente?.heureVente) {
        await saleApi.update(
          editingVente.client.id,
          editingVente.produit.id,
          editingVente.dateVente,
          editingVente.heureVente,
          dataToSend as any
        );
        alert('Vente modifiée avec succès');
      } else {
        await saleApi.create(dataToSend);
        alert('Vente créée avec succès');
      }
      fetchAll();
      handleCloseModal();
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      const errorMessage = error.response?.data || error.message || 'Erreur inconnue';
      alert(`Erreur lors de l'enregistrement de la vente: ${errorMessage}`);
    }
  };

  const handleDelete = async (clientId: number, produitId: number, dateVente: string, heureVente: string) => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?');
    if (confirmed) {
      try {
        await saleApi.delete(clientId, produitId, dateVente, heureVente);
        alert('Vente supprimée avec succès');
        fetchAll();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        let errorMessage = 'Erreur lors de la suppression de la vente';
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        alert(errorMessage);
      }
    }
  };

  const handleEdit = (vente: Sale) => {
    setEditingVente(vente);
    setFormData({
      client: vente.client,
      produit: vente.produit,
      quantite: vente.quantite,
      dateVente: vente.dateVente || '',
      heureVente: vente.heureVente || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVente(null);
    setFormData({
      client: undefined,
      produit: undefined,
      quantite: 1,
      dateVente: '',
      heureVente: ''
    });
  };

  const filteredVentes = ventes.filter(vente =>
    vente.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vente.client?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vente.produit?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vente.dateVente?.includes(searchTerm)
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
          Nouvelle Vente
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher une vente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tableau des ventes */}
      <div className="bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Prix Unitaire
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Heure
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {filteredVentes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-400">
                    Aucune vente trouvée
                  </td>
                </tr>
              ) : (
                filteredVentes.map((vente, index) => (
                  <tr key={index} className="hover:bg-slate-700">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vente.client?.id || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vente.produit?.id || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {vente.client?.nom} {vente.client?.prenom}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vente.produit?.nom || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vente.quantite}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vente.produit?.prix?.toFixed(2)} DH
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-semibold">
                      {((vente.produit?.prix || 0) * vente.quantite).toFixed(2)} DH
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vente.dateVente}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {vente.heureVente}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(vente)}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                        type="button"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (vente.client?.id && vente.produit?.id && vente.dateVente && vente.heureVente) {
                            handleDelete(vente.client.id, vente.produit.id, vente.dateVente, vente.heureVente);
                          } else {
                            alert('Informations de vente incomplètes');
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                        type="button"
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
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-4 my-8 border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingVente ? 'Modifier la vente' : 'Nouvelle vente'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client *
                  </label>
                  <select
                    id="client"
                    name="client"
                    required
                    value={formData.client?.id || ''}
                    onChange={(e) => {
                      const selectedClient = clients.find(c => c.id === parseInt(e.target.value));
                      setFormData({ 
                        ...formData, 
                        client: selectedClient ? {
                          id: selectedClient.id,
                          nom: selectedClient.nom,
                          prenom: selectedClient.prenom,
                          email: selectedClient.email
                        } : undefined 
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!!editingVente}
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nom} {client.prenom} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Produit *
                  </label>
                  <select
                    id="produit"
                    name="produit"
                    required
                    value={formData.produit?.id || ''}
                    onChange={(e) => {
                      const selectedProduit = produits.find(p => p.id === parseInt(e.target.value));
                      setFormData({ 
                        ...formData, 
                        produit: selectedProduit ? {
                          id: selectedProduit.id,
                          nom: selectedProduit.nom,
                          prix: selectedProduit.prix
                        } : undefined 
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!!editingVente}
                  >
                    <option value="">Sélectionner un produit</option>
                    {produits.map((produit) => (
                      <option key={produit.id} value={produit.id}>
                        {produit.nom} - {produit.prix?.toFixed(2)} DH
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantité *
                  </label>
                  <input
                    id="quantite"
                    name="quantite"
                    type="number"
                    min="1"
                    required
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>

                {formData.produit?.prix && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total
                    </label>
                    <input
                      type="text"
                      value={`${(formData.produit.prix * formData.quantite).toFixed(2)} DH`}
                      disabled
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-gray-400 rounded-lg"
                    />
                  </div>
                )}
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
                  {editingVente ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

