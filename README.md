# SIPBarang — Aplikasi Pengiriman Barang / Delivery Order (DO)
PT Almira Yuniar Trek

Aplikasi manajemen pengiriman barang berbasis Next.js (App Router) + TypeScript +
Tailwind CSS, disusun dengan **Clean Architecture** supaya mudah dikembangkan
dan gampang dipindah dari mode demo (localStorage) ke backend/database sungguhan.

## 1. Fitur

1. **Login & Register** — dengan pemilihan role saat daftar.
2. **2 Role**: `DIREKTUR` dan `ADMIN`, dengan menu & akses halaman berbeda
   (lihat `RoleGuard`).
3. **Input Data Pengiriman** (khusus Admin) — nama supir, no. HP, no. polisi
   kendaraan, jenis kendaraan, tujuan kirim (otomatis ambil tarif & hitung
   PPh 2% dari data master tarif PT Almira Yuniar Trek), data penerima, dan
   data barang.
4. **ACC Direktur** — Direktur menyetujui/menolak (dengan alasan) pengiriman
   yang diajukan Admin.
5. **Pelaporan Barang Terkirim** — Admin menandai pengiriman yang sudah
   sampai, termasuk nama penerima dan foto bukti terima (opsional).
6. **Riwayat** — daftar seluruh pengiriman dengan filter status & pencarian.
7. **Invoice** — membuat invoice dari beberapa DO berstatus "Terkirim",
   lalu cetak/PDF dengan kop surat resmi perusahaan.

## 2. Field Data Pengiriman

Karena surat/format DO resmi belum tersedia saat aplikasi ini dibuat,
field pada `src/domain/entities/DeliveryOrder.ts` disusun berdasarkan pola
dokumen tarif pengiriman existing (`karawang.pdf`) + kebutuhan umum surat
jalan/DO ekspedisi. **Kalau nanti Anda kirim contoh surat DO aslinya**,
cukup sesuaikan interface `DeliveryOrder` di file tersebut — form
(`DeliveryOrderForm.tsx`), tabel, dan use-case lain tidak perlu diubah
strukturnya, hanya field yang dipakai.

Data master tarif (`src/infrastructure/repositories/seedTarif.ts`) sudah
diisi dari seluruh isi surat "Kiriman Dari Karawang — Mobil CDD 8 Ton",
lengkap dengan perhitungan otomatis PPh 2%.

## 3. Arsitektur (Clean Architecture)

```
src/
  domain/            <- Entity & interface repository (murni, tanpa dependency framework)
    entities/
    repositories/
  application/        <- Use-case / business logic
    use-cases/
      auth/
      delivery-order/
      invoice/
  infrastructure/      <- Implementasi teknis (localStorage, hashing, DI container)
    storage/
    repositories/
    auth/
    container.ts
  presentation/         <- Semua yang berhubungan dengan React/UI
    components/
    hooks/
    contexts/
  lib/                  <- util murni (format rupiah, tanggal, id, konstanta)
app/                     <- Routing Next.js App Router (hanya "menempel" komponen presentation)
```

Alur ketergantungan: `presentation -> application -> domain`, dan
`infrastructure` meng-implementasi interface yang didefinisikan `domain`.
Artinya domain & application TIDAK tahu-menahu soal React, localStorage,
atau Next.js — supaya gampang ditulis ulang/di-testing dan gampang pindah
backend.

## 4. Mode Data Saat Ini: localStorage (demo)

Supaya aplikasi bisa langsung dicoba tanpa setup database, semua data
(user, tarif, DO, invoice) disimpan di **localStorage browser** lewat
`LocalStorageClient` + repository di `src/infrastructure/repositories/`.

**Ini BUKAN untuk produksi** (password di-hash sangat sederhana di
browser, data tidak sinkron antar device). Untuk produksi:

1. Buat backend nyata (Next.js Route Handler / API terpisah) dengan
   database (Postgres/Supabase/MySQL, dll).
2. Buat class baru, mis. `ApiUserRepository implements IUserRepository`,
   `ApiDeliveryOrderRepository implements IDeliveryOrderRepository`, dst,
   yang memanggil API tersebut lewat `fetch`.
3. Ganti isi `src/infrastructure/container.ts` supaya mengembalikan
   instance class API tersebut, bukan `Local...Repository`.
4. Pindahkan hashing password (`simpleHash`) ke server memakai
   bcrypt/argon2 — jangan pernah hash password di client untuk aplikasi
   nyata.

Tidak ada satupun use-case, hook, atau komponen UI yang perlu diubah saat
migrasi ini, karena semuanya hanya bergantung pada interface di
`src/domain/repositories`.

## 5. Cara Menjalankan Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Akun demo (dibuat otomatis saat pertama
kali load):

- **Direktur**: `direktur@ayt.co.id` / `direktur123`
- **Admin**: `admin@ayt.co.id` / `admin123`

Atau daftar akun baru lewat halaman Register.

## 6. Cara Import ke v0.dev (Vercel)

1. Push folder ini ke repository GitHub baru.
2. Di v0.dev, pilih **Import from GitHub** / **Add existing project**, atau
   upload project ini sebagai starting point chat baru di v0, lalu minta
   v0 menyesuaikan tampilan sesuai kebutuhan (v0 memahami struktur Next.js
   App Router + Tailwind seperti ini).
3. Deploy ke Vercel: `vercel` (CLI) atau hubungkan repo GitHub-nya lewat
   dashboard Vercel — tidak perlu env var apapun karena masih mode
   localStorage.

## 7. Langkah Lanjutan yang Disarankan

- Ganti localStorage dengan backend nyata (lihat bagian 4) sebelum dipakai
  banyak user sekaligus.
- Sesuaikan field `DeliveryOrder` begitu contoh surat DO resmi tersedia.
- Tambahkan validasi lebih ketat dengan `zod` (sudah terpasang di
  `package.json`, tinggal dipakai di form/use-case).
- Tambahkan export invoice ke PDF asli (mis. lewat `react-pdf` atau
  endpoint server) jika "Cetak via browser" (`window.print()`) dirasa
  kurang cukup.
