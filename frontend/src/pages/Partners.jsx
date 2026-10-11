import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { mediaUrl } from '../utils/media';
import { getPartnerLogo } from '../utils/partnerImages';

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/partners').then(({ data }) => setPartners(data.partners)).finally(() => setLoading(false));
  }, []);

  const categories = ['', ...new Set(partners.map((p) => p.category).filter(Boolean))];
  const filtered = category ? partners.filter((p) => p.category === category) : partners;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Nos partenaires</h1>
      <p className="text-gray-500 mb-8">Un reseau de partenaires de confiance pour un service toujours plus complet.</p>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c || 'all'}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                category === c ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {c || 'Tous'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => {
            const logo = p.logo_url ? mediaUrl(p.logo_url) : getPartnerLogo(p);
            return (
              <a
                key={p.id}
                href={p.website_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-soft hover:shadow-lg transition-shadow"
              >
                <div className="h-28 w-full flex items-center justify-center">
                  {logo ? (
                    <img src={logo} alt={p.name} className="max-h-28 max-w-full object-contain" />
                  ) : (
                    <span className="text-3xl font-bold text-brand-700">{p.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-center">{p.name}</p>
                {p.category && <span className="text-xs text-gray-400">{p.category}</span>}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
