import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/media';

export default function CleanerDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/cleaners/me/stats'), api.get('/cleaners/me/bookings')])
      .then(([statsRes, bookingsRes]) => {
        setStats(statsRes.data);
        setBookings(bookingsRes.data.bookings);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner full />;

  const profile = stats.profile;
  const upcoming = bookings
    .filter((b) => ['en_attente', 'confirmee'].includes(b.status) && new Date(b.scheduled_date) >= new Date().setHours(0, 0, 0, 0))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <StatBox label="Missions realisees" value={profile.total_missions} />
        <StatBox label="Note moyenne" value={`★ ${Number(profile.average_rating).toFixed(1)}`} />
        <StatBox label="Gains totaux" value={formatCurrency(profile.total_earnings)} />
        <StatBox label="A venir" value={stats.upcomingMissions} />
      </div>

      {profile.status === 'en_attente' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl p-4">
          Votre profil est en attente de validation par l'administration. Vous ne pouvez pas encore recevoir de missions.
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Prochaines interventions</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">Aucune intervention a venir.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-soft">
                <div>
                  <p className="font-semibold text-gray-900">{b.service_name}</p>
                  <p className="text-sm text-gray-500">{formatDate(b.scheduled_date)} a {b.scheduled_time?.slice(0, 5)} - {b.client_first_name} {b.client_last_name}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <p className="text-xs sm:text-sm text-gray-500">{label}</p>
      <p className="text-xl sm:text-2xl font-extrabold text-brand-700 mt-1">{value}</p>
    </div>
  );
}
