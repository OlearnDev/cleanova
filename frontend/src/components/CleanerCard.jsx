import { mediaUrl } from '../utils/media';

export default function CleanerCard({ cleaner, onSelect, selected }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(cleaner)}
      className={`text-left w-full bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all ${
        selected ? 'border-brand-700 ring-2 ring-brand-200' : 'border-gray-100 hover:border-brand-200'
      }`}
    >
      <div className="w-14 h-14 rounded-full bg-brand-100 overflow-hidden flex items-center justify-center shrink-0">
        {cleaner.photo_url ? (
          <img src={mediaUrl(cleaner.photo_url)} alt={cleaner.first_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-brand-700 font-bold text-lg">
            {cleaner.first_name?.[0]}{cleaner.last_name?.[0]}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{cleaner.first_name} {cleaner.last_name}</p>
        <p className="text-xs text-gray-500 truncate">{cleaner.skills || 'Nettoyage general'}</p>
        <div className="flex items-center gap-2 mt-1 text-sm">
          <span className="text-amber-500">★ {Number(cleaner.average_rating || 0).toFixed(1)}</span>
          <span className="text-gray-400">({cleaner.total_reviews || 0} avis)</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-brand-700">{Number(cleaner.hourly_rate).toFixed(0)} $/h</p>
        <p className="text-xs text-gray-400">{cleaner.availability === 'temps_plein' ? 'Temps plein' : 'Temps partiel'}</p>
      </div>
    </button>
  );
}
