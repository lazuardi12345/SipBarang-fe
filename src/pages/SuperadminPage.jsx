import { Fragment, cloneElement, useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Truck,
  Users,
  X,
} from "lucide-react";
import { superadminApi } from "../api/superadmin";
import { Modal } from "../components/ui/Modal";
import { formatRupiah, formatTanggal } from "../utils/format";
import { STATUS_LABEL, StatusDO, StatusInvoice, UserRole } from "../utils/constants";

const TABS = [
  { id: "deliveryOrders", label: "Pengiriman", icon: Truck },
  { id: "invoices", label: "Invoice", icon: FileText },
  { id: "tarifs", label: "Tarif", icon: CircleDollarSign },
  { id: "users", label: "Pengguna", icon: Users },
  { id: "reports", label: "Laporan", icon: Archive },
];

const ORDER_STATUSES = [
  "DRAFT",
  "PLANNING",
  "MENUNGGU_ACC",
  "MENUNGGU_APPROVAL",
  "DISETUJUI",
  "APPROVED",
  "DITOLAK",
  "REJECTED",
  "DALAM_PENGIRIMAN",
  "MENUNGGU_KONFIRMASI",
  "TERKIRIM",
  "DIKIRIM",
  "SELESAI",
  "DIBATALKAN",
];
const INVOICE_STATUSES = ["BELUM_LUNAS", "LUNAS", "DIBATALKAN"];
const USER_ROLES = [UserRole.ADMIN, UserRole.DIREKTUR, UserRole.SUPERADMIN];

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function defaultDraft(tab, record, orders) {
  if (record) {
    if (tab === "deliveryOrders") {
      return {
        ...record,
        tanggalKirim: toDateInput(record.tanggalKirim),
        schedule: { ...record.schedule, tglSchedule: toDateInput(record.schedule?.tglSchedule) },
        document: { ...record.document, tglDocPerusahaan: toDateInput(record.document?.tglDocPerusahaan) },
      };
    }
    if (tab === "invoices") {
      return {
        ...record,
        tanggalInvoice: toDateInput(record.tanggalInvoice),
        items: (record.items || []).map((item) => ({
          ...item,
          tglDocPerusahaan: toDateInput(item.tglDocPerusahaan),
          tanggalKirim: toDateInput(item.tanggalKirim),
        })),
      };
    }
    if (tab === "reports") {
      return { ...record, orderId: record.orderId, active: record.active !== false };
    }
    return { ...record, password: "" };
  }

  if (tab === "users") return { nama: "", email: "", role: "ADMIN", password: "", active: true };
  if (tab === "tarifs") return { areaDistribusi: "KARAWANG", tujuanKirim: "", total: 0, active: true };
  if (tab === "deliveryOrders") {
    return {
      noDo: "",
      tanggalKirim: "",
      status: StatusDO.PLANNING,
      tarifId: "",
      areaDistribusi: "KARAWANG",
      tujuanKirim: "",
      biayaEkspedisi: 0,
      pph2: 0,
      totalSetelahPPh: 0,
      uangJalanSupir: "",
      jumlahKoli: 0,
      namaBarang: "",
      catatanBarang: "",
      schedule: { noSchedule: "", tglSchedule: "", tipeMobilRit: "", gudangAsal: "KARAWANG", namaSupir: "", noHpSupir: "", noPolisiKendaraan: "", jenisKendaraan: "" },
      document: { noDocPerusahaan: "", tglDocPerusahaan: "", namaToko: "", salesman: "", agen: "", kota: "", kecamatan: "", alamatLengkapTujuan: "", noHpPenerima: "", keteranganDoc: "", mdo: "", lembar: "" },
    };
  }
  if (tab === "invoices") {
    return {
      noInvoice: "",
      tanggalInvoice: toDateInput(new Date()),
      namaPelanggan: "",
      alamatPelanggan: "",
      noPoCustomer: "",
      subtotal: 0,
      totalPph2: 0,
      totalTagihan: 0,
      status: StatusInvoice.BELUM_LUNAS,
      items: [],
    };
  }
  const initialOrder = orders[0];
  return {
    id: "",
    orderId: initialOrder?.id || "",
    noDo: initialOrder?.noDo || "",
    namaPenerimaBarang: "",
    catatanPelaporan: "",
    buktiPengirimanUrl: "",
    tanggalDiterima: "",
    active: true,
  };
}

