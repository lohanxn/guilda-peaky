import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MembrosPage from './pages/MembrosPage';
import BancoPage from './pages/BancoPage';
import HistoricoPage from './pages/HistoricoPage';
import EstatisticasPage from './pages/EstatisticasPage';

function PrivateRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <span className="loading-text">Carregando...</span>
    </div>
  );
  return admin ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return null;
  return admin ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <PublicRoute><LoginPage /></PublicRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/membros" element={
              <PrivateRoute>
                <Layout>
                  <MembrosPage />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/banco" element={
              <PrivateRoute>
                <Layout>
                  <BancoPage />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/historico" element={
              <PrivateRoute>
                <Layout>
                  <HistoricoPage />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/estatisticas" element={
              <PrivateRoute>
                <Layout>
                  <EstatisticasPage />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
