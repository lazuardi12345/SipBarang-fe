import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  ClipboardCheck,
  PackageCheck,
  History,
  FileText,
  LogOut,
  Download,
  Menu,
  X,
  ShieldCheck,
  User,
  AlertTriangle,
  Layers,
  MapPinned,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, APP_NAME, COMPANY_NAME } from '../utils/constants';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

const MENU = [
  {
    href: '/dashboard',
    label: 'Beranda',
    icon: LayoutDashboard,
    roles: [UserRole.ADMIN, UserRole.DIREKTUR],
  },
  {
    href: '/dashboard/pengiriman',
    label: 'Input Pengiriman',
    icon: Truck,
    roles: [UserRole.ADMIN], // Khusus Admin
  },
  {
    href: '/dashboard/master-tujuan',
    label: 'Master Tujuan',
    icon: MapPinned,
    roles: [UserRole.ADMIN],
  },
  {
    href: '/dashboard/draft-surat-jalan',
    label: 'Tunggu Surat Jalan',
    badge: 'Draft',
    icon: AlertTriangle,
    roles: [UserRole.ADMIN], // Khusus Admin
  },
  {
    href: '/dashboard/approval',
    label: 'ACC Direktur',
    badge: 'Wajib ACC',
    icon: ClipboardCheck,
    roles: [UserRole.DIREKTUR], // Khusus Direktur (Admin tidak bisa ACC)
  },
  {
    href: '/dashboard/pelaporan',
    label: 'Pelaporan Terkirim',
    icon: PackageCheck,
    roles: [UserRole.ADMIN], // Khusus Admin
  },
  {
    href: '/dashboard/invoice',
    label: 'Invoice Tagihan',
    icon: FileText,
    roles: [UserRole.ADMIN, UserRole.DIREKTUR],
  },
  {
    href: '/dashboard/riwayat',
    label: 'Riwayat Pengiriman',
    icon: History,
    roles: [UserRole.ADMIN, UserRole.DIREKTUR],
  },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const currentRole = String(user?.role || '').toUpperCase();

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileOpen]);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  const visibleMenu = MENU.filter(
    (item) => user && item.roles.includes(currentRole)
  );
  const currentPage = visibleMenu.find((item) => item.href === location.pathname);

  const handleLogout = () => {
    setLogoutModalOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100/70 antialiased lg:h-screen lg:overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        id="app-sidebar"
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen h-[100dvh] w-[min(18rem,calc(100vw-2rem))] shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex min-h-20 items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-md">
              <img
                src="/assets/logo.jpg"
                alt="AYT Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-wide text-white leading-tight">
                PT ALMAIRA
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                YUNIAR TREK
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup navigasi"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-between gap-2 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          <span className="min-w-0">{user?.role === UserRole.DIREKTUR ? 'Menu Direktur Utama' : 'Menu Operasional'}</span>
          <span className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-bold tracking-wider ${
            user?.role === UserRole.DIREKTUR ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
          }`}>
            {user?.role === UserRole.DIREKTUR ? 'DIREKTUR' : 'ADMIN'}
          </span>
        </div>
        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 pb-4">
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/dashboard'}
                onClick={() => setMobileOpen(false)}
                className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80 ${
                  isActive
                    ? user?.role === UserRole.DIREKTUR
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-950/30'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-950/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  size={18}
                  className={`transition ${
                    isActive
                      ? 'text-white'
                      : user?.role === UserRole.DIREKTUR
                      ? 'text-slate-400 group-hover:text-amber-400'
                      : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="min-w-0 flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : item.badge === 'Wajib ACC'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white shadow" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* PWA Install Button */}
        {installPrompt && !isInstalled && (
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={handleInstallApp}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:from-emerald-500 hover:to-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <Download size={15} />
              Install Aplikasi (PWA)
            </button>
          </div>
        )}

        {/* User Info & Logout */}
        <div className="border-t border-slate-800/80 bg-slate-950/70 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="mb-3 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                user?.role === UserRole.DIREKTUR
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}
            >
              {user?.role === UserRole.DIREKTUR ? '👑' : <User size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-white">{user?.nama}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck
                  size={12}
                  className={user?.role === UserRole.DIREKTUR ? 'text-amber-400' : 'text-blue-400'}
                />
                <span
                  className={`text-[11px] font-semibold ${
                    user?.role === UserRole.DIREKTUR ? 'text-amber-300' : 'text-blue-300'
                  }`}
                >
                  {user?.role === UserRole.DIREKTUR ? 'Direktur Utama (ACC)' : 'Admin Operasional'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <LogOut size={14} />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:h-screen lg:min-h-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 py-2 shadow-sm backdrop-blur sm:px-6 lg:static lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu navigasi"
              aria-controls="app-sidebar"
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
                {currentPage?.label || APP_NAME}
              </p>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {COMPANY_NAME}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
              user?.role === UserRole.DIREKTUR
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {user?.role === UserRole.DIREKTUR ? '👑' : <User size={16} />}
            </span>
            <span className="max-w-28 truncate text-xs font-semibold text-slate-700 sm:max-w-48">
              {user?.nama?.split(' ')[0]}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>

      {logoutModalOpen && (
        <Modal title="Konfirmasi Keluar" onClose={() => setLogoutModalOpen(false)}>
          <p className="mb-6 text-sm text-slate-600">
            Yakin ingin keluar dari sistem?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setLogoutModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Keluar Sistem
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
