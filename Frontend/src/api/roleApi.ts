import axiosInstance from './axiosConfig';

export interface Role {
  idRole?: number;
  nameRole: string;
  description?: string;
}

export const roleApi = {
  getAll: () => axiosInstance.get<Role[]>('/roles'),
  
  getById: (id: number) => axiosInstance.get<Role>(`/roles/${id}`),
  
  create: (role: Role) => axiosInstance.post<Role>('/roles', role),
  
  update: (id: number, role: Role) => axiosInstance.put<Role>(`/roles/${id}`, role),
  
  delete: (id: number) => axiosInstance.delete(`/roles/${id}`),
};
