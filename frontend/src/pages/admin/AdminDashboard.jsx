import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler,
} from 'chart.js';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/media';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner full />;

  const chartData = {
    labels: stats.monthlyChart.map((m) => m.month),
    datasets: [
      {
        label: 'Revenus ($)',
        data: stats.monthlyChart.map((m) => Number(m.revenue)),
        borderColor: '#15803d',
        backgroundColor: 'rgba(21, 128, 61, 0.1)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatBox label="Chiffre d'affaires" value={formatCurrency(stats.totalRevenue)} accent />
        <StatBox label="Clients" value={stats.totalClients} />
        <StatBox label="Cleaners actifs" value={stats.activeCleaners} />
        <StatBox label="Reservations ce mois" value={stats.bookingsThisMonth} />
      </div>

      {stats.pendingCleaners > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl p-4">
          {stats.pendingCleaners} candidature(s) cleaner en attente de validation.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Evolution des revenus (6 derniers mois)</h2>
        {stats.monthlyChart.length ? (
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        ) : (
          <p className="text-gray-500 text-sm">Pas encore assez de donnees pour afficher un graphique.</p>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <p className="text-xs sm:text-sm text-gray-500">{label}</p>
      <p className={`text-xl sm:text-2xl font-extrabold mt-1 ${accent ? 'text-brand-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
