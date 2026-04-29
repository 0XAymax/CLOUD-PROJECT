import axiosInstance from './axiosConfig';

export interface Client {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  numeroTel?: string;
  address?: string;
  photoUrl?: string;
}

export const clientApi = {
  getAll: () => axiosInstance.get<Client[]>('/clients'),
  
  getById: (id: number) => axiosInstance.get<Client>(`/clients/${id}`),
  
  getByEmail: (email: string) => 
    axiosInstance.get<Client>(`/clients/by-email?email=${encodeURIComponent(email)}`),
  
  create: (client: Client) => axiosInstance.post<Client>('/clients', client),
  
  update: (id: number, client: Client) => 
    axiosInstance.put<Client>(`/clients/${id}`, client),
  
  delete: (id: number) => axiosInstance.delete(`/clients/${id}`),
};
