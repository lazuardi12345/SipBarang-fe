import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../presentation/contexts/AuthContext';
import { Input } from '../presentation/components/ui/Input';
import { Button } from '../presentation/components/ui/Button';
import { Alert } from '../presentation/components/ui/Alert';
import { Truck, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal login');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-white/95 p-8 shadow-2xl backdrop-blur-md sm:p-10">
        {/* Brand Logo & Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-36 items-center justify-center rounded-2xl bg-white p-2 shadow-md border border-slate-100">
            <img
              src="/assets/logo.jpg"
              alt="PT Almira Yuniar Trek"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            PT ALMAIRA YUNIAR TREK
          </h1>
          <p className="text-xs font-semibold text-blue-700 mt-0.5">
            Sistem Informasi Pengiriman & Delivery Order
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Pengguna</label>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-700 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/30 hover:bg-blue-800 disabled:opacity-50 transition"
          >
            {submitting ? 'Memverifikasi...' : 'Masuk ke Sistem'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Belum punya akun?{' '}
          <Link to="/register" className="font-bold text-blue-700 hover:underline">
            Daftar Akun Baru
          </Link>
        </p>

        {/* Demo Fast Login */}
        <div className="mt-6 rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
          <p className="mb-2 font-bold text-slate-700 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-blue-600" />
            Login Cepat (Akun Demo)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('direktur@ayt.co.id');
                setPassword('direktur123');
              }}
              className="flex-1 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-2 font-bold text-indigo-800 hover:bg-indigo-100 transition text-center shadow-xs"
            >
              👔 Direktur
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@ayt.co.id');
                setPassword('admin123');
              }}
              className="flex-1 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 font-bold text-blue-800 hover:bg-blue-100 transition text-center shadow-xs"
            >
              📋 Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
