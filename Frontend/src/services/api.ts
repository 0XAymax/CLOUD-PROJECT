import axios from 'axios';

// URL de votre backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api';

// Configuration axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important pour les cookies/sessions
});

// Intercepteur pour ajouter le token à chaque requête (si JWT)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interface pour les données d'inscription
export interface SignupData {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    tel?: string;
    adresse?: string;
    userType: 'client' | 'investisseur' | 'employe';
    role?: string;
}

// Interface pour les données de connexion
export interface LoginData {
    email: string;
    password: string;
}

// Interface pour l'utilisateur
export interface User {
    id: number;
    name: string;
    email: string;
    userType: string;
    role?: string;
    token?: string;
}

// Service d'authentification
export const authService = {
    // Inscription
    async signup(userData: SignupData): Promise<User> {
        try {
            console.log('📤 Envoi des données d\'inscription:', userData);
            console.log('🌐 URL:', `${API_BASE_URL}/auth/signup`);
            
            const response = await api.post('/auth/signup', userData);
            
            console.log('✅ Réponse du serveur:', response.data);
            console.log('📊 Status:', response.status);
            
            return response.data;
        } catch (error: any) {
            console.error('❌ Erreur complète:', error);
            console.error('📋 Réponse erreur:', error.response?.data);
            console.error('🔢 Status erreur:', error.response?.status);
            throw error.response?.data?.error || error.response?.data?.message || "Erreur lors de l'inscription";
        }
    },

    // Connexion
    async login(email: string, password: string): Promise<User> {
        try {
            console.log('📤 Tentative de connexion:', { email });
            console.log('🌐 URL:', `${API_BASE_URL}/auth/login`);
            
            const response = await api.post('/auth/login', { email, password });
            
            console.log('✅ Réponse du serveur:', response.data);
            console.log('📊 Status:', response.status);
            
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error: any) {
            console.error('❌ Erreur complète:', error);
            console.error('📋 Réponse erreur:', error.response?.data);
            console.error('🔢 Status erreur:', error.response?.status);
            throw error.response?.data?.error || error.response?.data?.message || 'Identifiants incorrects';
        }
    },

    // Déconnexion
    logout(): void {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },

    // Obtenir l'utilisateur connecté
    getCurrentUser(): User | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Vérifier si l'utilisateur est connecté
    isAuthenticated(): boolean {
        return !!this.getCurrentUser();
    }
};

export default api;
