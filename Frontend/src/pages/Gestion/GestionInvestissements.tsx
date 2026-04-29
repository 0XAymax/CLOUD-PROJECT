import { useState, useEffect } from 'react';
import { investmentApi, type Investment } from '../../api/investmentApi';
import { investorApi, type Investor } from '../../api/investorApi';
import { productApi, type Product } from '../../api/productApi';
import { categoryApi, type Category } from '../../api/categoryApi';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../contexts/AuthContext';

export default function GestionInvestissements() {
  const { user } = useAuth();
  const isInvestisseur = user?.role === 'investisseur';
  
  const [investissements, setInvestissements] = useState<Investment[]>([]);
  const [investisseurs, setInvestisseurs] = useState<Investor[]>([]);
  const [produits, setProduits] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestissement, setEditingInvestissement] = useState<Investment | null>(null);
  const [formData, setFormData] = useState<Investment>({
    investisseur: undefined,
    produit: undefined,
    categorie: undefined,
    montantInvestissement: 0
  });
  const [investmentType, setInvestmentType] = useState<'produit' | 'categorie'>('produit');


  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [investRes, investorRes, productRes, catRes] = await Promise.all([
        investmentApi.getAll(),
        investorApi.getAll(),
        productApi.getAll(),
        categoryApi.getAll()
      ]);
      setInvestissements(investRes.data);
      setInvestisseurs(investorRes.data);
      setProduits(productRes.data);
      setCategories(catRes.data);
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
      const dataToSend: any = {
        montantInvestissement: formData.montantInvestissement
      };

      // Utiliser l'ID de l'investisseur connecté ou celui du formulaire
      const investisseurId = isInvestisseur ? user?.id : formData.investisseur?.id;
      if (investisseurId) {
        dataToSend.investisseur = { id: investisseurId };
      }
      
      // Selon le type d'investissement, envoyer produit OU catégorie
      if (investmentType === 'produit' && formData.produit?.id) {
        dataToSend.produit = { id: formData.produit.id };
      } else if (investmentType === 'categorie' && formData.categorie?.id) {
        dataToSend.categorie = { id: formData.categorie.id };
      }

      if (editingInvestissement?.investisseur?.id && editingInvestissement?.produit?.id) {
        await investmentApi.update(
          editingInvestissement.investisseur.id,
          editingInvestissement.produit.id,
          dataToSend
        );
        alert('Investissement modifié avec succès');
      } else {
        await investmentApi.create(dataToSend);
        if (investmentType === 'categorie') {
          alert('Investissements créés avec succès pour tous les produits de la catégorie !');
        } else {
          alert('Investissement créé avec succès');
        }
      }
      fetchAll();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement de l\'investissement');
    }
  };

  const handleDelete = async (idInvestisseur: number, idProduit: number, idCategorie: number) => {
    console.log('handleDelete called with:', { idInvestisseur, idProduit, idCategorie });
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cet investissement ?');
    console.log('Confirm result:', confirmed);
    if (confirmed) {
      try {
        console.log('Calling investmentApi.delete...');
        await investmentApi.delete(idInvestisseur, idProduit, idCategorie);
        console.log('Delete successful');
        alert('Investissement supprimé avec succès');
        fetchAll();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        let errorMessage = 'Erreur lors de la suppression de l\'investissement';
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

  const handleEdit = (investment: Investment) => {
    setEditingInvestissement(investment);
    // Déterminer le type d'investissement
    if (investment.produit?.id) {
      setInvestmentType('produit');
    } else if (investment.categorie?.id) {
      setInvestmentType('categorie');
    }
    setFormData({
      investisseur: investment.investisseur,
      produit: investment.produit,
      categorie: investment.categorie,
      montantInvestissement: investment.montantInvestissement
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInvestissement(null);
    setInvestmentType('produit');
    setFormData({
      investisseur: undefined,
      produit: undefined,
      categorie: undefined,
      montantInvestissement: 0
    });
  };

  const filteredInvestissements = investissements.filter(inv =>
    inv.investisseur?.nom_entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.investisseur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.produit?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.categorie?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nouvel Investissement
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un investissement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tableau des investissements */}
      <div className="bg-slate-800 rounded-lg shadow overflow-x-auto border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Nom Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Nom Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Nom Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Montant d'Investissement
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {filteredInvestissements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                  Aucun investissement trouvé
                </td>
              </tr>
            ) : (
              filteredInvestissements.map((investment, index) => (
                <tr key={index} className="hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {investment.investisseur?.nom_entreprise || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {investment.produit?.nom || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {investment.categorie?.nom || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                    {investment.montantInvestissement?.toFixed(2)} DH
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(investment)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                      type="button"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        console.log('Delete button clicked for investment:', investment);
                        if (investment.investisseur?.id && investment.produit?.id && investment.categorie?.id) {
                          console.log('IDs found:', { investisseur: investment.investisseur.id, produit: investment.produit.id, categorie: investment.categorie.id });
                          handleDelete(investment.investisseur.id, investment.produit.id, investment.categorie.id);
                        } else {
                          console.error('Missing IDs:', { investisseur: investment.investisseur?.id, produit: investment.produit?.id, categorie: investment.categorie?.id });
                          alert('ID investisseur, produit ou catégorie manquant');
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

      {/* Modal pour ajouter/modifier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-4 my-8 border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingInvestissement ? 'Modifier l\'investissement' : 'Nouvel investissement'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isInvestisseur && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Investisseur *
                    </label>
                    <select
                      required
                      value={formData.investisseur?.id || ''}
                      onChange={(e) => {
                        const selectedInv = investisseurs.find(i => i.id === parseInt(e.target.value));
                        setFormData({ 
                          ...formData, 
                          investisseur: selectedInv ? {
                            id: selectedInv.id,
                            nom: selectedInv.nom,
                            prenom: selectedInv.prenom,
                            nom_entreprise: selectedInv.nom_entreprise
                          } : undefined 
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!!editingInvestissement}
                    >
                      <option value="">Sélectionner un investisseur</option>
                      {investisseurs.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.nom_entreprise} - {inv.nom} {inv.prenom}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d'investissement *
                  </label>
                  <select
                    value={investmentType}
                    onChange={(e) => {
                      const type = e.target.value as 'produit' | 'categorie';
                      setInvestmentType(type);
                      // Réinitialiser les champs selon le type
                      if (type === 'produit') {
                        setFormData({ ...formData, categorie: undefined });
                      } else {
                        setFormData({ ...formData, produit: undefined });
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!!editingInvestissement}
                  >
                    <option value="produit">Investir dans un Produit</option>
                    <option value="categorie">Investir dans une Catégorie</option>
                  </select>
                </div>

                {investmentType === 'produit' ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Produit *
                      </label>
                      <select
                        required
                        value={formData.produit?.id || ''}
                        onChange={(e) => {
                          const selectedProd = produits.find(p => p.id === parseInt(e.target.value));
                          setFormData({ 
                            ...formData, 
                            produit: selectedProd ? { id: selectedProd.id, nom: selectedProd.nom } : undefined,
                            categorie: selectedProd?.categorie || undefined
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={!!editingInvestissement}
                      >
                        <option value="">Sélectionner un produit</option>
                        {produits.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.nom} ({prod.categorie?.nom || 'Sans catégorie'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Catégorie du produit
                      </label>
                      <input
                        type="text"
                        value={formData.categorie?.nom || '-'}
                        disabled
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-gray-400 rounded-lg"
                      />
                    </div>
                  </>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Catégorie *
                    </label>
                    <select
                      required
                      value={formData.categorie?.id || ''}
                      onChange={(e) => {
                        const selectedCat = categories.find(c => c.id === parseInt(e.target.value));
                        setFormData({ 
                          ...formData, 
                          categorie: selectedCat ? { id: selectedCat.id, nom: selectedCat.nom } : undefined
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!!editingInvestissement}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Montant d'Investissement (DH) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.montantInvestissement}
                    onChange={(e) => setFormData({ ...formData, montantInvestissement: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
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
                  {editingInvestissement ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
