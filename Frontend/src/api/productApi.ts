import axiosInstance from './axiosConfig';

export interface Product {
  id?: number;
  nom: string;
  prix: number;
  description?: string;
  image?: string;
  quantite?: number;
  rank?: number;
  rating?: number;
  reviews_count?: number;
  categorie?: {
    id?: number;
    nom?: string;
  };
}

export const productApi = {
  getAll: () => axiosInstance.get<Product[]>('/produits'),
  
  getById: (id: number) => axiosInstance.get<Product>(`/produits/${id}`),
  
  search: (nom: string) => axiosInstance.get<Product[]>('/produits/search', { params: { nom } }),
  
  create: (product: Product) => axiosInstance.post<Product>('/produits', product),
  
  update: (id: number, product: Product) => 
    axiosInstance.put<Product>(`/produits/${id}`, product),
  
  delete: (id: number) => axiosInstance.delete(`/produits/${id}`),
};
