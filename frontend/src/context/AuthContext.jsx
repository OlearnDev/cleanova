import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cleanova_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cleanova_token');
    if (!token) {
      setLoading(false);
      return;
    }
    // Revalide la session aupres de l'API au chargement
    api.get('/auth/me')
      .then(({ data }) => {
        setUser((prev) => ({ ...prev, ...data.user }));
        localStorage.setItem('cleanova_user', JSON.stringify({ ...user, ...data.user }));
      })
      .catch(() => {
        localStorage.removeItem('cleanova_token');
        localStorage.removeItem('cleanova_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function login(userData, token) {
    localStorage.setItem('cleanova_token', token);
    localStorage.setItem('cleanova_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('cleanova_token');
    localStorage.removeItem('cleanova_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit etre utilise dans un AuthProvider');
  return ctx;
}
