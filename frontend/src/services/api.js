import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attache automatiquement le token JWT stocke a chaque requete
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cleanova_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Deconnexion automatique si le token est invalide/expire (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cleanova_token');
      localStorage.removeItem('cleanova_user');
      if (!window.location.pathname.startsWith('/connexion')) {
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err, fallback = 'Une erreur est survenue. Veuillez reessayer.') {
  return err?.response?.data?.message || fallback;
}

export default api;