function getReportRows(orders) {
  return orders.flatMap((order) =>
    (order.reports || []).map((report) => ({
      ...report,
      orderId: order.id,
      noDo: order.noDo,
      noSchedule: order.schedule?.noSchedule,
      tujuanKirim: order.tujuanKirim,
    }))
  );
}

function getStatusLabel(status) {
  return STATUS_LABEL[status] || status || "-";
}

function getFields(tab) {
  if (tab === "users") return [
    { key: "nama", label: "Nama lengkap", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "role", label: "Role", type: "select", options: USER_ROLES },
    { key: "password", label: "Password", type: "password", required: false, help: "Wajib untuk akun baru; kosongkan jika tidak ingin mengganti password." },
    { key: "active", label: "Akun aktif", type: "checkbox" },
  ];
  if (tab === "tarifs") return [
    { key: "areaDistribusi", label: "Asal / area distribusi", required: true },
    { key: "tujuanKirim", label: "Tujuan kirim", required: true },
    { key: "total", label: "Tarif bruto", type: "number", min: 0, required: true },
    { key: "active", label: "Tarif aktif untuk input DO", type: "checkbox" },
  ];
  if (tab === "invoices") return [
    { key: "noInvoice", label: "Nomor invoice", required: true },
    { key: "tanggalInvoice", label: "Tanggal invoice", type: "date", required: true },
    { key: "namaPelanggan", label: "Nama pelanggan", required: true },
    { key: "alamatPelanggan", label: "Alamat pelanggan", type: "textarea" },
    { key: "noPoCustomer", label: "No. PO customer" },
    { key: "status", label: "Status invoice", type: "select", options: INVOICE_STATUSES },
    { key: "subtotal", label: "Subtotal bruto", type: "number", min: 0 },
    { key: "totalPph2", label: "Total PPh 2%", type: "number", min: 0 },
    { key: "totalTagihan", label: "Total tagihan", type: "number", min: 0 },
  ];
  if (tab === "deliveryOrders") return [
    { key: "noDo", label: "Nomor DO", required: true },
    { key: "status", label: "Status", type: "select", options: ORDER_STATUSES },
    { key: "tanggalKirim", label: "Tanggal kirim", type: "date" },
    { key: "tarifId", label: "Opsi tarif", type: "select", options: [], required: true },
    { key: "areaDistribusi", label: "Asal / area distribusi" },
    { key: "tujuanKirim", label: "Tujuan kirim" },
    { key: "biayaEkspedisi", label: "Tarif bruto", type: "number", min: 0 },
    { key: "pph2", label: "PPh 2%", type: "number", min: 0 },
    { key: "totalSetelahPPh", label: "Total netto", type: "number", min: 0 },
    { key: "uangJalanSupir", label: "Uang jalan supir", type: "number", min: 0, help: "Boleh dikosongkan dulu; isi setelah data biaya sopir terverifikasi." },
    { key: "jumlahKoli", label: "Jumlah koli", type: "number", min: 0 },
    { key: "namaBarang", label: "Nama barang", type: "textarea" },
    { key: "catatanBarang", label: "Catatan barang", type: "textarea" },
    { key: "schedule.noSchedule", label: "No. schedule", group: "Schedule" },
    { key: "schedule.tglSchedule", label: "Tanggal schedule", type: "date", group: "Schedule" },
    { key: "schedule.tipeMobilRit", label: "Tipe mobil / Rit", group: "Schedule" },
    { key: "schedule.gudangAsal", label: "Gudang asal", group: "Schedule" },
    { key: "schedule.namaSupir", label: "Nama supir", group: "Schedule" },
    { key: "schedule.noHpSupir", label: "No. HP supir", group: "Schedule" },
    { key: "schedule.noPolisiKendaraan", label: "No. polisi", group: "Schedule" },
    { key: "schedule.jenisKendaraan", label: "Jenis kendaraan", group: "Schedule" },
    { key: "document.noDocPerusahaan", label: "No. surat jalan perusahaan", group: "Dokumen & tujuan" },
    { key: "document.tglDocPerusahaan", label: "Tanggal dokumen", type: "date", group: "Dokumen & tujuan" },
    { key: "document.namaToko", label: "Nama toko / penerima", group: "Dokumen & tujuan" },
    { key: "document.salesman", label: "Salesman", group: "Dokumen & tujuan" },
    { key: "document.agen", label: "Agen", group: "Dokumen & tujuan" },
    { key: "document.kota", label: "Kota", group: "Dokumen & tujuan" },
    { key: "document.kecamatan", label: "Kecamatan", group: "Dokumen & tujuan" },
    { key: "document.alamatLengkapTujuan", label: "Alamat lengkap tujuan", type: "textarea", group: "Dokumen & tujuan" },
    { key: "document.noHpPenerima", label: "No. HP penerima", group: "Dokumen & tujuan" },
    { key: "document.keteranganDoc", label: "Keterangan dokumen", type: "textarea", group: "Dokumen & tujuan" },
    { key: "document.mdo", label: "MDO", group: "Dokumen & tujuan" },
    { key: "document.lembar", label: "Lembar", group: "Dokumen & tujuan" },
  ];
  return [
    { key: "orderId", label: "Surat jalan / DO", type: "select", options: [] },
    { key: "namaPenerimaBarang", label: "Penerima barang" },
    { key: "tanggalDiterima", label: "Tanggal diterima", type: "date" },
    { key: "catatanPelaporan", label: "Catatan laporan", type: "textarea" },
    { key: "buktiPengirimanUrl", label: "URL bukti pengiriman", type: "textarea" },
    { key: "active", label: "Laporan aktif", type: "checkbox" },
  ];
}

function readPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function updatePath(object, path, value) {
  const [head, ...tail] = path.split(".");
  if (!tail.length) return { ...object, [head]: value };
  return { ...object, [head]: updatePath(object[head] || {}, tail.join("."), value) };
}

function statusClass(status) {
  if (["TERKIRIM", "LUNAS"].includes(status)) return "bg-emerald-50 text-emerald-700";
  if (["DIBATALKAN", "DITOLAK", "REJECTED"].includes(status)) return "bg-red-50 text-red-700";
  if (status === "BELUM_LUNAS") return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
}

export default function SuperadminPage() {
  const [data, setData] = useState({ users: [], tarifs: [], deliveryOrders: [], invoices: [], counts: {} });
  const [tab, setTab] = useState("deliveryOrders");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await superadminApi.overview());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat data manajemen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const reports = useMemo(() => getReportRows(data.deliveryOrders), [data.deliveryOrders]);
  const rows = tab === "reports" ? reports : data[tab] || [];
  const filteredRows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    if (!query) return rows;
    return rows.filter((row) => JSON.stringify(row).toLocaleLowerCase("id-ID").includes(query));
  }, [rows, search]);

  const openCreate = () => {
    setEditing(null);
    setDraft(defaultDraft(tab, null, data.deliveryOrders));
    setNotice("");
  };

  const openEdit = (record) => {
    setEditing(record);
    setDraft(defaultDraft(tab, record, data.deliveryOrders));
    setNotice("");
  };

  const closeEditor = () => {
    if (saving) return;
    setDraft(null);
    setEditing(null);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError("");
    try {
      if (tab === "reports") {
        const { orderId, id, noDo, noSchedule, tujuanKirim, ...payload } = draft;
        if (editing) await superadminApi.updateReport(orderId, id, payload);
        else await superadminApi.createReport(orderId, payload);
      } else if (editing) {
        const payload = { ...draft };
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;
        delete payload.items;
        if (tab === "deliveryOrders") {
          payload.schedule = draft.schedule;
          payload.document = draft.document;
        }
        if (tab === "invoices") payload.items = draft.items || [];
        await superadminApi.update(tab === "deliveryOrders" ? "delivery-orders" : tab, editing.id, payload);
      } else {
        const payload = { ...draft };
        if (tab !== "users" && tab !== "tarifs") delete payload.active;
        if (tab === "deliveryOrders") {
          payload.schedule = draft.schedule;
          payload.document = draft.document;
        }
        if (tab === "invoices") payload.items = draft.items || [];
        if (tab === "reports") throw new Error("Pilih surat jalan untuk membuat laporan.");
        await superadminApi.create(tab === "deliveryOrders" ? "delivery-orders" : tab, payload);
      }
      await loadData();
      setDraft(null);
      setEditing(null);
      setNotice("Perubahan berhasil disimpan.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const patchRecord = async (resource, id, payload) => {
    setError("");
    setNotice("");
    try {
      await superadminApi.update(resource, id, payload);
      await loadData();
      setNotice("Status data berhasil diperbarui.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Gagal memperbarui status data.");
    }
  };

  const toggleActive = async (row) => {
    if (tab === "reports") {
      try {
        await superadminApi.updateReport(row.orderId, row.id, { active: row.active === false });
        await loadData();
        setNotice("Status laporan berhasil diperbarui.");
      } catch (updateError) {
        setError(updateError instanceof Error ? updateError.message : "Gagal memperbarui status laporan.");
      }
      return;
    }
    if (tab === "users" || tab === "tarifs") {
      await patchRecord(tab, row.id, { active: !row.active });
      return;
    }
    if (tab === "deliveryOrders" || tab === "invoices") {
      const currentStatus = row.status;
      const cancelled = currentStatus !== "DIBATALKAN";
      const nextStatus = cancelled
        ? "DIBATALKAN"
        : tab === "deliveryOrders" ? StatusDO.PLANNING : StatusInvoice.BELUM_LUNAS;
      const confirmed = window.confirm(
        cancelled
          ? "Batalkan data ini? Data tidak dihapus permanen dan jejak audit tetap tersimpan."
          : `Pulihkan data ini ke status ${nextStatus}?`
      );
      if (!confirmed) return;
      await patchRecord(tab === "deliveryOrders" ? "delivery-orders" : tab, row.id, { status: nextStatus });
    }
  };

  const title = TABS.find((item) => item.id === tab)?.label || "Manajemen";

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            <Shield size={15} /> Pusat Kendali Superadmin
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Manajemen Data SIPBarang</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola data operasional dari satu tempat. Data dibatalkan atau dinonaktifkan, bukan dihapus permanen.</p>
        </div>
        <button type="button" onClick={loadData} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Muat ulang
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Pengguna aktif", data.counts.activeUsers ?? 0, Users],
          ["Opsi tarif aktif", data.counts.activeTarifs ?? 0, CircleDollarSign],
          ["Total surat jalan", data.counts.deliveryOrders ?? 0, Truck],
          ["Total invoice", data.counts.invoices ?? 0, FileText],
          ["Total pengguna", data.counts.users ?? 0, Shield],
        ].map(([label, count, Icon]) => (
          <article key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={18} /></span>
            <div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="text-xl font-extrabold text-slate-900">{count}</p></div>
          </article>
        ))}
      </section>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => { setTab(id); setSearch(""); setNotice(""); }}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${tab === id ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Cari ${title.toLowerCase()}...`} className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 sm:w-64" />
            </label>
            <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"><Plus size={16} /> Tambah {title}</button>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <div><h2 className="font-bold text-slate-900">{title}</h2><p className="text-xs text-slate-500">{filteredRows.length} data ditampilkan · approval dan riwayat dijaga sebagai jejak audit.</p></div>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{rows.length} total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>{getHeaders(tab).map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}<th className="px-4 py-3 text-right font-bold">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => <tr key={row.id} className="align-top text-slate-700 hover:bg-slate-50/70">
                {renderCells(tab, row)}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => openEdit(row)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-white">Detail / Edit</button>
                    {tab !== "reports" && (
                      <button type="button" onClick={() => toggleActive(row)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${isInactive(tab, row) ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
                        {isInactive(tab, row) ? "Pulihkan" : "Nonaktifkan"}
                      </button>
                    )}
                    {tab === "reports" && (
                      <button type="button" onClick={() => toggleActive(row)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${row.active === false ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {row.active === false ? "Pulihkan" : "Arsipkan"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>)}
              {!loading && filteredRows.length === 0 && <tr><td colSpan={getHeaders(tab).length + 1} className="px-5 py-14 text-center text-sm text-slate-400">{search ? "Tidak ada data yang cocok dengan pencarian." : `Belum ada data ${title.toLowerCase()}.`}</td></tr>}
              {loading && <tr><td colSpan={getHeaders(tab).length + 1} className="px-5 py-14 text-center text-sm text-slate-400">Memuat data...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {draft && <Modal title={`${editing ? "Edit" : "Tambah"} ${title}`} onClose={closeEditor} maxWidth="max-w-6xl">
        <form onSubmit={save} className="space-y-6">
          <div className="grid gap-x-4 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
            {renderFormFields(tab, draft, setDraft, data)}
          </div>
          {tab === "invoices" && <InvoiceItemsEditor draft={draft} setDraft={setDraft} orders={data.deliveryOrders} />}
          {tab === "deliveryOrders" && editing && <AuditDetails record={editing} />}
          <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
            <p className="max-w-2xl text-xs text-slate-500">Hapus permanen tidak tersedia. Nonaktifkan atau batalkan data agar relasi dan jejak audit tetap tersimpan.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeEditor} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Batal</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                <Check size={16} /> {saving ? "Menyimpan..." : "Simpan perubahan"}
              </button>
            </div>
          </div>
        </form>
      </Modal>}
    </div>
  );
}

function getHeaders(tab) {
  if (tab === "users") return ["Nama", "Email", "Role", "Dibuat", "Status"];
  if (tab === "tarifs") return ["Asal", "Tujuan", "Tarif bruto", "Status"];
  if (tab === "deliveryOrders") return ["No. DO", "Schedule", "Surat jalan", "Tanggal kirim", "Tujuan", "Tarif", "Uang jalan sopir", "Rit", "Status"];
  if (tab === "invoices") return ["No. Invoice", "Tanggal", "Pelanggan", "Item", "Total tagihan", "Status"];
  return ["No. DO", "Schedule", "Penerima", "Tanggal diterima", "Catatan", "Status"];
}

function renderCells(tab, row) {
  const dateCell = (value) => <td className="whitespace-nowrap px-4 py-3">{formatTanggal(value)}</td>;
  const badge = (value, inactive = false) => <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${inactive ? "bg-slate-100 text-slate-500" : statusClass(value)}`}>{inactive ? "Nonaktif" : getStatusLabel(value)}</span>;
  if (tab === "users") return <>
    <td className="px-4 py-3 font-semibold text-slate-900">{row.nama}</td><td className="px-4 py-3">{row.email}</td><td className="px-4 py-3"><span className="rounded-lg bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700">{row.role}</span></td>{dateCell(row.createdAt)}<td className="px-4 py-3">{badge("", !row.active)}</td>
  </>;
  if (tab === "tarifs") return <>
    <td className="px-4 py-3">{row.areaDistribusi}</td><td className="px-4 py-3 font-semibold text-slate-900">{row.tujuanKirim}</td><td className="whitespace-nowrap px-4 py-3 font-semibold">{formatRupiah(row.total)}</td><td className="px-4 py-3">{badge("", !row.active)}</td>
  </>;
  if (tab === "deliveryOrders") return <>
    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{row.noDo}</td><td className="px-4 py-3">{row.schedule?.noSchedule || "-"}</td><td className="px-4 py-3">{row.document?.noDocPerusahaan || "-"}</td>{dateCell(row.tanggalKirim)}<td className="px-4 py-3">{row.tujuanKirim || "-"}</td><td className="whitespace-nowrap px-4 py-3">{formatRupiah(row.biayaEkspedisi)}</td><td className="whitespace-nowrap px-4 py-3">{row.uangJalanSupir == null ? "Belum diisi" : formatRupiah(row.uangJalanSupir)}</td><td className="px-4 py-3">{row.schedule?.tipeMobilRit || "-"}</td><td className="px-4 py-3">{badge(row.status)}</td>
  </>;
  if (tab === "invoices") return <>
    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{row.noInvoice}</td>{dateCell(row.tanggalInvoice)}<td className="px-4 py-3">{row.namaPelanggan}</td><td className="px-4 py-3">{row.items?.length || 0} item</td><td className="whitespace-nowrap px-4 py-3 font-semibold">{formatRupiah(row.totalTagihan)}</td><td className="px-4 py-3">{badge(row.status)}</td>
  </>;
  return <>
    <td className="px-4 py-3 font-mono font-semibold">{row.noDo || "-"}</td><td className="px-4 py-3">{row.noSchedule || "-"}</td><td className="px-4 py-3">{row.namaPenerimaBarang || "-"}</td>{dateCell(row.tanggalDiterima)}<td className="max-w-xs truncate px-4 py-3" title={row.catatanPelaporan || ""}>{row.catatanPelaporan || "-"}</td><td className="px-4 py-3">{badge("", !row.active)}</td>
  </>;
}

