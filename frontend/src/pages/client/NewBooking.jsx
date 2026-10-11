import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { apiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ServiceCard from '../../components/ServiceCard';
import CleanerCard from '../../components/CleanerCard';
import { formatCurrency } from '../../utils/media';

const STEPS = ['Service', 'Details', 'Cleaner', 'Recapitulatif'];

export default function NewBooking() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedService, setSelectedService] = useState(null);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [details, setDetails] = useState({ date: '', time: '', address: '', notes: '' });

  useEffect(() => {
    Promise.all([api.get('/services'), api.get('/cleaners')])
      .then(([servicesRes, cleanersRes]) => {
        setServices(servicesRes.data.services);
        setCleaners(cleanersRes.data.cleaners);
        const preselectId = searchParams.get('service');
        if (preselectId) {
          const preselected = servicesRes.data.services.find((s) => String(s.id) === preselectId);
          if (preselected) {
            setSelectedService(preselected);
            setStep(1);
          }
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  function canProceedFromDetails() {
    return details.date && details.time && details.address;
  }

  async function confirmBooking() {
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        serviceId: selectedService.id,
        scheduledDate: details.date,
        scheduledTime: details.time,
        address: details.address,
        notes: details.notes,
        cleanerId: selectedCleaner?.id || null,
      });
      toast.success('Reservation creee avec succes !');
      navigate(`/client/reservations`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Impossible de creer la reservation.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="max-w-4xl">
      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              i <= step ? 'bg-brand-700 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i + 1}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:inline ${i <= step ? 'text-brand-700' : 'text-gray-400'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-brand-700' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Choisissez un service</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedService(s); next(); }}
                className={`text-left rounded-2xl border-2 transition-all ${selectedService?.id === s.id ? 'border-brand-700' : 'border-transparent'}`}
              >
                <ServiceCard service={s} compact />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 max-w-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Details de l'intervention</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Date souhaitee *</label>
              <input type="date" required min={new Date().toISOString().slice(0, 10)} value={details.date}
                onChange={(e) => setDetails({ ...details, date: e.target.value })}
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Heure souhaitee *</label>
              <input type="time" required value={details.time}
                onChange={(e) => setDetails({ ...details, time: e.target.value })}
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Adresse d'intervention *</label>
              <input type="text" required value={details.address}
                onChange={(e) => setDetails({ ...details, address: e.target.value })}
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Notes specifiques</label>
              <textarea rows={3} value={details.notes}
                onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5" />
            </div>
          </div>
          <StepNav back={back} next={next} nextDisabled={!canProceedFromDetails()} />
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Choisissez un cleaner (optionnel)</h2>
          <p className="text-sm text-gray-500 mb-4">Sans choix, un cleaner disponible sera assigne automatiquement.</p>
          <div className="space-y-3 max-w-lg">
            <button
              onClick={() => setSelectedCleaner(null)}
              className={`w-full text-left p-4 rounded-2xl border ${!selectedCleaner ? 'border-brand-700 ring-2 ring-brand-200' : 'border-gray-100'} bg-white`}
            >
              <p className="font-semibold text-gray-900">Attribution automatique</p>
              <p className="text-xs text-gray-500">Nous choisissons pour vous le meilleur cleaner disponible.</p>
            </button>
            {cleaners.map((c) => (
              <CleanerCard key={c.id} cleaner={c} selected={selectedCleaner?.id === c.id} onSelect={setSelectedCleaner} />
            ))}
          </div>
          <StepNav back={back} next={next} maxWidth="max-w-lg" />
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 max-w-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recapitulatif</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Service" value={selectedService?.name} />
            <Row label="Date" value={`${details.date} a ${details.time}`} />
            <Row label="Adresse" value={details.address} />
            {details.notes && <Row label="Notes" value={details.notes} />}
            <Row label="Cleaner" value={selectedCleaner ? `${selectedCleaner.first_name} ${selectedCleaner.last_name}` : 'Attribution automatique'} />
            <Row label="Total" value={formatCurrency(selectedService?.price)} bold />
          </dl>
          <p className="text-xs text-gray-400 mt-4">
            Le paiement se fait apres confirmation de la reservation, depuis votre espace "Mes reservations".
          </p>
          <StepNav back={back} nextLabel={submitting ? 'Confirmation...' : 'Confirmer la reservation'} onNext={confirmBooking} nextDisabled={submitting} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between border-b border-gray-50 pb-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className={bold ? 'font-bold text-brand-700' : 'text-gray-900 font-medium text-right max-w-[60%]'}>{value}</dd>
    </div>
  );
}

function StepNav({ back, next, onNext, nextLabel = 'Continuer', nextDisabled }) {
  return (
    <div className="flex justify-between mt-6">
      <button onClick={back} className="text-sm font-semibold text-gray-500 px-4 py-2">← Retour</button>
      <button
        onClick={onNext || next}
        disabled={nextDisabled}
        className="bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-lg"
      >
        {nextLabel}
      </button>
    </div>
  );
}
