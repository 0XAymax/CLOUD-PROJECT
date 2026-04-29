import axiosInstance from './axiosConfig';

export interface Investment {
  investisseur?: {
    id?: number;
    nom?: string;
    prenom?: string;
    nom_entreprise?: string;
  };
  produit?: {
    id?: number;
    nom?: string;
  };
  categorie?: {
    id?: number;
    nom?: string;
  };
  montantInvestissement: number;
}

export const investmentApi = {
  getAll: () => axiosInstance.get<Investment[]>('/investissements'),
  
  getById: (idInvestisseur: number, idProduit: number) => 
    axiosInstance.get<Investment>(`/investissements/${idInvestisseur}/${idProduit}`),
  
  getByInvestor: (idInvestisseur: number) => 
    axiosInstance.get<Investment[]>(`/investissements/investisseur/${idInvestisseur}`),

  getByCategorie: (idCategorie: number) => 
    axiosInstance.get<Investment[]>(`/investissements/categorie/${idCategorie}`),

  getByProduit: (idProduit: number) => 
    axiosInstance.get<Investment[]>(`/investissements/produit/${idProduit}`),
  
  create: (investment: Investment) => 
    axiosInstance.post<Investment>('/investissements', investment),
  
  update: (idInvestisseur: number, idProduit: number, investment: Investment) => 
    axiosInstance.put<Investment>(`/investissements/${idInvestisseur}/${idProduit}`, investment),
  
  delete: (idInvestisseur: number, idProduit: number, idCategorie: number) => 
    axiosInstance.delete(`/investissements/${idInvestisseur}/${idProduit}/${idCategorie}`),
};
