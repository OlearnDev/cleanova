import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/client', label: 'Tableau de bord', icon: '🏠', end: true },
  { to: '/client/reservations', label: 'Mes reservations', icon: '📅' },
  { to: '/client/nouvelle-reservation', label: 'Nouvelle reservation', icon: '➕' },
  { to: '/client/profil', label: 'Mon profil', icon: '👤' },
];

export default function ClientLayout() {
  return <DashboardLayout title="Espace client" links={links} />;
}
