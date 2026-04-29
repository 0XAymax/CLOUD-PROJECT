import { authApi } from '../api/authApi';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  adresse?: string;
  userType?: 'client' | 'employe' | 'investisseur';
  role?: string;
  photoUrl?: string;
  
  // Champs spécifiques investisseur
  ice?: string;
  nomEntreprise?: string;
  adresseEntreprise?: string;
  numeroEntreprise?: string;
  emailEntreprise?: string;
  logoUrl?: string;
  domaineEntreprise?: string;
  capitalDisponible?: number;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'vendeur' | 'analyste' | 'client' | 'investisseur';
  token: string;
}

/**
 * Service pour gérer l'authentification
 */
export const authService = {
  /**
   * Connexion d'un utilisateur
   */
  login: async (credentials: LoginCredentials): Promise<UserData> => {
    try {
      const response = await authApi.login(credentials);
      console.log('✅ Login successful:', response.data);
      
      const userData = response.data;
      const user: UserData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as 'admin' | 'vendeur' | 'analyste' | 'client' | 'investisseur',
        token: userData.token,
      };
      
      return user;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Email ou mot de passe incorrect.";
      console.error('❌ Login Error:', err);
      throw new Error(errorMsg);
    }
  },

  /**
   * Inscription d'un nouveau client
   */
  signup: async (data: SignupData): Promise<UserData> => {
    try {
      const signupRequest = {
        ...data,
        userType: data.userType || 'client' as 'client' | 'employe' | 'investisseur',
      };
      const response = await authApi.signup(signupRequest);
      console.log('✅ Signup successful:', response.data);
      
      const userData = response.data;
      const user: UserData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as 'admin' | 'vendeur' | 'analyste' | 'client' | 'investisseur',
        token: userData.token,
      };
      
      return user;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erreur lors de l'inscription.";
      console.error('❌ Signup Error:', err);
      throw new Error(errorMsg);
    }
  },

  /**
   * Déconnexion d'un utilisateur
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.replace('/login');
  },
};
