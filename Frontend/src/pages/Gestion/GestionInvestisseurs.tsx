import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { investorApi, type Investor } from '../../api/investorApi';
import Loader from '../../components/common/Loader';

export default function GestionInvestisseurs() {
  const [investisseurs, setInvestisseurs] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestisseur, setEditingInvestisseur] = useState<Investor | null>(null);
  const [formData, setFormData] = useState<Investor>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    numeroTel: '',
    address: '',
    photoUrl: '',
    ice: '',
    nom_entreprise: '',
    adresse_entreprise: '',
    numero_entreprise: '',
    email_entreprise: '',
    logo_url: '',
    domaine_entreprise: '',
    capitalDisponible: 0
  });

  useEffect(() => {
    fetchInvestisseurs();
  }, []);

  const fetchInvestisseurs = async () => {
    try {
      setLoading(true);
      const response = await investorApi.getAll();
      setInvestisseurs(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des investisseurs:', error);
      alert('Erreur lors du chargement des investisseurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInvestisseur?.id) {
        await investorApi.update(editingInvestisseur.id, formData);
        alert('Investisseur modifié avec succès');
      } else {
        await investorApi.create(formData);
        alert('Investisseur créé avec succès');
      }
      fetchInvestisseurs();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement de l\'investisseur');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cet investisseur ?');
    if (confirmed) {
      try {
        await investorApi.delete(id);
        alert('Investisseur supprimé avec succès');
        fetchInvestisseurs();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        let errorMessage = 'Erreur lors de la suppression de l\'investisseur';
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

  const handleEdit = (investisseur: Investor) => {
    setEditingInvestisseur(investisseur);
    setFormData({
      nom: investisseur.nom,
      prenom: investisseur.prenom,
      email: investisseur.email,
      password: '',
      numeroTel: investisseur.numeroTel || '',
      address: investisseur.address || '',
      photoUrl: investisseur.photoUrl || '',
      ice: investisseur.ice || '',
      nom_entreprise: investisseur.nom_entreprise || '',
      adresse_entreprise: investisseur.adresse_entreprise || '',
      numero_entreprise: investisseur.numero_entreprise || '',
      email_entreprise: investisseur.email_entreprise || '',
      logo_url: investisseur.logo_url || '',
      domaine_entreprise: investisseur.domaine_entreprise || '',
      capitalDisponible: investisseur.capitalDisponible || 0
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInvestisseur(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      numeroTel: '',
      address: '',
      photoUrl: '',
      ice: '',
      nom_entreprise: '',
      adresse_entreprise: '',
      numero_entreprise: '',
      email_entreprise: '',
      logo_url: '',
      domaine_entreprise: '',
      capitalDisponible: 0
    });
  };

  const filteredInvestisseurs = investisseurs.filter(inv =>
    inv.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.numeroTel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.nom_entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.ice?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nouvel Investisseur
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un investisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-800 rounded-lg shadow border border-slate-700 overflow-x-auto">
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
                Prénom
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                ICE
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Domaine
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Capital
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {filteredInvestisseurs.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-700">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  {inv.id}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {inv.nom}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  {inv.prenom}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                  {inv.email}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                  {inv.numeroTel || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                  {inv.ice || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                  {inv.nom_entreprise || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                  {inv.domaine_entreprise || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  {inv.capitalDisponible?.toFixed(2)} DH
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(inv)}
                    className="text-blue-400 hover:text-blue-300 mr-4"
                    type="button"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if (inv.id) {
                        handleDelete(inv.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300"
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal pour ajouter/modifier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl mx-4 my-8 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingInvestisseur ? 'Modifier l\'investisseur' : 'Nouvel investisseur'}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Informations Personnelles */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Informations Personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de l'investisseur"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Prénom de l'investisseur"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="email@exemple.com"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mot de passe {editingInvestisseur ? '(laisser vide pour ne pas changer)' : '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      required={!editingInvestisseur}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.numeroTel}
                      onChange={(e) => setFormData({ ...formData, numeroTel: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Photo URL
                    </label>
                    <input
                      type="url"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="mb-4 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Adresse Personnelle
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Adresse personnelle"
                    />
                  </div>
                </div>
              </div>

              {/* Informations Entreprise */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Informations Entreprise</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ICE
                    </label>
                    <input
                      type="text"
                      value={formData.ice}
                      onChange={(e) => setFormData({ ...formData, ice: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Identifiant Commun de l'Entreprise"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom Entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.nom_entreprise}
                      onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Entreprise
                    </label>
                    <input
                      type="email"
                      value={formData.email_entreprise}
                      onChange={(e) => setFormData({ ...formData, email_entreprise: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@entreprise.com"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Téléphone Entreprise
                    </label>
                    <input
                      type="tel"
                      value={formData.numero_entreprise}
                      onChange={(e) => setFormData({ ...formData, numero_entreprise: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+212 5XX XXX XXX"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Domaine Entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.domaine_entreprise}
                      onChange={(e) => setFormData({ ...formData, domaine_entreprise: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Technologie, Finance, etc."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Capital Disponible (DH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.capitalDisponible}
                      onChange={(e) => setFormData({ ...formData, capitalDisponible: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="mb-4 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Adresse Entreprise
                    </label>
                    <textarea
                      value={formData.adresse_entreprise}
                      onChange={(e) => setFormData({ ...formData, adresse_entreprise: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Adresse complète de l'entreprise"
                    />
                  </div>
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
                  {editingInvestisseur ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}