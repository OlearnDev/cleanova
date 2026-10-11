import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const dashboardPathByRole = { admin: '/admin', client: '/client', cleaner: '/cleaner' };

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Bienvenue, ${data.user.first_name} !`);
      const redirectTo = location.state?.from || dashboardPathByRole[data.user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Email ou mot de passe incorrect.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Connexion</h1>
        <p className="text-gray-500 text-sm mb-6">Accedez a votre espace client, cleaner ou administrateur.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="text-brand-700 font-semibold hover:underline">Inscription client</Link>
          {' '}ou{' '}
          <Link to="/inscription/cleaner" className="text-brand-700 font-semibold hover:underline">devenir cleaner</Link>
        </p>
      </div>
    </div>
  );
}
