import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const dashboardPathByRole = {
  admin: '/admin',
  client: '/client',
  cleaner: '/cleaner',
};

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/services', label: 'Services' },
    { to: '/partenaires', label: 'Partenaires' },
  ];

  function handleLogout() {
    logout();
    navigate('/');
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-brand-700 text-xl">
          <span className="w-9 h-9 rounded-lg bg-brand-700 text-white flex items-center justify-center text-sm">C</span>
          Cleanova
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-brand-700' : 'text-gray-600 hover:text-brand-700'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to={dashboardPathByRole[user?.role] || '/'}
                className="text-sm font-semibold text-brand-700 hover:underline"
              >
                Mon espace ({user?.first_name})
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="text-sm font-semibold text-gray-700 hover:text-brand-700">
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="text-sm font-semibold bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Inscription
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4 animate-fade-in">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-gray-700 font-medium">
              {l.label}
            </Link>
          ))}
          <hr />
          {isAuthenticated ? (
            <>
              <Link to={dashboardPathByRole[user?.role] || '/'} onClick={() => setOpen(false)} className="text-brand-700 font-semibold">
                Mon espace
              </Link>
              <button onClick={handleLogout} className="text-left text-gray-700 font-medium">Deconnexion</button>
            </>
          ) : (
            <>
              <Link to="/connexion" onClick={() => setOpen(false)} className="text-gray-700 font-medium">Connexion</Link>
              <Link to="/inscription" onClick={() => setOpen(false)} className="text-brand-700 font-semibold">Inscription</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
