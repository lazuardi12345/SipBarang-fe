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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, APP_NAME, COMPANY_NAME } from '../utils/constants';

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
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

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

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  const visibleMenu = MENU.filter((item) => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100/70 antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1 shadow-md">
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
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>{user?.role === UserRole.DIREKTUR ? 'Menu Direktur Utama' : 'Menu Operasional Ekspedisi'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
            user?.role === UserRole.DIREKTUR ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
          }`}>
            {user?.role === UserRole.DIREKTUR ? 'DIREKTUR' : 'ADMIN'}
          </span>
        </div>
        <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto">
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? user?.role === UserRole.DIREKTUR
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
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
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
          <div className="px-3 pb-2">
            <button
              onClick={handleInstallApp}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-700/20 hover:from-emerald-500 hover:to-teal-500 transition"
            >
              <Download size={15} />
              Install Aplikasi (PWA)
            </button>
          </div>
        )}

        {/* User Info & Logout */}
        <div className="border-t border-slate-800/80 bg-slate-950/40 p-4">
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
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
          >
            <LogOut size={14} />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <img src="/assets/logo.jpg" alt="Logo" className="h-8 w-auto object-contain" />
              <span className="text-sm font-extrabold text-slate-900">SIPBarang</span>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-600">
            {user?.nama?.split(' ')[0]}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
