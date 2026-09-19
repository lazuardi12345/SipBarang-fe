import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui/Alert';
import { UserRole } from '../utils/constants';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(UserRole.ADMIN);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register({ nama, email, password, role });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-white/95 p-8 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-36 items-center justify-center rounded-2xl bg-white p-2 shadow-md border border-slate-100">
            <img
              src="/assets/logo.jpg"
              alt="PT Almira Yuniar Trek"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Registrasi Pengguna
          </h1>
          <p className="text-xs font-semibold text-blue-700 mt-0.5">
            PT ALMAIRA YUNIAR TREK
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@ayt.co.id"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hak Akses (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
            >
              <option value={UserRole.ADMIN}>Admin Operasional</option>
              <option value={UserRole.DIREKTUR}>Direktur Utama</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-700 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/30 hover:bg-blue-800 disabled:opacity-50 transition"
          >
            {submitting ? 'Mendaftar...' : 'Daftar Akun'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-blue-700 hover:underline">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