function isInactive(tab, row) {
  if (tab === "users" || tab === "tarifs") return !row.active;
  return row.status === "DIBATALKAN";
}

function renderFormFields(tab, draft, setDraft, data) {
  const fields = getFields(tab);
  return fields.map((field, index) => {
    const value = readPath(draft, field.key);
    const id = `admin-field-${field.key.replaceAll(".", "-")}`;
    if (field.type === "checkbox") return <label key={field.key} htmlFor={id} className="flex min-h-[42px] items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
      <input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => setDraft((current) => updatePath(current, field.key, event.target.checked))} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
      {field.label}
    </label>;
    const selectOptions = field.key === "tarifId"
      ? data.tarifs.map((tarif) => ({ value: tarif.id, label: `${tarif.areaDistribusi} → ${tarif.tujuanKirim} · ${formatRupiah(tarif.total)}${tarif.active ? "" : " (nonaktif)"}` }))
      : field.key === "orderId"
        ? data.deliveryOrders.map((order) => ({ value: order.id, label: `${order.noDo} · ${order.schedule?.noSchedule || "-"} · ${order.tujuanKirim || "-"}` }))
        : (field.options || []).map((option) => ({ value: option, label: option }));
    const availableOptions = field.key === "tarifId"
      ? selectOptions.filter((option) => {
        const tarif = data.tarifs.find((item) => item.id === option.value);
        return tarif?.active || option.value === draft.tarifId;
      })
      : selectOptions;
    const controlClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const onChange = (event) => {
      const nextValue = event.target.value;
      if (field.key === "tarifId" && nextValue) {
        const tarif = data.tarifs.find((item) => item.id === nextValue);
        if (tarif) {
          const total = Number(tarif.total || 0);
          const pph2 = Math.round(total * 0.02);
          setDraft((current) => ({
            ...current,
            tarifId: tarif.id,
            areaDistribusi: tarif.areaDistribusi,
            tujuanKirim: tarif.tujuanKirim,
            biayaEkspedisi: total,
            pph2,
            totalSetelahPPh: total - pph2,
          }));
          return;
        }
      }
      setDraft((current) => updatePath(current, field.key, nextValue));
    };
    const label = <span className="text-xs font-bold text-slate-600">{field.label}{field.required && <span className="text-red-500"> *</span>}</span>;
    const control = field.type === "select" ? <select required={field.required} value={value ?? ""} onChange={onChange} className={controlClass}>
      {field.key !== "status" && field.key !== "role" && <option value="">Pilih...</option>}
      {availableOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
      : field.type === "textarea" ? <textarea required={field.required} rows={2} value={value ?? ""} onChange={onChange} className={controlClass} />
        : <input required={field.required && !(field.type === "password" && draft.id)} type={field.type || "text"} min={field.min} value={value ?? ""} onChange={onChange} className={controlClass} />;
    const group = field.group || "";
    const startsGroup = group && fields[index - 1]?.group !== group;
    return <Fragment key={field.key}>
      {startsGroup && <h4 className="mb-1 mt-3 border-b border-slate-200 pb-2 text-xs font-extrabold uppercase tracking-wider text-blue-700 md:col-span-2 xl:col-span-3">{group}</h4>}
      <div className={`${field.key.includes(".") ? "bg-slate-50/70" : ""} ${field.type === "textarea" ? "md:col-span-2" : ""} rounded-xl p-1`}>
        <label htmlFor={id}>{label}{cloneElement(control, { id, disabled: field.key === "orderId" && Boolean(draft.id) })}</label>
        {field.help && <p className="mt-1 text-[11px] text-slate-400">{field.help}</p>}
      </div>
    </Fragment>;
  });
}

