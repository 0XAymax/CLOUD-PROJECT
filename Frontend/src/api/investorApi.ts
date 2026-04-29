import axiosInstance from './axiosConfig';

export interface Investor {
  id?: number;
  // Attributs de Personne
  nom: string;
  prenom: string;
  numeroTel?: string;
  email: string;
  address?: string;
  photoUrl?: string;
  password?: string;
  // Attributs spécifiques à Investisseur
  ice?: string;
  nom_entreprise?: string;
  adresse_entreprise?: string;
  numero_entreprise?: string;
  email_entreprise?: string;
  logo_url?: string;
  domaine_entreprise?: string;
  capitalDisponible?: number;
}

export const investorApi = {
  getAll: () => axiosInstance.get<Investor[]>('/investisseurs'),
  
  getById: (id: number) => axiosInstance.get<Investor>(`/investisseurs/${id}`),
  
  create: (investor: Investor) => axiosInstance.post<Investor>('/investisseurs', investor),
  
  update: (id: number, investor: Investor) => 
    axiosInstance.put<Investor>(`/investisseurs/${id}`, investor),
  
  delete: (id: number) => axiosInstance.delete(`/investisseurs/${id}`),
};
