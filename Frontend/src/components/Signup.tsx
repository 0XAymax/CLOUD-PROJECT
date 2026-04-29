import { useState, useEffect } from 'react';
import { useSignup } from '../hooks/useSignup';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const { handleSignup, isLoading, error, success, clearMessages } = useSignup();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        photoUrl: '',
        userType: 'client' as 'client' | 'investisseur' | 'employe',
        role: '',

        // Champs spécifiques Investisseur
        ice: '',
        nomEntreprise: '',
        adresseEntreprise: '',
        numeroEntreprise: '',
        emailEntreprise: '',
        logoUrl: '',
        domaineEntreprise: '',
        capitalDisponible: '',

        password: '',
        confirmPassword: ''
    });

    // Clears message after a delay
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(clearMessages, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success, clearMessages]);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error || success) clearMessages();
    };

    // Handle form submission
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            alert("Les mots de passe ne correspondent pas.");
            return;
        }

        if (formData.password.length < 6) {
            alert("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        // Préparer les données
        const signupData: any = {
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            password: formData.password,
            telephone: formData.telephone || undefined,
            adresse: formData.adresse || undefined,
            userType: formData.userType,
            photoUrl: formData.photoUrl || undefined,
        };

        // Ajouter les données spécifiques investisseur si nécessaire
        if (formData.userType === 'investisseur') {
            signupData.ice = formData.ice || undefined;
            signupData.nomEntreprise = formData.nomEntreprise || undefined;
            signupData.adresseEntreprise = formData.adresseEntreprise || undefined;
            signupData.numeroEntreprise = formData.numeroEntreprise || undefined;
            signupData.emailEntreprise = formData.emailEntreprise || undefined;
            signupData.logoUrl = formData.logoUrl || undefined;
            signupData.domaineEntreprise = formData.domaineEntreprise || undefined;
            signupData.capitalDisponible = formData.capitalDisponible ? parseFloat(formData.capitalDisponible) : undefined;
        }

        await handleSignup(signupData);

        // Reset form si succès
        if (!error) {
            setFormData({
                nom: '',
                prenom: '',
                email: '',
                telephone: '',
                adresse: '',
                photoUrl: '',
                userType: 'client',
                role: '',
                ice: '',
                nomEntreprise: '',
                adresseEntreprise: '',
                numeroEntreprise: '',
                emailEntreprise: '',
                logoUrl: '',
                domaineEntreprise: '',
                capitalDisponible: '',
                password: '',
                confirmPassword: ''
            });
        }
    };

    const message = error || success;
    const messageType = error ? 'error' : 'success';

    return (

        <div className="w-full max-w-6xl bg-slate-950/85 backdrop-blur-2xl border border-slate-800/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:col-span-4 flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-700 to-indigo-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10 text-center space-y-8">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto shadow-2xl border border-white/20">
                        <svg className="w-10 h-10 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-3">Rejoignez-nous</h2>
                        <p className="text-blue-100/80 text-sm leading-relaxed max-w-[200px] mx-auto">
                            Créez votre compte aujourd'hui et commencez à gérer votre entreprise plus efficacement.
                        </p>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-blue-900/20 to-blue-900/80 pointer-events-none"></div>
            </div>

            {/* Right Side - Form Section */}
            <div className="lg:col-span-8 p-6 lg:p-10 relative flex flex-col justify-center bg-slate-950/40">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Créer un compte</h3>
                        <p className="text-slate-400 text-xs mt-1">Remplissez le formulaire ci-dessous pour commencer</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>

                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${messageType === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Compact Inputs Grid */}
                    <div className="grid grid-cols-12 gap-x-4 gap-y-3">
                        {/* Type de compte */}
                        <div className="col-span-12 sm:col-span-4">
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Type de Compte</label>
                            <select
                                name="userType"
                                value={formData.userType}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            >
                                <option value="client">Client</option>
                                <option value="investisseur">Investisseur</option>
                            </select>
                        </div>

                        {/* Empty Space filler for alignment in non-investor mode */}
                        <div className="hidden sm:block sm:col-span-8"></div>

                        {/* Nom & Prénom */}
                        <div className="col-span-6">
                            <input
                                type="text"
                                name="nom"
                                required
                                value={formData.nom}
                                onChange={handleChange}
                                placeholder="Nom"
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                            />
                        </div>
                        <div className="col-span-6">
                            <input
                                type="text"
                                name="prenom"
                                required
                                value={formData.prenom}
                                onChange={handleChange}
                                placeholder="Prénom"
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                            />
                        </div>

                        {/* Email (Full Width) */}
                        <div className="col-span-12">
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Adresse Email"
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                            />
                        </div>

                        {/* Telephone & Adresse */}
                        <div className="col-span-5">
                            <input
                                type="tel"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                placeholder="Téléphone"
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                            />
                        </div>
                        <div className="col-span-7">
                            <input
                                type="text"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleChange}
                                placeholder="Adresse"
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                            />
                        </div>

                        {/* Photo URL */}
                        <div className="col-span-12">
                            <input
                                type="text"
                                name="photoUrl"
                                value={formData.photoUrl}
                                onChange={handleChange}
                                placeholder="URL de la photo de profil (optionnel)"
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                            />
                        </div>

                        {/* Investor Specific Fields */}
                        {formData.userType === 'investisseur' && (
                            <div className="col-span-12 p-3 bg-slate-900/30 rounded-lg border border-slate-800/50 grid grid-cols-12 gap-3 mt-1">
                                <h4 className="col-span-12 text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Information Entreprise</h4>
                                <div className="col-span-6">
                                    <input type="text" name="nomEntreprise" value={formData.nomEntreprise} onChange={handleChange} placeholder="Nom Entreprise" className="w-full px-3 py-2 bg-slate-900 border border-slate-700/50 rounded-lg text-xs text-slate-200" />
                                </div>
                                <div className="col-span-6">
                                    <input type="text" name="ice" value={formData.ice} onChange={handleChange} placeholder="ICE" className="w-full px-3 py-2 bg-slate-900 border border-slate-700/50 rounded-lg text-xs text-slate-200" />
                                </div>
                                <div className="col-span-4">
                                    <input type="number" name="capitalDisponible" value={formData.capitalDisponible} onChange={handleChange} placeholder="Capital" className="w-full px-3 py-2 bg-slate-900 border border-slate-700/50 rounded-lg text-xs text-slate-200" />
                                </div>
                                <div className="col-span-8">
                                    <input type="text" name="domaineEntreprise" value={formData.domaineEntreprise} onChange={handleChange} placeholder="Domaine" className="w-full px-3 py-2 bg-slate-900 border border-slate-700/50 rounded-lg text-xs text-slate-200" />
                                </div>
                            </div>
                        )}

                        {/* Passwords */}
                        <div className="col-span-6">
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mot de passe"
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                            />
                        </div>
                        <div className="col-span-6">
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirmer"
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className={`w-full py-2.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.01] ${isLoading
                                ? 'bg-slate-700 cursor-wait'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                                }`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Création...' : "S'inscrire gratuitement"}
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-slate-500 text-xs">
                        Déjà inscrit ?{' '}
                        <a href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                            Se connecter
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
