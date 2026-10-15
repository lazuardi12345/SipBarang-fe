import { useState, useEffect, useRef } from 'react';
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
  WifiOff,
  Smartphone,
  Share,
  PlusSquare,
  Sparkles,
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
    roles: [UserRole.ADMIN],
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
    roles: [UserRole.ADMIN],
  },
  {
    href: '/dashboard/approval',
    label: 'ACC Direktur',
    badge: 'Wajib ACC',
    icon: ClipboardCheck,
    roles: [UserRole.DIREKTUR],
  },
  {
    href: '/dashboard/pelaporan',
    label: 'Pelaporan Terkirim',
    icon: PackageCheck,
    roles: [UserRole.ADMIN],
  },
  {
    href: '/dashboard/invoice',
    label: 'Invoice Tagihan',
    icon: FileText,
    roles: [UserRole.ADMIN, UserRole.DIREKTUR],
  },
  {
    href: '/dashboard/pembukuan',
    label: 'Pembukuan',
    icon: Layers,
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIosModal, setShowIosModal] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);

  const currentRole = String(user?.role || '').toUpperCase();
  const isIos =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;

  // Listen for PWA BeforeInstallPrompt and Online/Offline
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle mobile drawer Escape key & scroll lock
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

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setProfileMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [profileMenuOpen]);

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } else if (isIos) {
      setShowIosModal(true);
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

  // Mobile Bottom Navigation items based on role
  const bottomNavItems =
    currentRole === UserRole.DIREKTUR
      ? [
          { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
          { href: '/dashboard/approval', label: 'ACC', icon: ClipboardCheck },
          { href: '/dashboard/pembukuan', label: 'Pembukuan', icon: Layers },
          { href: '/dashboard/invoice', label: 'Invoice', icon: FileText },
        ]
      : [
          { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
          { href: '/dashboard/pengiriman', label: 'Input DO', icon: Truck },
          { href: '/dashboard/pembukuan', label: 'Pembukuan', icon: Layers },
          { href: '/dashboard/invoice', label: 'Invoice', icon: FileText },
        ];

  return (
    <div className="flex min-h-screen bg-slate-100/70 antialiased lg:h-screen lg:overflow-hidden">
      {/* Mobile Backdrop for Sidebar Drawer */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden"
        />
      )}

      {/* ── SIDEBAR NAVIGATION (Desktop Sticky / Mobile Drawer) ── */}
      <aside
        id="app-sidebar"
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen h-[100dvh] w-[min(18.5rem,calc(100vw-2rem))] shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:translate-x-0 lg:shadow-none ${
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

        {/* Role Badge Indicator */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 border-b border-slate-800/60">
          <span className="min-w-0">
            {user?.role === UserRole.DIREKTUR ? 'Menu Direktur Utama' : 'Menu Operasional'}
          </span>
          <span
            className={`shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider ${
              user?.role === UserRole.DIREKTUR
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}
          >
            {user?.role === UserRole.DIREKTUR ? 'DIREKTUR' : 'ADMIN'}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 py-3">
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

        {/* PWA Install Button on Sidebar */}
        {!isInstalled && (installPrompt || isIos) && (
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={handleInstallApp}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:from-emerald-500 hover:to-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <Smartphone size={16} />
              <span>Install Aplikasi (PWA)</span>
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
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <LogOut size={14} />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:h-screen lg:min-h-0">
        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="no-print flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-inner">
            <WifiOff size={15} />
            <span>Mode Offline: Terputus dari internet. Menampilkan data lokal tersimpan.</span>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="no-print sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 py-2 shadow-sm backdrop-blur sm:px-6 lg:static lg:px-8">
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Install Button for Desktop / Tablet */}
            {!isInstalled && (installPrompt || isIos) && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Install Aplikasi PWA</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}

            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-label="Buka menu profil"
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    user?.role === UserRole.DIREKTUR
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {user?.role === UserRole.DIREKTUR ? '👑' : <User size={16} />}
                </span>
                <span className="max-w-28 truncate text-xs font-semibold text-slate-700 sm:max-w-48">
                  {user?.nama?.split(' ')[0]}
                </span>
              </button>
              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                >
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-bold text-slate-900">{user?.nama}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {user?.role === UserRole.DIREKTUR ? 'Direktur Utama' : 'Admin Operasional'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <LogOut size={16} />
                    Keluar Sistem
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile PWA Install Notification Card */}
        {!isInstalled && (installPrompt || isIos) && !dismissBanner && (
          <div className="no-print mx-4 mt-3 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-3.5 text-white shadow-lg border border-blue-500/30 sm:mx-6 lg:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/40">
                  <Smartphone size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Pasang SIPBarang di Layar HP</span>
                    <Sparkles size={12} className="text-amber-400" />
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Akses cepat 1-ketuk langsung seperti aplikasi native tanpa buka browser.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissBanner(true)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Tutup pemberitahuan"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-2.5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleInstallApp}
                className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 shadow transition"
              >
                Pasang Sekarang
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Page Content (Extra bottom padding on mobile for bottom navigation bar) */}
        <main className="min-w-0 flex-none overflow-x-hidden overflow-y-visible px-3 py-4 pb-24 sm:px-6 sm:py-6 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:px-8 lg:py-8 lg:pb-8">
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR (HP & Small Tablets) ── */}
      <nav
        aria-label="Navigasi bawah mobile"
        className="no-print fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-slate-200/90 bg-white/95 px-2 py-1.5 backdrop-blur-md shadow-lg lg:hidden pb-[calc(0.4rem+env(safe-area-inset-bottom))]"
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/dashboard'}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? user?.role === UserRole.DIREKTUR
                    ? 'text-amber-600 font-bold'
                    : 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                  isActive
                    ? user?.role === UserRole.DIREKTUR
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                    : ''
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
            </NavLink>
          );
        })}

        {/* Menu More Drawer Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition font-medium"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100">
            <Menu size={18} />
          </div>
          <span className="text-[10px] mt-0.5 leading-none">Menu</span>
        </button>
      </nav>

      {/* ── MODAL KONFIRMASI KELUAR ── */}
      {logoutModalOpen && (
        <Modal title="Konfirmasi Keluar" onClose={() => setLogoutModalOpen(false)}>
          <p className="mb-6 text-sm text-slate-600">
            Yakin ingin keluar dari sistem SIPBarang PT Almira Yuniar Trek?
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

      {/* ── MODAL PANDUAN INSTALL PWA IOS (IPHONE / IPAD) ── */}
      {showIosModal && (
        <Modal title="Pasang Aplikasi di iPhone / iPad" onClose={() => setShowIosModal(false)}>
          <div className="space-y-4 text-xs text-slate-700">
            <p className="text-slate-600 leading-relaxed">
              Untuk memasang SIPBarang di layar utama iPhone/iPad Anda:
            </p>
            <ol className="space-y-3 font-medium">
              <li className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                  1
                </span>
                <span className="flex-1">
                  Ketuk tombol <strong>Bagikan (Share)</strong> <Share size={14} className="inline text-blue-600" /> di bilah bawah browser Safari.
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                  2
                </span>
                <span className="flex-1">
                  Gulir ke bawah dan pilih menu <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong> <PlusSquare size={14} className="inline text-blue-600" />.
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                  3
                </span>
                <span className="flex-1">
                  Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon SIPBarang akan otomatis muncul di layar utama HP Anda!
                </span>
              </li>
            </ol>
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={() => setShowIosModal(false)}>
                Mengerti
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
