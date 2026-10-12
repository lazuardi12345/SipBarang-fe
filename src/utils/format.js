export function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatTanggal(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTanggalWaktu(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function hitungPPh2(total) {
  return Math.round((Number(total) || 0) * 0.02);
}

export function hitungTotalSetelahPPh(total) {
  const pph2 = hitungPPh2(total);
  return (Number(total) || 0) - pph2;
}

export function formatTanggalSingkat(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return String(iso);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
