import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protege une branche de routes selon les roles autorises.
 * Usage: <Route element={<ProtectedRoute roles={['admin']} />}> ... </Route>
 */
export default function ProtectedRoute({ roles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner full label="Verification de la session..." />;
  if (!isAuthenticated) {
    // On memorise la page visee pour y renvoyer l'utilisateur juste apres connexion
    // (ex: cliquer sur "Reserver" depuis la page publique des services sans etre connecte).
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/connexion" state={{ from }} replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