function InvoiceItemsEditor({ draft, setDraft, orders }) {
  const items = draft.items || [];
  const updateItem = (index, key, value) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }));
  };
  return <section className="rounded-2xl border border-slate-200">
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
      <div><h3 className="text-sm font-extrabold text-slate-800">Rincian invoice</h3><p className="text-xs text-slate-500">Data item dan angka invoice disimpan sesuai input; tidak dihitung ulang otomatis.</p></div>
      <button type="button" onClick={() => setDraft((current) => ({ ...current, items: [...(current.items || []), { areaDistribusi: "", tujuanKirim: "", noDO: "", noDocPerusahaan: "", tanggalKirim: "", biayaEkspedisi: 0, pph2: 0, totalSetelahPPh: 0, namaBarang: "", jumlahKoli: 0 }] }))} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"><Plus size={14} /> Tambah item</button>
    </div>
    <div className="space-y-3 p-3">
      {items.map((item, index) => <div key={item.id || `item-${index}`} className="grid gap-2 rounded-xl bg-slate-50 p-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["noDO", "No. DO"], ["noDocPerusahaan", "No. surat jalan"], ["tglDocPerusahaan", "Tanggal surat jalan", "date"],
          ["areaDistribusi", "Asal"], ["tujuanKirim", "Tujuan"], ["tanggalKirim", "Tanggal kirim", "date"],
          ["namaToko", "Toko"], ["namaSupir", "Supir"], ["noPolisiKendaraan", "No. polisi"],
          ["namaBarang", "Nama barang", "textarea"], ["biayaEkspedisi", "Tarif bruto", "number"], ["pph2", "PPh 2%", "number"],
          ["totalSetelahPPh", "Netto", "number"], ["jumlahKoli", "Jumlah koli", "number"],
        ].map(([key, label, type]) => <label key={key} className="text-[11px] font-bold text-slate-500">{label}
          {type === "textarea"
            ? <textarea rows={2} value={item[key] ?? ""} onChange={(event) => updateItem(index, key, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal text-slate-800 outline-none focus:border-blue-400" />
            : <input type={type || "text"} min={type === "number" ? 0 : undefined} value={item[key] ?? ""} onChange={(event) => updateItem(index, key, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal text-slate-800 outline-none focus:border-blue-400" />}
        </label>)}
        <label className="text-[11px] font-bold text-slate-500 md:col-span-2 xl:col-span-2">Tautkan ke DO (opsional)
          <select value={item.deliveryOrderId || ""} onChange={(event) => {
            const order = orders.find((candidate) => candidate.id === event.target.value);
            if (!order) {
              updateItem(index, "deliveryOrderId", "");
              return;
            }
            setDraft((current) => ({
              ...current,
              items: current.items.map((row, rowIndex) => rowIndex === index ? {
                ...row,
                deliveryOrderId: order.id,
                noDO: order.noDo || "",
                noDocPerusahaan: order.document?.noDocPerusahaan || "",
                tglDocPerusahaan: toDateInput(order.document?.tglDocPerusahaan),
                areaDistribusi: order.areaDistribusi || "",
                tujuanKirim: order.tujuanKirim || "",
                tanggalKirim: toDateInput(order.tanggalKirim),
                namaToko: order.document?.namaToko || "",
                namaSupir: order.schedule?.namaSupir || "",
                noPolisiKendaraan: order.schedule?.noPolisiKendaraan || "",
                biayaEkspedisi: Number(order.biayaEkspedisi || 0),
                pph2: Number(order.pph2 || 0),
                totalSetelahPPh: Number(order.totalSetelahPPh || 0),
              } : row),
            }));
          }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal text-slate-800 outline-none focus:border-blue-400">
            <option value="">Tanpa tautan DO</option>
            {orders.map((order) => <option key={order.id} value={order.id}>{order.noDo} · {order.schedule?.noSchedule || "-"} · {order.tujuanKirim || "-"}</option>)}
          </select>
        </label>
        <label className="text-[11px] font-bold text-slate-500 md:col-span-2 xl:col-span-3">Nama barang / keterangan
          <input value={item.namaBarang || ""} onChange={(event) => updateItem(index, "namaBarang", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal text-slate-800 outline-none focus:border-blue-400" />
        </label>
        <button type="button" onClick={() => setDraft((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))} className="self-end rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Hapus baris</button>
        <button type="button" onClick={() => setDraft((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))} className="inline-flex items-center gap-1 self-end rounded-lg px-2 py-2 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={14} /> Hapus item</button>
      </div>)}
      {items.length === 0 && <p className="py-4 text-center text-xs text-slate-400">Belum ada rincian. Gunakan “Tambah item” untuk menambahkan baris invoice.</p>}
    </div>
  </section>;
}

function AuditDetails({ record }) {
  const sections = [
    ["Persetujuan (hanya lihat)", record.approvals],
    ["Konfirmasi (hanya lihat)", record.confirmations],
    ["Riwayat perubahan (hanya lihat)", record.histories],
  ];
  return <details className="rounded-xl border border-slate-200 px-4 py-3">
    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-slate-700">Jejak audit <ChevronDown size={16} /></summary>
    <div className="mt-3 grid gap-3 lg:grid-cols-3">
      {sections.map(([title, entries]) => <div key={title} className="rounded-lg bg-slate-50 p-3">
        <h4 className="mb-2 text-xs font-bold text-slate-700">{title}</h4>
        {entries?.length ? <ul className="space-y-2">{entries.map((entry) => <li key={entry.id} className="border-t border-slate-200 pt-2 text-[11px] text-slate-500">{entry.action || entry.newStatus || entry.catatanKonfirmasiDirektur || "Catatan"} · {formatTanggal(entry.createdAt || entry.confirmedAt)}</li>)}</ul> : <p className="text-[11px] text-slate-400">Belum ada catatan.</p>}
      </div>)}
    </div>
  </details>;
}
