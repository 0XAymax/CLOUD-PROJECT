import { useState, useEffect } from "react";
import { clientApi, type Client } from "../../api/clientApi";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import Loader from "../../components/common/Loader";

export default function GestionClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Client>({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    numeroTel: "",
    address: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientApi.getAll();
      // Trier les clients par ID croissant (du plus petit au plus grand)
      const sortedClients = (response.data || []).sort((a: Client, b: Client) => (a.id || 0) - (b.id || 0));
      setClients(sortedClients);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      alert("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient?.id) {
        await clientApi.update(editingClient.id, formData);
        alert("Client modifié avec succès");
      } else {
        await clientApi.create(formData);
        alert("Client créé avec succès");
      }
      fetchClients();
      handleCloseModal();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert("Erreur lors de l'enregistrement du client");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Delete clicked, ID:", id);
    
    if (!id) {
      console.error("No ID provided");
      alert("ID du client invalide");
      return;
    }

    console.log("Showing confirmation dialog");
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce client ?"
    );
    
    console.log("Confirmation result:", confirmed);
    
    if (!confirmed) {
      return;
    }

    console.log("Calling delete API");
    deleteClient(id);
  };

  const deleteClient = async (id: number) => {
    try {
      console.log("Deleting client with ID:", id);
      await clientApi.delete(id);
      console.log("Delete successful");
      alert("Client supprimé avec succès");
      await fetchClients();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la suppression du client";
      alert(errorMessage);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      password: "",
      numeroTel: client.numeroTel || "",
      address: client.address || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      password: "",
      numeroTel: "",
      address: "",
    });
  };

  const filteredClients = clients.filter(
    (client) =>
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.numeroTel?.toLowerCase().includes(searchTerm.toLowerCase())
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
          Nouveau Client
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tableau des clients */}
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
                  Prénom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider sticky right-0 bg-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                      {client.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {client.nom}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                      {client.prenom}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {client.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {client.numeroTel || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {client.address || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium bg-slate-800">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(client);
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1 cursor-pointer"
                          type="button"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, client.id)}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
              {editingClient ? "Modifier le client" : "Nouveau client"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom"
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
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Prénom"
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
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {editingClient ? "Nouveau mot de passe" : "Mot de passe *"}
                  </label>
                  <input
                    type="password"
                    required={!editingClient}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      editingClient
                        ? "Laisser vide pour ne pas changer"
                        : "Mot de passe"
                    }
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.numeroTel}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroTel: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0600000000"
                  />
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adresse
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Adresse complète..."
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
                  {editingClient ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}