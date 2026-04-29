import axiosInstance from './axiosConfig';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  adresse?: string;
  userType: 'client' | 'employe' | 'investisseur';
  role?: string;

  // Personne (optionnel)
  photoUrl?: string;

  // Investisseur (optionnels)
  ice?: string;
  nomEntreprise?: string;
  adresseEntreprise?: string;
  numeroEntreprise?: string;
  emailEntreprise?: string;
  logoUrl?: string;
  domaineEntreprise?: string;
  capitalDisponible?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'vendeur' | 'analyste' | 'client' | 'investisseur';
  roleName?: string;
  token: string;
}

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  roleName: string;
  token: string;
}

export const authApi = {
  login: (credentials: LoginRequest) => 
    axiosInstance.post<AuthResponse>('/api/auth/login', credentials),
  
  signup: (data: SignupRequest) => 
    axiosInstance.post('/api/auth/signup', data),
  
  getCurrentUser: () => 
    axiosInstance.get<User>('/api/auth/me'),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
