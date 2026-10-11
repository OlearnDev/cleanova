import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ServiceCard from '../components/ServiceCard';
import HorizontalScroll from '../components/HorizontalScroll';
import LoadingSpinner from '../components/LoadingSpinner';
import { mediaUrl } from '../utils/media';
import { getPartnerLogo } from '../utils/partnerImages';
import heroBg from '../assets/images/hero-bg.jpg';
import whyUsEquipe from '../assets/images/why-us/equipe-fiable.svg';
import whyUsPonctualite from '../assets/images/why-us/ponctualite.svg';
import whyUsTarifs from '../assets/images/why-us/tarifs-transparents.svg';
import whyUsEco from '../assets/images/why-us/produits-eco.svg';

const WHY_US = [
  { image: whyUsEquipe, title: 'Equipe fiable et professionnelle', text: 'Cleaners verifies et notes par nos clients.' },
  { image: whyUsPonctualite, title: 'Ponctualite garantie', text: 'Intervention a l\'heure prevue, a chaque visite.' },
  { image: whyUsTarifs, title: 'Tarifs transparents', text: 'Prix affiches, sans surprise a la facturation.' },
  { image: whyUsEco, title: 'Produits ecoresponsables', text: 'Des produits sains pour votre famille et l\'environnement.' },
];

export default function Home() {
  const [services, setServices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/services'), api.get('/partners')])
      .then(([servicesRes, partnersRes]) => {
        setServices(servicesRes.data.services);
        setPartners(partnersRes.data.partners);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative bg-brand-600 text-white overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/70 via-brand-500/45 to-brand-400/25" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-start gap-6">
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide drop-shadow">
            Solutions de nettoyage professionnelles
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight max-w-2xl drop-shadow-[0_2px_10px_rgba(20,83,45,0.65)]">
            Des espaces propres, sains et impeccables !
          </h1>
          <p className="text-white max-w-xl text-lg drop-shadow-[0_2px_8px_rgba(20,83,45,0.6)]">
            Residences, bureaux et commerces : reservez une equipe de nettoyage fiable en quelques clics,
            a partir de 90$ par visite.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/services" className="bg-white text-brand-700 font-bold px-6 py-3 rounded-lg shadow-soft hover:bg-brand-50 transition-colors">
              Voir nos services
            </Link>
            <Link to="/inscription" className="border border-white/60 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Creer un compte client
            </Link>
          </div>
        </div>
      </section>

      {/* Services carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nos services</h2>
            <p className="text-gray-500">Choisissez la formule adaptee a vos besoins.</p>
          </div>
          <Link to="/services" className="text-brand-700 font-semibold text-sm hover:underline hidden sm:block">
            Voir tout →
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <HorizontalScroll>
            {services.map((s) => <ServiceCard key={s.id} service={s} />)}
          </HorizontalScroll>
        )}
      </section>

      {/* Why us */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Pourquoi nous choisir</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY_US.map((item) => (
              <div key={item.title} className="text-center flex flex-col items-center gap-4">
                <img src={item.image} alt={item.title} className="w-36 h-36 sm:w-40 sm:h-40 object-contain" />
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      {partners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Nos partenaires</h2>
          <div className="overflow-hidden">
            <div className="flex gap-8 animate-scroll-x w-max">
              {[...partners, ...partners].map((p, i) => {
                const logo = p.logo_url ? mediaUrl(p.logo_url) : getPartnerLogo(p);
                return (
                  <div key={`${p.id}-${i}`} className="w-60 h-28 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-soft shrink-0 px-6">
                    {logo ? (
                      <img src={logo} alt={p.name} className="max-h-16 max-w-full object-contain" />
                    ) : (
                      <span className="text-base font-semibold text-gray-500 text-center">{p.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA cleaner */}
      <section className="bg-brand-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Vous etes un professionnel du nettoyage ?</h2>
          <p className="text-gray-600 max-w-xl">Rejoignez notre reseau de cleaners partenaires et recevez des missions pres de chez vous.</p>
          <Link to="/inscription/cleaner" className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
            Devenir cleaner partenaire
          </Link>
        </div>
      </section>
    </div>
  );
}
