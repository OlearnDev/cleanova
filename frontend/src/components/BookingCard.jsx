import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate } from '../utils/media';

export default function BookingCard({ booking, actions }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-gray-900">{booking.service_name}</h4>
          <p className="text-sm text-gray-500">{formatDate(booking.scheduled_date)} a {booking.scheduled_time?.slice(0, 5)}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p><span className="text-gray-400">Adresse: </span>{booking.address}</p>
        {(booking.cleaner_first_name || booking.client_first_name) && (
          <p>
            <span className="text-gray-400">{booking.client_first_name ? 'Client: ' : 'Cleaner assigne: '}</span>
            {booking.client_first_name
              ? `${booking.client_first_name} ${booking.client_last_name}`
              : booking.cleaner_first_name
                ? `${booking.cleaner_first_name} ${booking.cleaner_last_name}`
                : 'Non assigne'}
          </p>
        )}
        {booking.notes && <p><span className="text-gray-400">Notes: </span>{booking.notes}</p>}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <span className="font-bold text-brand-700">{formatCurrency(booking.total_price)}</span>
        <StatusBadge status={booking.payment_status} />
      </div>

      {actions && <div className="flex flex-wrap gap-2 pt-2">{actions}</div>}
    </div>
  );
}
