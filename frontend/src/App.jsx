import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Services from './pages/Services';
import Partners from './pages/Partners';
import Login from './pages/Login';
import RegisterClient from './pages/RegisterClient';
import RegisterCleaner from './pages/RegisterCleaner';
import NotFound from './pages/NotFound';

import ClientLayout from './pages/client/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientBookings from './pages/client/ClientBookings';
import ClientProfile from './pages/client/ClientProfile';
import NewBooking from './pages/client/NewBooking';

import CleanerLayout from './pages/cleaner/CleanerLayout';
import CleanerDashboard from './pages/cleaner/CleanerDashboard';
import CleanerMissions from './pages/cleaner/CleanerMissions';
import CleanerAvailability from './pages/cleaner/CleanerAvailability';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCleaners from './pages/admin/AdminCleaners';
import AdminServices from './pages/admin/AdminServices';
import AdminClients from './pages/admin/AdminClients';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPartners from './pages/admin/AdminPartners';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <Routes>
      {/* Site public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/partenaires" element={<Partners />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<RegisterClient />} />
        <Route path="/inscription/cleaner" element={<RegisterCleaner />} />
      </Route>

      {/* Espace client */}
      <Route element={<ProtectedRoute roles={['client']} />}>
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<ClientDashboard />} />
          <Route path="reservations" element={<ClientBookings />} />
          <Route path="nouvelle-reservation" element={<NewBooking />} />
          <Route path="profil" element={<ClientProfile />} />
        </Route>
      </Route>

      {/* Espace cleaner */}
      <Route element={<ProtectedRoute roles={['cleaner']} />}>
        <Route path="/cleaner" element={<CleanerLayout />}>
          <Route index element={<CleanerDashboard />} />
          <Route path="missions" element={<CleanerMissions />} />
          <Route path="disponibilite" element={<CleanerAvailability />} />
        </Route>
      </Route>

      {/* Espace admin */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="cleaners" element={<AdminCleaners />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="reservations" element={<AdminBookings />} />
          <Route path="partenaires" element={<AdminPartners />} />
          <Route path="parametres" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
