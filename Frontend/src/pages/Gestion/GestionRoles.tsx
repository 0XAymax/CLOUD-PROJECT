import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { roleApi, type Role } from '../../api/roleApi';

const GestionRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ nameRole: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await roleApi.getAll();
      setRoles(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await roleApi.update(editingRole.idRole!, formData);
      } else {
        await roleApi.create(formData);
      }
      await fetchRoles();
      setShowModal(false);
      setFormData({ nameRole: '', description: '' });
      setEditingRole(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du rôle');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      try {
        await roleApi.delete(id);
        alert('Rôle supprimé avec succès');
        await fetchRoles();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du rôle');
      }
    }
  };

  const filteredRoles = roles.filter(role =>
    role.nameRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            setEditingRole(null);
            setFormData({ nameRole: '', description: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nouveau Rôle
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-700">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nom du Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                    Aucun rôle trouvé
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.idRole} className="hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{role.idRole}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{role.nameRole}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{role.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingRole(role);
                          setFormData({ nameRole: role.nameRole, description: role.description || '' });
                          setShowModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => role.idRole && handleDelete(role.idRole)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingRole ? 'Modifier le Rôle' : 'Nouveau Rôle'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du Rôle
                </label>
                <input
                  type="text"
                  value={formData.nameRole}
                  onChange={(e) => setFormData({ ...formData, nameRole: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Description du rôle (optionnel)"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingRole ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionRoles;
