import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './presentation/contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DeliveryOrderPage from './pages/DeliveryOrderPage';
import ApprovalPage from './pages/ApprovalPage';
import PelaporanPage from './pages/PelaporanPage';
import DraftSuratJalanPage from './pages/DraftSuratJalanPage';
import RiwayatPage from './pages/RiwayatPage';
import InvoicePage from './pages/InvoicePage';
import Layout from './components/Layout';
import { RoleGuard } from './presentation/components/layout/RoleGuard';
import { UserRole } from './domain/entities/User';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Memuat...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/pengiriman"
        element={
          <PrivateRoute>
            <Layout>
              <RoleGuard allow={[UserRole.ADMIN]}>
                <DeliveryOrderPage />
              </RoleGuard>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/draft-surat-jalan"
        element={
          <PrivateRoute>
            <Layout>
              <RoleGuard allow={[UserRole.ADMIN]}>
                <DraftSuratJalanPage />
              </RoleGuard>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/approval"
        element={
          <PrivateRoute>
            <Layout>
              <RoleGuard allow={[UserRole.DIREKTUR]}>
                <ApprovalPage />
              </RoleGuard>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/pelaporan"
        element={
          <PrivateRoute>
            <Layout>
              <RoleGuard allow={[UserRole.ADMIN]}>
                <PelaporanPage />
              </RoleGuard>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/riwayat"
        element={
          <PrivateRoute>
            <Layout>
              <RiwayatPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/invoice"
        element={
          <PrivateRoute>
            <Layout>
              <InvoicePage />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
