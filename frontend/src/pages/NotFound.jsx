import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl mb-4">🧹</p>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Page introuvable</h1>
      <p className="text-gray-500 mb-6">La page que vous cherchez n'existe pas ou a ete deplacee.</p>
      <Link to="/" className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-6 py-2.5 rounded-lg">
        Retour a l'accueil
      </Link>
    </div>
  );
}
