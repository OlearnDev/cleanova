import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import BookingCard from '../../components/BookingCard';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/me').then(({ data }) => setBookings(data.bookings)).finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter((b) => ['en_attente', 'confirmee'].includes(b.status));
  const totalSpent = bookings.filter((b) => b.payment_status === 'paye').reduce((sum, b) => sum + Number(b.total_price), 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatBox label="Reservations totales" value={bookings.length} />
        <StatBox label="A venir" value={upcoming.length} />
        <StatBox label="Total depense" value={`${totalSpent.toFixed(2)} $`} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Bonjour {user?.first_name} 👋</h2>
        <Link to="/client/nouvelle-reservation" className="bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + Nouvelle reservation
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500">
          Vous n'avez pas encore de reservation.
          <div className="mt-4">
            <Link to="/client/nouvelle-reservation" className="text-brand-700 font-semibold hover:underline">Reserver un service →</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {bookings.slice(0, 4).map((b) => <BookingCard key={b.id} booking={b} />)}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-extrabold text-brand-700 mt-1">{value}</p>
    </div>
  );
}
