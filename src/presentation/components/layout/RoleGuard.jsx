"use client";

import { Link } from "react-router-dom";
import { UserRole } from "../../../domain/entities/User";
import { useAuth } from "../../contexts/AuthContext";
import { ShieldAlert, ArrowLeft } from "lucide-react";

/**
 * Membungkus halaman/komponen supaya hanya bisa diakses oleh role tertentu.
 * Contoh: halaman ACC Direktur -> <RoleGuard allow={[UserRole.DIREKTUR]}>
 */
export function RoleGuard({ allow, children }) {
  const { user } = useAuth();

  if (!user) return null;

  if (allow && !allow.includes(user.role)) {
    const roleName =
      user.role === UserRole.ADMIN ? "Admin Operasional" : "Direktur Utama";
    const allowedNames = allow
      .map((r) => (r === UserRole.DIREKTUR ? "Direktur Utama" : "Admin Operasional"))
      .join(", ");

    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg my-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Akses Dibatasi</h2>
        <p className="mt-2 text-sm text-slate-600">
          Anda login sebagai <strong>{roleName}</strong>. Halaman ini memiliki proteksi khusus dan hanya dapat diakses oleh <strong>{allowedNames}</strong>.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Admin tidak memiliki wewenang untuk menyetujui (ACC) pengiriman. Seluruh persetujuan operasional wajib dilakukan oleh akun Direktur Utama.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft size={14} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
