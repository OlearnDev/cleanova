import { Link } from 'react-router-dom';
import { mediaUrl, formatCurrency } from '../utils/media';
import { getServiceIllustration } from '../utils/serviceImages';

export default function ServiceCard({ service, compact = false }) {
  return (
    <div className={`snap-start shrink-0 ${compact ? 'w-64' : 'w-72'} bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300`}>
      <div className="h-36 bg-brand-50 flex items-center justify-center overflow-hidden">
        <img
          src={service.image_url ? mediaUrl(service.image_url) : getServiceIllustration(service)}
          alt={service.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        {service.category_name && (
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">{service.category_name}</span>
        )}
        <h3 className="font-semibold text-gray-900 leading-snug">{service.name}</h3>
        {!compact && service.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-lg font-bold text-brand-700">{formatCurrency(service.price)}</span>
            <span className="text-xs text-gray-400"> / visite</span>
          </div>
          <span className="text-xs text-gray-400">{service.duration_minutes} min</span>
        </div>
        <Link
          to={`/client/nouvelle-reservation?service=${service.id}`}
          className="mt-2 w-full text-center bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          Reserver
        </Link>
      </div>
    </div>
  );
}
