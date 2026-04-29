import { useEffect, useState } from 'react';
import { saleApi, type SaleRequest } from '../../api/saleApi';
import { productApi } from '../../api/productApi';
import { clientApi } from '../../api/clientApi';
import type { Sale } from '../../api/saleApi';
import type { Product } from '../../api/productApi';
import type { Client } from '../../api/clientApi';
import SaleTable from '../../components/tables/SaleTable';
import SaleForm from '../../components/forms/SaleForm';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { alertService } from '../../services/alertService';
import { useAuth } from '../../contexts/AuthContext';

const SalesManagement = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>();

  const canCreateSale = user && (user.role === 'admin' || user.role === 'vendeur');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesRes, productsRes, clientsRes] = await Promise.all([
        saleApi.getAll(),
        productApi.getAll(),
        clientApi.getAll(),
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
      setClients(clientsRes.data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      alertService.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!canCreateSale) {
      alertService.error('Seuls les ADMIN et VENDEUR peuvent créer des ventes');
      return;
    }
    setSelectedSale(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleSubmit = async (saleRequest: SaleRequest) => {
    try {
      if (
        selectedSale?.client?.id != null &&
        selectedSale?.produit?.id != null &&
        selectedSale?.dateVente &&
        selectedSale?.heureVente
      ) {
        // Pour update, on envoie un SaleRequest au backend
        const updateRequest: SaleRequest = {
          clientId: saleRequest.clientId,
          produitId: saleRequest.produitId,
          dateVente: selectedSale.dateVente,
          heureVente: selectedSale.heureVente,
          quantite: saleRequest.quantite,
        };
        
        await saleApi.update(
          selectedSale.client.id,
          selectedSale.produit.id,
          selectedSale.dateVente,
          selectedSale.heureVente,
          updateRequest as any
        );
        alertService.success('Vente modifiée avec succès');
      } else {
        console.log('Creating sale with data:', saleRequest);
        await saleApi.create(saleRequest);
        alertService.success('Vente créée avec succès');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde de la vente:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 403) {
        alertService.error('Accès refusé. Vous devez être connecté en tant qu\'ADMIN ou VENDEUR pour créer une vente.');
      } else if (error.response?.status === 401) {
        alertService.error('Non authentifié. Veuillez vous reconnecter.');
      } else if (error.response?.status === 400) {
        const errorDetail = error.response?.data || 'Données invalides';
        alertService.error(`Erreur de validation: ${errorDetail}`);
      } else {
        const errorMessage = error.response?.data || error.message || 'Erreur inconnue';
        alertService.error(`Erreur: ${errorMessage}`);
      }
    }
  };

  const handleDelete = async (sale: Sale) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      try {
        const clientId = sale.client?.id;
        const produitId = sale.produit?.id;
        const dateVente = sale.dateVente;
        const heureVente = sale.heureVente;
        if (clientId == null || produitId == null || !dateVente || !heureVente) {
          console.error('Impossible de supprimer: identifiant de vente incomplet', sale);
          alertService.error('Identifiant de vente incomplet');
          return;
        }
        await saleApi.delete(clientId, produitId, dateVente, heureVente);
        alertService.success('Vente supprimée avec succès');
        loadData();
      } catch (error: any) {
        console.error('Erreur lors de la suppression de la vente:', error);
        const errorMessage = error.response?.data || error.message || 'Erreur inconnue';
        alertService.error(`Erreur lors de la suppression: ${errorMessage}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {!canCreateSale && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
          ⚠️ Vous n'avez pas les permissions pour créer ou modifier des ventes. Seuls les ADMIN et VENDEUR peuvent le faire.
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleCreate}
          disabled={!canCreateSale}
          className={`px-4 py-2 rounded-md ${
            canCreateSale 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          + Nouvelle Vente
        </button>
      </div>

      <SaleTable
        sales={sales}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSale ? 'Modifier la Vente' : 'Créer une Vente'}
        size="lg"
      >
        <SaleForm
          sale={selectedSale}
          products={products}
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default SalesManagement;
