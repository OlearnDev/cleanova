import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ title, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col shrink-0">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-brand-700 text-lg px-6 py-5 border-b border-gray-100">
          <span className="w-8 h-8 rounded-lg bg-brand-700 text-white flex items-center justify-center text-xs">C</span>
          Cleanova
        </Link>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-700 text-white' : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                }`
              }
            >
              <span>{l.icon}</span>{l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-800 px-3">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-gray-400 px-3 mb-3 capitalize">{user?.role}</p>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
          >
            Deconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-brand-700">{title}</span>
          <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-red-600 font-medium">Deconnexion</button>
        </header>
        <div className="lg:hidden flex overflow-x-auto gap-2 px-4 py-2 bg-white border-b border-gray-100">
          {links.map((l) => (
            <NavLink
              key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${isActive ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
        <main className="p-4 sm:p-8 max-w-6xl mx-auto">
          <h1 className="hidden lg:block text-2xl font-extrabold text-gray-900 mb-6">{title}</h1>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
