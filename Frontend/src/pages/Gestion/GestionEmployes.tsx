import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { employeeApi, type Employee, type Role, EtatEmploye } from '../../api/employeeApi';
import { roleApi } from '../../api/roleApi';

const GestionEmployes = () => {
  const [employes, setEmployes] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtat, setFilterEtat] = useState<string>('ALL');
  const [formData, setFormData] = useState<Employee>({
    nom: '',
    prenom: '',
    numeroTel: '',
    email: '',
    address: '',
    password: '',
    role: { idRole: 0, nameRole: '' },
    salaire: 0,
    etat: EtatEmploye.ACTIF,
  });

  useEffect(() => {
    fetchEmployes();
    fetchRoles();
  }, []);

  const fetchEmployes = async () => {
    setLoading(true);
    try {
      const response = await employeeApi.getAll();
      setEmployes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleApi.getAll();
      setRoles(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmploye) {
        await employeeApi.update(editingEmploye.id!, formData);
      } else {
        await employeeApi.create(formData);
      }
      await fetchEmployes();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'employé');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await employeeApi.delete(id);
        alert('Employé supprimé avec succès');
        await fetchEmployes();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'employé');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      numeroTel: '',
      email: '',
      address: '',
      password: '',
      role: { idRole: 0, nameRole: '' },
      salaire: 0,
      etat: EtatEmploye.ACTIF,
    });
    setEditingEmploye(null);
  };

  const filteredEmployes = employes.filter(emp => {
    const matchesSearch = 
      emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.nameRole.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEtat = filterEtat === 'ALL' || emp.etat === filterEtat;
    
    return matchesSearch && matchesEtat;
  });

  const getEtatColor = (etat: EtatEmploye) => {
    switch (etat) {
      case EtatEmploye.ACTIF:
        return 'bg-green-500/20 text-green-400';
      case EtatEmploye.INACTIF:
        return 'bg-gray-500/20 text-gray-400';
      case EtatEmploye.RETRAITE:
        return 'bg-blue-500/20 text-blue-400';
      case EtatEmploye.SUSPENDU:
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nouvel Employé
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, email, rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterEtat}
            onChange={(e) => setFilterEtat(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous les états</option>
            <option value={EtatEmploye.ACTIF}>Actif</option>
            <option value={EtatEmploye.INACTIF}>Inactif</option>
            <option value={EtatEmploye.RETRAITE}>Retraité</option>
            <option value={EtatEmploye.SUSPENDU}>Suspendu</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-lg shadow overflow-x-auto border border-slate-700">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Salaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">État</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {filteredEmployes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-400">
                    Aucun employé trouvé
                  </td>
                </tr>
              ) : (
                filteredEmployes.map((employe) => (
                  <tr key={employe.id} className="hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{employe.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{employe.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{employe.prenom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{employe.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{employe.numeroTel || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {employe.role.nameRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {employe.salaire.toFixed(2)} DH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded ${getEtatColor(employe.etat)}`}>
                        {employe.etat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingEmploye(employe);
                          setFormData({
                            nom: employe.nom,
                            prenom: employe.prenom,
                            numeroTel: employe.numeroTel || '',
                            email: employe.email || '',
                            address: employe.address || '',
                            password: '',
                            role: employe.role,
                            salaire: employe.salaire,
                            etat: employe.etat,
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => employe.id && handleDelete(employe.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-4 my-8 border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingEmploye ? 'Modifier l\'Employé' : 'Nouvel Employé'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={formData.numeroTel}
                    onChange={(e) => setFormData({ ...formData, numeroTel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe {editingEmploye ? '(laisser vide pour ne pas changer)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={!editingEmploye}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rôle *
                  </label>
                  <select
                    value={formData.role.idRole}
                    onChange={(e) => {
                      const selectedRole = roles.find(r => r.idRole === parseInt(e.target.value));
                      if (selectedRole) {
                        setFormData({ ...formData, role: selectedRole });
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un rôle</option>
                    {roles.map((role) => (
                      <option key={role.idRole} value={role.idRole}>
                        {role.nameRole}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Salaire *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salaire}
                    onChange={(e) => setFormData({ ...formData, salaire: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    État *
                  </label>
                  <select
                    value={formData.etat}
                    onChange={(e) => setFormData({ ...formData, etat: e.target.value as EtatEmploye })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={EtatEmploye.ACTIF}>Actif</option>
                    <option value={EtatEmploye.INACTIF}>Inactif</option>
                    <option value={EtatEmploye.RETRAITE}>Retraité</option>
                    <option value={EtatEmploye.SUSPENDU}>Suspendu</option>
                  </select>
                </div>
                <div className="mb-4 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adresse
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingEmploye ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEmployes;
