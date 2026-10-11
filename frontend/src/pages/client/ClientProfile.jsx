import { useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ClientProfile() {
  const { user, login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const { data } = await api.put('/users/profile', payload);
      const token = localStorage.getItem('cleanova_token');
      login({ ...user, ...data.user }, token);
      toast.success('Profil mis a jour.');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Mon profil</h2>
      <p className="text-sm text-gray-500 mb-6">Email: {user?.email} (non modifiable)</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Prenom" value={form.firstName} onChange={(v) => update('firstName', v)} />
        <FormField label="Nom" value={form.lastName} onChange={(v) => update('lastName', v)} />
        <FormField label="Telephone" value={form.phone} onChange={(v) => update('phone', v)} />
        <FormField label="Adresse" value={form.address} onChange={(v) => update('address', v)} />
        <FormField label="Nouveau mot de passe" type="password" value={form.password} onChange={(v) => update('password', v)} className="sm:col-span-2" placeholder="Laisser vide pour ne pas changer" />

        <button
          type="submit" disabled={loading}
          className="sm:col-span-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg mt-2"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
}

function FormField({ label, type = 'text', value, onChange, className = '', placeholder }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}
