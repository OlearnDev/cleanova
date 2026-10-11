import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import BookingCard from '../../components/BookingCard';
import Modal from '../../components/Modal';

export default function ClientBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const toast = useToast();

  function reload() {
    setLoading(true);
    api.get('/bookings/me').then(({ data }) => setBookings(data.bookings)).finally(() => setLoading(false));
  }

  useEffect(reload, []);

  async function handleCancel(id) {
    if (!window.confirm('Annuler cette reservation ?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Reservation annulee.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handlePay(id) {
    try {
      await api.put(`/bookings/${id}/pay`);
      toast.success('Paiement effectue (simulation).');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function submitReview() {
    try {
      await api.post('/reviews', { bookingId: reviewTarget.id, rating, comment });
      toast.success('Merci pour votre avis !');
      setReviewTarget(null);
      setComment('');
      setRating(5);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const filtered = filter ? bookings.filter((b) => b.status === filter) : bookings;
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
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Aucune reservation dans cette categorie.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              actions={
                <>
                  {['en_attente', 'confirmee'].includes(b.status) && (
                    <button onClick={() => handleCancel(b.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                      Annuler
                    </button>
                  )}
                  {b.payment_status !== 'paye' && !['annulee', 'refusee'].includes(b.status) && (
                    <button onClick={() => handlePay(b.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-700 text-white hover:bg-brand-800">
                      Payer maintenant
                    </button>
                  )}
                  {b.status === 'terminee' && (
                    <button onClick={() => setReviewTarget(b)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50">
                      Laisser un avis
                    </button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        title="Laisser un avis"
        footer={
          <>
            <button onClick={() => setReviewTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-600">Annuler</button>
            <button onClick={submitReview} className="px-4 py-2 text-sm font-semibold bg-brand-700 text-white rounded-lg">Envoyer</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Note</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Commentaire (optionnel)</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
