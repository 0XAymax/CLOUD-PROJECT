import { saleApi } from '../api/saleApi';

export interface CustomerPurchase {
  id: string;
  client?: {
    id?: number;
    nom?: string;
    prenom?: string;
    email?: string;
  };
  produit?: {
    id?: number;
    nom?: string;
    prix?: number;
  };
  dateVente?: string;
  heureVente?: string;
  quantite: number;
  totalPrice: number;
}

export const fetchCustomerPurchases = async (clientId: number): Promise<CustomerPurchase[]> => {
  try {
    const response = await saleApi.getByClient(clientId);
    const purchases = response.data;
    
    // Ajoute le calcul du prix total pour chaque achat
    return purchases.map((purchase, index) => ({
      id: `${purchase.client?.id}_${purchase.produit?.id}_${purchase.dateVente}_${purchase.heureVente}_${index}`,
      ...purchase,
      totalPrice: (purchase.produit?.prix || 0) * purchase.quantite,
    }));
  } catch (error) {
    console.error('Erreur dans le service client :', error);
    throw error;
  }
};

export const fetchCustomerTotalSpent = async (clientId: number): Promise<number> => {
  try {
    const response = await saleApi.getTotalByClient(clientId);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du total des achats :', error);
    throw error;
  }
};

export const fetchCustomerOrderCount = async (clientId: number): Promise<number> => {
  try {
    const response = await saleApi.getCountByClient(clientId);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de commandes :', error);
    throw error;
  }
};
