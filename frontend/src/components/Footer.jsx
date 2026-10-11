import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="text-white font-extrabold text-lg mb-2">Cleanova Solutions</p>
          <p className="text-sm text-brand-200">Solutions de nettoyage professionnelles pour residences, bureaux et commerces.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Liens rapides</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="hover:text-white">Nos services</Link></li>
            <li><Link to="/partenaires" className="hover:text-white">Nos partenaires</Link></li>
            <li><Link to="/inscription/cleaner" className="hover:text-white">Devenir partenaire cleaner</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Contact</p>
          <ul className="space-y-2 text-sm">
            <li>contact@cleanova.ca</li>
            <li>+1 438 935 1427</li>
            <li>www.cleanova.ca</li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Zones desservies</p>
          <p className="text-sm text-brand-200">Residences, bureaux et commerces - disponibilite selon zone d'intervention.</p>
        </div>
      </div>
      <div className="border-t border-brand-800 text-center text-xs text-brand-300 py-4">
        © {new Date().getFullYear()} Cleanova Solutions. Tous droits reserves.
      </div>
    </footer>
  );
}
