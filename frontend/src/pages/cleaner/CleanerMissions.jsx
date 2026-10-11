import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import BookingCard from '../../components/BookingCard';

export default function CleanerMissions() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const toast = useToast();

  function reload() {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    api.get('/cleaners/me/bookings', { params }).then(({ data }) => setBookings(data.bookings)).finally(() => setLoading(false));
  }

  useEffect(reload, [filter]);

  async function respond(id, action) {
    try {
      await api.put(`/cleaners/me/bookings/${id}/respond`, { action });
      toast.success(action === 'accept' ? 'Mission acceptee.' : 'Mission refusee.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const statuses = ['', 'en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee', 'refusee'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filter === s ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            {s || 'Toutes'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Aucune mission dans cette categorie.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              actions={
                b.status === 'en_attente' ? (
                  <>
                    <button onClick={() => respond(b.id, 'accept')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
                      Accepter
                    </button>
                    <button onClick={() => respond(b.id, 'refuse')} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                      Refuser
                    </button>
                  </>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
