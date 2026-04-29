import axiosInstance from './axiosConfig';

export interface Sale {
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
}

export interface SaleRequest {
  clientId: number;
  produitId: number;
  dateVente: string;
  heureVente: string;
  quantite: number;
}

export const saleApi = {
  getAll: () => axiosInstance.get<Sale[]>('/ventes'),
  
  getById: (clientId: number, produitId: number, dateVente: string, heureVente: string) => 
    axiosInstance.get<Sale>(`/ventes/${clientId}/${produitId}/${dateVente}/${heureVente}`),
  
  getByClient: (clientId: number) => 
    axiosInstance.get<Sale[]>(`/ventes/client/${clientId}`),

  getByProduit: (produitId: number) => 
    axiosInstance.get<Sale[]>(`/ventes/produit/${produitId}`),
  
  getTotalByClient: (clientId: number) =>
    axiosInstance.get<number>(`/ventes/client/${clientId}/total`),
  
  getCountByClient: (clientId: number) =>
    axiosInstance.get<number>(`/ventes/client/${clientId}/count`),
  
  create: (sale: SaleRequest) => axiosInstance.post<Sale>('/ventes', sale),
  
  update: (clientId: number, produitId: number, dateVente: string, heureVente: string, sale: Sale) => 
    axiosInstance.put<Sale>(`/ventes/${clientId}/${produitId}/${dateVente}/${heureVente}`, sale),
  
  delete: (clientId: number, produitId: number, dateVente: string, heureVente: string) => 
    axiosInstance.delete(`/ventes/${clientId}/${produitId}/${dateVente}/${heureVente}`),
};
