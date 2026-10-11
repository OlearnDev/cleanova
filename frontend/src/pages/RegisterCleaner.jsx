import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { apiErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Field } from './RegisterClient';

const initialForm = {
  firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  yearsExperience: '', skills: '', hourlyRate: '', availability: 'partiel',
};

export default function RegisterCleaner() {
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'confirmPassword') fd.append(key, value);
      });
      if (photo) fd.append('photo', photo);

      await api.post('/auth/register/cleaner', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
      toast.success('Candidature envoyee avec succes !');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Inscription impossible.'));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-center">
        <div className="max-w-md bg-white rounded-2xl shadow-soft border border-gray-100 p-10">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Candidature recue !</h1>
          <p className="text-gray-500 mb-6">
            Merci pour votre interet. Votre profil est en attente de validation par notre equipe.
            Vous recevrez un email des que votre compte sera active.
          </p>
          <button onClick={() => navigate('/connexion')} className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-6 py-2.5 rounded-lg">
            Aller a la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Devenir cleaner partenaire</h1>
        <p className="text-gray-500 text-sm mb-6">Votre compte sera active apres validation par notre equipe.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prenom" required value={form.firstName} onChange={(v) => update('firstName', v)} />
          <Field label="Nom" required value={form.lastName} onChange={(v) => update('lastName', v)} />
          <Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} className="sm:col-span-2" />
          <Field label="Telephone" value={form.phone} onChange={(v) => update('phone', v)} />
          <Field label="Tarif horaire souhaite ($)" type="number" required value={form.hourlyRate} onChange={(v) => update('hourlyRate', v)} />
          <Field label="Annees d'experience" type="number" value={form.yearsExperience} onChange={(v) => update('yearsExperience', v)} />

          <div>
            <label className="text-sm font-medium text-gray-700">Disponibilite</label>
            <select
              value={form.availability}
              onChange={(e) => update('availability', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="partiel">Temps partiel</option>
              <option value="temps_plein">Temps plein</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Competences specifiques</label>
            <textarea
              rows={2} value={form.skills} onChange={(e) => update('skills', e.target.value)}
              placeholder="Ex: nettoyage de vitres, planchers, produits ecologiques..."
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Photo de profil</label>
            <input
              type="file" accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold"
            />
          </div>

          <Field label="Mot de passe" type="password" required minLength={8} value={form.password} onChange={(v) => update('password', v)} />
          <Field label="Confirmer le mot de passe" type="password" required minLength={8} value={form.confirmPassword} onChange={(v) => update('confirmPassword', v)} />

          <button
            type="submit" disabled={loading}
            className="sm:col-span-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Deja inscrit ? <Link to="/connexion" className="text-brand-700 font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
