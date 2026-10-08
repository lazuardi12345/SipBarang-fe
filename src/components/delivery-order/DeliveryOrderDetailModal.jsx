"use client";

import { Modal } from "../ui/Modal";
import { StatusBadge } from "../ui/StatusBadge";
import { CompanyKopSurat } from "../common/CompanyKopSurat";
import { formatRupiah, formatTanggal, formatTanggalWaktu } from "../../utils/format";
import {
  Truck,
  FileText,
  MapPin,
  Package,
  UserCheck,
  CheckCircle2,
  Clock,
  Printer,
  X,
} from "lucide-react";

export function DeliveryOrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      title={`Surat Jalan: ${order.noDO}`}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Tombol Cetak & Aksi */}
        <div className="no-print flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status DO:
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-800 transition"
            >
              <Printer size={15} />
              Cetak Dokumen Surat Jalan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Area Dokumen Resmi (Bisa dicetak) */}
        <div id="invoice-print-area" className="space-y-5 bg-white p-2">
          {/* KOP SURAT RESMI */}
          <CompanyKopSurat
            title="SURAT JALAN PENGIRIMAN (DELIVERY ORDER)"
            subtitle="PT ALMAIRA YUNIAR TREK - Divisi Angkutan & Ekspedisi Darat"
          />

          {/* Header Status & No. DO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase">No. Surat Jalan</p>
              <p className="font-mono font-black text-slate-900 text-sm mt-0.5">{order.noDO}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase">Tgl. Diterbitkan</p>
              <p className="font-semibold text-slate-800 mt-0.5">{formatTanggalWaktu(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase">No. Schedule Pabrik</p>
              <p className="font-mono font-semibold text-slate-900 mt-0.5">{order.noSchedule || "-"}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase">No. Polisi Armada</p>
              <p className="font-mono font-bold text-blue-900 uppercase mt-0.5">{order.noPolisiKendaraan}</p>
            </div>
          </div>

          {/* 1. Jadwal, Gudang & Supir */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b pb-2">
              <Truck size={15} className="text-blue-700" />
              <span>1. Informasi Jadwal & Armada Ekspedisi</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Gudang Asal:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{order.gudangAsal || "Karawang"}</p>
              </div>
              <div>
                <span className="text-slate-500">Tipe Mobil / Rit:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{order.tipeMobilRit || "CDD 8 Ton"}</p>
              </div>
              <div>
                <span className="text-slate-500">Nama Supir:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{order.namaSupir}</p>
              </div>
              <div>
                <span className="text-slate-500">Kontak Supir:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{order.noHpSupir || "-"}</p>
              </div>
            </div>
          </div>

          {/* 2. Surat Jalan Dokumen Pabrik */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b pb-2">
              <FileText size={15} className="text-amber-600" />
              <span>2. Dokumen Surat Jalan dari Perusahaan (Pabrik)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500">No. Dokumen Perusahaan:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{order.noDocPerusahaan || "-"}</p>
              </div>
              <div>
                <span className="text-slate-500">Tgl. Dokumen:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{order.tglDocPerusahaan ? formatTanggal(order.tglDocPerusahaan) : "-"}</p>
              </div>
              <div>
                <span className="text-slate-500">Toko / Depo Tujuan:</span>
                <p className="font-bold text-slate-900 mt-0.5">{order.namaToko || order.namaPenerima || "-"}</p>
              </div>
              <div>
                <span className="text-slate-500">Agen & Salesman:</span>
                <p className="font-medium text-slate-800 mt-0.5">{order.agen || "-"} / {order.salesman || "-"}</p>
              </div>
              <div>
                <span className="text-slate-500">Kota & Kecamatan:</span>
                <p className="font-medium text-slate-800 uppercase mt-0.5">{order.kota || "-"}, {order.kecamatan || "-"}</p>
              </div>
              <div>
                <span className="text-slate-500">Telp. Penerima Toko:</span>
                <p className="font-medium text-slate-800 mt-0.5">{order.noHpPenerima || "-"}</p>
              </div>
              {order.alamatLengkapTujuan && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500">Alamat Lengkap Toko:</span>
                  <p className="font-medium text-slate-800 mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    {order.alamatLengkapTujuan}
                  </p>
                </div>
              )}
              {order.keteranganDoc && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500">Keterangan / Order Merchant:</span>
                  <p className="text-slate-700 italic mt-0.5">{order.keteranganDoc}</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Rincian Tarif & PPh */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b pb-2">
              <MapPin size={15} className="text-emerald-600" />
              <span>4. Biaya Ekspedisi Darat PT ALMAIRA YUNIAR TREK</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Rute Tujuan:</span>
                <p className="font-bold text-slate-900 mt-0.5">{order.tujuanKirim}</p>
                <p className="text-[10px] text-slate-500">{order.areaDistribusi}</p>
              </div>
              <div>
                <span className="text-slate-500">Tarif Bruto:</span>
                <p className="font-bold text-slate-900 mt-0.5">{formatRupiah(order.tarifPengiriman || 0)}</p>
              </div>
              <div>
                <span className="text-slate-500">Uang Jalan Supir:</span>
                <p className="font-bold text-red-600 mt-0.5">- {formatRupiah(order.nilaiPPh || 0)}</p>
              </div>
              <div>
                <span className="text-slate-500">Tarif Tagihan Bersih:</span>
                <p className="text-sm font-extrabold text-emerald-700 mt-0.5">{formatRupiah(order.totalSetelahPPh || 0)}</p>
              </div>
            </div>
          </div>

          {/* 5. Tanda Tangan Resmi Pengiriman */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs pt-3">
            <div className="flex flex-col justify-between h-24 border border-slate-300 rounded-xl p-2 bg-white">
              <p className="text-[10px] font-bold text-slate-600 uppercase">Pengemudi / Supir:</p>
              <p className="font-semibold text-slate-900 underline text-xs">{order.namaSupir}</p>
            </div>
            <div className="flex flex-col justify-between h-24 border border-slate-300 rounded-xl p-2 bg-white">
              <p className="text-[10px] font-bold text-slate-600 uppercase">Penerima Toko/Depo:</p>
              <p className="font-semibold text-slate-900 underline text-xs">{order.namaPenerimaBarang || "( ......................... )"}</p>
            </div>
            <div className="flex flex-col justify-between h-24 border border-slate-300 rounded-xl p-2 bg-white">
              <p className="text-[10px] font-bold text-slate-600 uppercase">Menyetujui (Direktur):</p>
              <p className="font-semibold text-slate-900 underline text-xs">{order.direkturNama || "DIREKTUR UTAMA"}</p>
            </div>
          </div>
        </div>

        {/* Tombol Tutup */}
        <div className="no-print flex justify-end pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </Modal>
  );
}
