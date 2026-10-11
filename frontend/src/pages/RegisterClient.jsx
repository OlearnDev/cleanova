import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const initialForm = { firstName: '', lastName: '', email: '', phone: '', address: '', password: '', confirmPassword: '' };

export default function RegisterClient() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/client', form);
      login(data.user, data.token);
      toast.success('Compte cree avec succes. Bienvenue !');
      navigate('/client', { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Inscription impossible.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Creer un compte client</h1>
        <p className="text-gray-500 text-sm mb-6">Reservez vos services de nettoyage en quelques clics.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prenom" required value={form.firstName} onChange={(v) => update('firstName', v)} />
          <Field label="Nom" required value={form.lastName} onChange={(v) => update('lastName', v)} />
          <Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} className="sm:col-span-2" />
          <Field label="Telephone" value={form.phone} onChange={(v) => update('phone', v)} />
          <Field label="Adresse" value={form.address} onChange={(v) => update('address', v)} />
          <Field label="Mot de passe" type="password" required minLength={8} value={form.password} onChange={(v) => update('password', v)} />
          <Field label="Confirmer le mot de passe" type="password" required minLength={8} value={form.confirmPassword} onChange={(v) => update('confirmPassword', v)} />

          <button
            type="submit" disabled={loading}
            className="sm:col-span-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Creation du compte...' : 'Creer mon compte'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Deja inscrit ? <Link to="/connexion" className="text-brand-700 font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export function Field({ label, type = 'text', required, value, onChange, className = '', minLength }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
      <input
        type={type} required={required} minLength={minLength} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}
