import axiosInstance from './axiosConfig';
import { type Product } from './productApi';

export interface RatingRequest {
  rating: number;
}

export const ratingApi = {
  // Mettre à jour le rating d'un produit (fait la moyenne si rating existe déjà)
  updateRating: (produitId: number, rating: number) => {
    return axiosInstance.patch<Product>(`/produits/${produitId}/rating`, { rating });
  },
};
