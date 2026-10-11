import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CleanerAvailability() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/cleaners/me/stats').then(({ data }) => setProfile(data.profile)).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/cleaners/me/availability', {
        availability: profile.availability,
        hourlyRate: profile.hourly_rate,
        skills: profile.skills,
      });
      setProfile(data.profile);
      toast.success('Disponibilite mise a jour.');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner full />;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Disponibilite et tarif</h2>

      <div>
        <label className="text-sm font-medium text-gray-700">Type de disponibilite</label>
        <select
          value={profile.availability}
          onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
          className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5"
        >
          <option value="partiel">Temps partiel</option>
          <option value="temps_plein">Temps plein</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Tarif horaire ($)</label>
        <input
          type="number" value={profile.hourly_rate}
          onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
          className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Competences</label>
        <textarea
          rows={3} value={profile.skills || ''}
          onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
          className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5"
        />
      </div>

      <button type="submit" disabled={saving} className="bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold py-2.5 px-6 rounded-lg">
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}
