import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DeliveryOrderPage from './pages/DeliveryOrderPage';
import ApprovalPage from './pages/ApprovalPage';
import PelaporanPage from './pages/PelaporanPage';
import DraftSuratJalanPage from './pages/DraftSuratJalanPage';
import RiwayatPage from './pages/RiwayatPage';
import InvoicePage from './pages/InvoicePage';
import TarifPage from './pages/TarifPage';
import Layout from './components/Layout';
import { RoleGuard } from './components/layout/RoleGuard';
import { UserRole } from './utils/constants';
import { APP_ROUTES } from './config/app';

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
      <Route path="/" element={<Navigate to={APP_ROUTES.home} replace />} />
      <Route path={APP_ROUTES.login} element={<LoginPage />} />
      <Route path={APP_ROUTES.register} element={<RegisterPage />} />

      <Route
        path={APP_ROUTES.dashboard}
        element={
          <PrivateRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path={APP_ROUTES.pengiriman}
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
        path={APP_ROUTES.masterTujuan}
        element={
          <PrivateRoute>
            <Layout>
              <RoleGuard allow={[UserRole.ADMIN]}>
                <TarifPage />
              </RoleGuard>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path={APP_ROUTES.draftSuratJalan}
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
        path={APP_ROUTES.approval}
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
        path={APP_ROUTES.pelaporan}
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
        path={APP_ROUTES.riwayat}
        element={
          <PrivateRoute>
            <Layout>
              <RiwayatPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path={APP_ROUTES.invoice}
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
