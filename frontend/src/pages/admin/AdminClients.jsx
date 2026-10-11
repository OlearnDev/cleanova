import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/media';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(null);
  const [historyClient, setHistoryClient] = useState(null);
  const toast = useToast();

  function reload() {
    setLoading(true);
    api.get('/admin/clients').then(({ data }) => setClients(data.clients)).finally(() => setLoading(false));
  }
  useEffect(reload, []);

  async function toggleActive(client) {
    try {
      await api.put(`/admin/clients/${client.id}/active`, { isActive: !client.is_active });
      toast.success('Statut du client mis a jour.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function viewHistory(client) {
    setHistoryClient(client);
    const { data } = await api.get(`/admin/clients/${client.id}/history`);
    setHistory(data.bookings);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 lg:hidden">Gestion des clients</h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Reservations</th>
                <th className="px-4 py-3">Depense totale</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.first_name} {c.last_name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{c.email}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                  </td>
                  <td className="px-4 py-3">{c.total_bookings}</td>
                  <td className="px-4 py-3 font-semibold text-brand-700">{formatCurrency(c.total_spent)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {c.is_active ? 'Actif' : 'Desactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => viewHistory(c)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Historique</button>
                      <button onClick={() => toggleActive(c)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${c.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
                        {c.is_active ? 'Desactiver' : 'Reactiver'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(historyClient)} onClose={() => setHistoryClient(null)} title={`Historique - ${historyClient?.first_name} ${historyClient?.last_name}`}>
        {!history ? (
          <LoadingSpinner />
        ) : history.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune reservation pour ce client.</p>
        ) : (
          <div className="space-y-3">
            {history.map((b) => (
              <div key={b.id} className="border border-gray-100 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{b.service_name}</p>
                  <p className="text-xs text-gray-400">{formatDate(b.scheduled_date)}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
