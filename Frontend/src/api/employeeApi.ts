import axiosInstance from './axiosConfig';

export enum EtatEmploye {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
  RETRAITE = 'RETRAITE',
  SUSPENDU = 'SUSPENDU'
}

export interface Role {
  idRole?: number;
  nameRole: string;
  description?: string;
}

export interface Employee {
  id?: number;
  nom: string;
  prenom: string;
  numeroTel?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  password?: string;
  role: Role;
  salaire: number;
  etat: EtatEmploye;
  admin?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

export const employeeApi = {
  getAll: () => axiosInstance.get<Employee[]>('/employes'),
  
  getById: (id: number) => axiosInstance.get<Employee>(`/employes/${id}`),
  
  getByAdmin: (adminId: number) => axiosInstance.get<Employee[]>(`/employes/admin/${adminId}`),
  
  getByEtat: (etat: EtatEmploye) => axiosInstance.get<Employee[]>(`/employes/etat/${etat}`),
  
  create: (employee: Employee) => axiosInstance.post<Employee>('/employes', employee),
  
  update: (id: number, employee: Employee) => 
    axiosInstance.put<Employee>(`/employes/${id}`, employee),
  
  delete: (id: number) => axiosInstance.delete(`/employes/${id}`),
};
