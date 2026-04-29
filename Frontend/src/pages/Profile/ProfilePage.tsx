import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { clientApi } from '../../api/clientApi';
import { employeeApi } from '../../api/employeeApi';
import { investorApi } from '../../api/investorApi';

type ProfileFormState = {
  nom: string;
  prenom: string;
  email: string;
  numeroTel?: string;
  address?: string;
  photoUrl?: string;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileFormState>({
    nom: '',
    prenom: '',
    email: '',
    numeroTel: '',
    address: '',
    photoUrl: '',
  });

  const avatarUrl = useMemo(() => {
    const url = form.photoUrl?.trim();
    return url ? url : null;
  }, [form.photoUrl]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        if (user.role === 'client') {
          const res = await clientApi.getById(user.id);
          const c = res.data;
          setForm({
            nom: c.nom ?? '',
            prenom: c.prenom ?? '',
            email: c.email ?? '',
            numeroTel: c.numeroTel ?? '',
            address: c.address ?? '',
            photoUrl: c.photoUrl ?? '',
          });
          return;
        }

        if (user.role === 'vendeur' || user.role === 'analyste' || user.role === 'admin') {
          const res = await employeeApi.getById(user.id);
          const e = res.data;
          setForm({
            nom: e.nom ?? '',
            prenom: e.prenom ?? '',
            email: e.email ?? '',
            numeroTel: e.numeroTel ?? '',
            address: e.address ?? '',
            photoUrl: e.photoUrl ?? '',
          });
          return;
        }

        if (user.role === 'investisseur') {
          const res = await investorApi.getById(user.id);
          const i = res.data;
          setForm({
            nom: i.nom ?? '',
            prenom: i.prenom ?? '',
            email: i.email ?? '',
            numeroTel: i.numeroTel ?? '',
            address: i.address ?? '',
            photoUrl: i.photoUrl ?? '',
          });
          return;
        }

        setError("Rôle utilisateur non supporté.");
      } catch (e: any) {
        setError(e?.response?.data?.error || e?.message || 'Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id, user?.role]);

  const onChange = (field: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(null);
    if (error) setError(null);
  };

  const onSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (user.role === 'client') {
        await clientApi.update(user.id, {
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          numeroTel: form.numeroTel,
          address: form.address,
          photoUrl: form.photoUrl,
        });
      } else if (user.role === 'vendeur' || user.role === 'analyste' || user.role === 'admin') {
        const current = (await employeeApi.getById(user.id)).data;
        await employeeApi.update(user.id, {
          ...current,
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          numeroTel: form.numeroTel,
          address: form.address,
          photoUrl: form.photoUrl,
        });
      } else if (user.role === 'investisseur') {
        const current = (await investorApi.getById(user.id)).data;
        await investorApi.update(user.id, {
          ...current,
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          numeroTel: form.numeroTel,
          address: form.address,
          photoUrl: form.photoUrl,
        });
      }

      setSuccess('Profil mis à jour.');
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-300">
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">Profil</h2>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
        >
          Retour
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">{success}</div>
      )}

      <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-7 h-7 text-slate-300" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{form.prenom} {form.nom}</p>
            <p className="text-slate-400 text-sm truncate">{form.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nom</label>
            <input
              value={form.nom}
              onChange={(e) => onChange('nom', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Prénom</label>
            <input
              value={form.prenom}
              onChange={(e) => onChange('prenom', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Téléphone</label>
            <input
              value={form.numeroTel ?? ''}
              onChange={(e) => onChange('numeroTel', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">Adresse</label>
            <input
              value={form.address ?? ''}
              onChange={(e) => onChange('address', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">Photo URL</label>
            <input
              value={form.photoUrl ?? ''}
              onChange={(e) => onChange('photoUrl', e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
