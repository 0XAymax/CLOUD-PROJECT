import axiosInstance from './axiosConfig';

export interface Category {
  id?: number;
  nom: string;
  description?: string;
}

export const categoryApi = {
  getAll: () => axiosInstance.get<Category[]>('/categories'),
  
  getById: (id: number) => axiosInstance.get<Category>(`/categories/${id}`),
  
  create: (category: Category) => axiosInstance.post<Category>('/categories', category),
  
  update: (id: number, category: Category) => 
    axiosInstance.put<Category>(`/categories/${id}`, category),
  
  delete: (id: number) => axiosInstance.delete(`/categories/${id}`),
};
