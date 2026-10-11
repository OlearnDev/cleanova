import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { mediaUrl } from '../../utils/media';

export default function AdminCleaners() {
  const [cleaners, setCleaners] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  function reload() {
    setLoading(true);
    const params = status ? { status } : {};
    api.get('/admin/cleaners', { params }).then(({ data }) => setCleaners(data.cleaners)).finally(() => setLoading(false));
  }

  useEffect(reload, [status]);

  async function setCleanerStatus(id, newStatus) {
    try {
      await api.put(`/admin/cleaners/${id}/status`, { status: newStatus });
      toast.success('Statut mis a jour.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const statuses = ['', 'en_attente', 'approuve', 'suspendu', 'refuse'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-gray-900 lg:hidden">Gestion des cleaners</h1>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status === s ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              {s || 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3">Cleaner</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Tarif</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cleaners.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 overflow-hidden flex items-center justify-center shrink-0">
                        {c.photo_url ? (
                          <img src={mediaUrl(c.photo_url)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-brand-700 text-xs font-bold">{c.first_name[0]}{c.last_name[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{c.first_name} {c.last_name}</p>
                        <p className="text-xs text-gray-400">{c.years_experience} ans d'exp.</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{c.email}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-700">{Number(c.hourly_rate).toFixed(0)} $/h</td>
                  <td className="px-4 py-3">★ {Number(c.average_rating).toFixed(1)} ({c.total_reviews})</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {c.status !== 'approuve' && (
                        <button onClick={() => setCleanerStatus(c.id, 'approuve')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
                          Valider
                        </button>
                      )}
                      {c.status !== 'suspendu' && (
                        <button onClick={() => setCleanerStatus(c.id, 'suspendu')} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                          Suspendre
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {cleaners.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Aucun cleaner dans cette categorie.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
