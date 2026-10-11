import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { formatCurrency, formatDate } from '../../utils/media';

const STATUS_OPTIONS = ['en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee', 'refusee'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState(null);
  const [chosenCleaner, setChosenCleaner] = useState('');
  const toast = useToast();

  function reload() {
    setLoading(true);
    const params = status ? { status } : {};
    api.get('/admin/bookings', { params }).then(({ data }) => setBookings(data.bookings)).finally(() => setLoading(false));
  }

  useEffect(reload, [status]);
  useEffect(() => {
    api.get('/cleaners').then(({ data }) => setCleaners(data.cleaners));
  }, []);

  async function updateStatus(id, newStatus) {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status: newStatus });
      toast.success('Statut mis a jour.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function confirmAssign() {
    try {
      await api.put(`/admin/bookings/${assignTarget.id}/assign`, { cleanerId: chosenCleaner });
      toast.success('Cleaner assigne.');
      setAssignTarget(null);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  // Les routes admin exigent un token JWT en entete Authorization: on ne peut
  // pas utiliser un simple lien/window.open (pas d'entete possible), donc on
  // telecharge via axios (avec l'intercepteur qui ajoute le token) puis on
  // declenche l'enregistrement du blob recu.
  async function downloadBlob(url, filename) {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Telechargement impossible.'));
    }
  }

  function exportCsv() {
    downloadBlob('/admin/bookings/export/csv', 'reservations.csv');
  }

  function downloadInvoice(id) {
    downloadBlob(`/admin/bookings/${id}/invoice`, `facture-${id}.pdf`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStatus('')} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${!status ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>Toutes</button>
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status === s ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{s}</button>
          ))}
        </div>
        <button onClick={exportCsv} className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Exporter en CSV</button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Cleaner</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 last:border-0 align-top">
                  <td className="px-4 py-3">{formatDate(b.scheduled_date)}<br /><span className="text-xs text-gray-400">{b.scheduled_time?.slice(0, 5)}</span></td>
                  <td className="px-4 py-3">{b.service_name}</td>
                  <td className="px-4 py-3">{b.client_first_name} {b.client_last_name}<br /><span className="text-xs text-gray-400">{b.client_phone}</span></td>
                  <td className="px-4 py-3">
                    {b.cleaner_first_name ? `${b.cleaner_first_name} ${b.cleaner_last_name}` : <span className="text-gray-400">Non assigne</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-700">{formatCurrency(b.total_price)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-end gap-1">
                      <button onClick={() => { setAssignTarget(b); setChosenCleaner(b.cleaner_id || ''); }} className="text-xs font-semibold text-brand-700 hover:underline">
                        Assigner
                      </button>
                      <button onClick={() => downloadInvoice(b.id)} className="text-xs font-semibold text-gray-500 hover:underline">
                        Facture PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Aucune reservation.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        title="Attribuer un cleaner"
        footer={
          <>
            <button onClick={() => setAssignTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-600">Annuler</button>
            <button onClick={confirmAssign} disabled={!chosenCleaner} className="px-4 py-2 text-sm font-semibold bg-brand-700 text-white rounded-lg disabled:opacity-50">Confirmer</button>
          </>
        }
      >
        <select value={chosenCleaner} onChange={(e) => setChosenCleaner(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2">
          <option value="">Selectionner un cleaner</option>
          {cleaners.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({Number(c.hourly_rate).toFixed(0)} $/h)</option>)}
        </select>
      </Modal>
    </div>
  );
}
