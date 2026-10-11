import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/cleaner', label: 'Tableau de bord', icon: '🏠', end: true },
  { to: '/cleaner/missions', label: 'Mes missions', icon: '🧹' },
  { to: '/cleaner/disponibilite', label: 'Disponibilite', icon: '🗓️' },
];

export default function CleanerLayout() {
  return <DashboardLayout title="Espace cleaner" links={links} />;
}
