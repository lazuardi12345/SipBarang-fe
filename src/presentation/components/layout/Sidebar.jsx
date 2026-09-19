"use client";

import clsx from "clsx";
import {
  LayoutDashboard,
  Truck,
  ClipboardCheck,
  PackageCheck,
  History,
  FileText,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./../../presentation/contexts/AuthContext";
import { UserRole } from "./../../domain/entities/User";
import { APP_NAME } from "./../../lib/constants";

const MENU = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.DIREKTUR] },
  { href: "/dashboard/pengiriman", label: "Input Pengiriman", icon: Truck, roles: [UserRole.ADMIN] },
  { href: "/dashboard/approval", label: "ACC Direktur", icon: ClipboardCheck, roles: [UserRole.DIREKTUR] },
  { href: "/dashboard/pelaporan", label: "Pelaporan Terkirim", icon: PackageCheck, roles: [UserRole.ADMIN] },
  { href: "/dashboard/riwayat", label: "Riwayat", icon: History, roles: [UserRole.ADMIN, UserRole.DIREKTUR] },
  { href: "/dashboard/invoice", label: "Invoice", icon: FileText, roles: [UserRole.ADMIN, UserRole.DIREKTUR] },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const visibleMenu = MENU.filter((item) => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white font-bold">A</div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{APP_NAME}</p>
          <p className="text-xs text-slate-500">Almira Yuniar Trek</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {visibleMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 px-2">
          <p className="text-sm font-medium text-slate-800">{user?.nama}</p>
          <p className="text-xs text-slate-500">{user?.role === UserRole.DIREKTUR ? "Direktur" : "Admin"}</p>
        </div>
        <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
