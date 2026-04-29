import { useState, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { handleLogin, isLoading, error, success, clearMessages } = useLogin();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Clears message after a delay
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(clearMessages, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success, clearMessages]);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error || success) clearMessages();
    };

    // Handle form submission
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLogin(formData);
    };

    const message = error || success;
    const messageType = error ? 'error' : 'success';

    return (

        <div className="w-full max-w-4xl bg-slate-950/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Hero Section */}
            <div className="relative hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-cyan-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>

                <div className="relative z-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-white/30">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Bon retour !</h2>
                        <p className="text-blue-100 text-sm leading-relaxed max-w-xs mx-auto">
                            Accédez à votre espace de gestion et suivez vos performances en temps réel.
                        </p>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Form Section */}
            <div className="p-8 md:p-12 flex flex-col justify-center relative">
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full transition-all"
                    title="Retour à l'accueil"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-1">Connexion</h3>
                    <p className="text-slate-400 text-sm">Entrez vos identifiants pour continuer</p>
                </div>

                {/* Message Box */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg text-sm flex items-center gap-3 ${messageType === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                        role="alert"
                    >
                        {messageType === 'error' && (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {message}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                                placeholder="nom@exemple.com"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Mot de passe</label>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white transition-all transform hover:-translate-y-0.5 ${isLoading
                            ? 'bg-slate-700 cursor-wait'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-500/25 active:scale-95'
                            }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Connexion en cours...</span>
                            </div>
                        ) : 'Se connecter'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        Vous n'avez pas de compte ?{' '}
                        <a href="/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                            Créer un compte
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;