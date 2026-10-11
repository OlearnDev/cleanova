// Construit l'URL absolue d'un fichier uploade (image de service, photo cleaner, logo)
export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const base = apiUrl.replace(/\/api\/?$/, '');
  return `${base}${path}`;
}

export function formatCurrency(amount) {
  return `${Number(amount).toFixed(2)} $`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export const STATUS_LABELS = {
  en_attente: 'En attente',
  confirmee: 'Confirmee',
  en_cours: 'En cours',
  terminee: 'Terminee',
  annulee: 'Annulee',
  refusee: 'Refusee',
  approuve: 'Approuve',
  suspendu: 'Suspendu',
  refuse: 'Refuse',
  paye: 'Paye',
  echoue: 'Echoue',
};

export const STATUS_COLORS = {
  en_attente: 'bg-amber-100 text-amber-700',
  confirmee: 'bg-blue-100 text-blue-700',
  en_cours: 'bg-purple-100 text-purple-700',
  terminee: 'bg-green-100 text-green-700',
  annulee: 'bg-gray-200 text-gray-600',
  refusee: 'bg-red-100 text-red-700',
  approuve: 'bg-green-100 text-green-700',
  suspendu: 'bg-red-100 text-red-700',
  refuse: 'bg-red-100 text-red-700',
  paye: 'bg-green-100 text-green-700',
  echoue: 'bg-red-100 text-red-700',
};

export function StatusBadgeClasses(status) {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
}
