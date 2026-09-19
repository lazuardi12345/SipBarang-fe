/**
 * Mengubah angka numerik rupiah menjadi kata-kata bahasa Indonesia resmi.
 * Contoh: 1500000 -> "Satu Juta Lima Ratus Ribu Rupiah"
 */
export function terbilang(nominal) {
  const angka = Math.floor(Math.abs(Number(nominal) || 0));
  if (angka === 0) return "Nol Rupiah";

  const satuan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  function hitung(n) {
    if (n < 12) return " " + satuan[n];
    if (n < 20) return hitung(n - 10) + " Belas";
    if (n < 100) return hitung(Math.floor(n / 10)) + " Puluh" + hitung(n % 10);
    if (n < 200) return " Seratus" + hitung(n - 100);
    if (n < 1000) return hitung(Math.floor(n / 100)) + " Ratus" + hitung(n % 100);
    if (n < 2000) return " Seribu" + hitung(n - 1000);
    if (n < 1000000) return hitung(Math.floor(n / 1000)) + " Ribu" + hitung(n % 1000);
    if (n < 1000000000) return hitung(Math.floor(n / 1000000)) + " Juta" + hitung(n % 1000000);
    if (n < 1000000000000) return hitung(Math.floor(n / 1000000000)) + " Miliar" + hitung(n % 1000000000);
    return "";
  }

  const hasil = hitung(angka).trim();
  return `${hasil} Rupiah`;
}
