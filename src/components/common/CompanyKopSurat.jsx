import React from "react";

export function CompanyKopSurat({ title, subtitle, className = "" }) {
  return (
    <div className={`w-full bg-white select-none ${className}`}>
      <div className="flex items-center justify-between gap-3 pb-2">
        {/* Logo Resmi PT ALMAIRA YUNIAR TREK */}
        <div className="flex-shrink-0">
          <img
            src="/assets/logo.jpg"
            alt="Logo PT ALMAIRA YUNIAR TREK"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Identitas Perusahaan */}
        <div className="text-right flex-1">
          <h2 className="text-lg sm:text-xl font-black tracking-wide text-slate-900 uppercase">
            PT ALMAIRA YUNIAR TREK
          </h2>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
            Jl. Industri Tengsaw Kp. Babakan Desa Tarikolot, Kec. Citeureup,
            <br />
            Kab. Bogor, Provinsi Jawa Barat 16810
          </p>
          <p className="text-[10.5px] text-slate-700 font-medium mt-0.5">
            No. Handphone : <span className="font-semibold">081218739998</span> &nbsp;|&nbsp; Email :{" "}
            <span className="font-semibold">almirayuniartrek@gmail.com</span>
          </p>
        </div>
      </div>

      {/* Garis Pembatas Ganda Khas Kop Surat Resmi (Double Header Line) */}
      <div className="border-b-[3px] border-[#1c3f7d] w-full" />
      <div className="border-b-[1px] border-[#1c3f7d] mt-[2px] w-full mb-3" />

      {/* Sub-judul Dokumen opsional (Misal: FAKTUR TAGIHAN / INVOICE) */}
      {title && (
        <div className="text-center my-2.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-wider uppercase underline underline-offset-4 decoration-2 decoration-[#1c3f7d]">
            {title}
          </h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}
