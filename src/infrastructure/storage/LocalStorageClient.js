/**
 * Infrastructure: LocalStorageClient
 *
 * PENTING: Ini adalah penyimpanan SEMENTARA berbasis localStorage,
 * dipakai supaya aplikasi bisa langsung jalan/di-demo di v0 & Vercel
 * tanpa perlu setup database dulu.
 *
 * Untuk produksi, ganti isi class di folder `repositories/` (bukan file ini)
 * agar memanggil REST API / Supabase / Postgres, dll. Karena semua layer
 * lain (use-case, komponen React) hanya bergantung pada interface di
 * `src/domain/repositories`, mengganti implementasi ini TIDAK akan
 * mengubah kode di layer manapun.
 */

export class LocalStorageClient {
  constructor(key) {
    this.key = key;
  }

  isBrowser() {
    return typeof window !== "undefined";
  }

  getAll() {
    if (!this.isBrowser()) return [];
    const raw = window.localStorage.getItem(this.key);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveAll(items) {
    if (!this.isBrowser()) return;
    window.localStorage.setItem(this.key, JSON.stringify(items));
  }

  seedIfEmpty(seed) {
    if (!this.isBrowser()) return;
    const existing = this.getAll();
    if (existing.length === 0 && seed.length > 0) {
      this.saveAll(seed);
    }
  }
}
