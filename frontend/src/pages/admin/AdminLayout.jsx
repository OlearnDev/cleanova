import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/admin', label: 'Tableau de bord', icon: '📊', end: true },
  { to: '/admin/cleaners', label: 'Cleaners', icon: '🧹' },
  { to: '/admin/services', label: 'Services', icon: '🛠️' },
  { to: '/admin/clients', label: 'Clients', icon: '👥' },
  { to: '/admin/reservations', label: 'Reservations', icon: '📅' },
  { to: '/admin/partenaires', label: 'Partenaires', icon: '🤝' },
  { to: '/admin/parametres', label: 'Parametres', icon: '⚙️' },
];

export default function AdminLayout() {
  return <DashboardLayout title="Administration" links={links} />;
}
