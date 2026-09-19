import { IDeliveryOrderRepository } from "./../../domain/repositories/IDeliveryOrderRepository";
import { ITarifRepository } from "./../../domain/repositories/ITarifRepository";
import {
  CreateDeliveryOrderInput,
  DeliveryOrder,
  StatusDO,
} from "./../../domain/entities/DeliveryOrder";
import { generateId } from "./../../lib/id";

export class CreateDeliveryOrderUseCase {
  constructor(
    doRepository,
    tarifRepository
  ) {
    this.doRepository = doRepository;
    this.tarifRepository = tarifRepository;
  }

  async execute(input, dibuatOleh) {
    if (!input.namaSupir || !input.noPolisiKendaraan || !input.tarifId) {
      throw new Error("Nama supir, no polisi, dan tujuan kirim wajib diisi");
    }

    const tarif = await this.tarifRepository.findById(input.tarifId);
    if (!tarif) {
      throw new Error("Tujuan kirim / tarif tidak ditemukan");
    }

    const existing = await this.doRepository.list();
    const noDO = this.generateNoDO(existing.length + 1);
    const now = new Date().toISOString();

    const order = {
      id: generateId("do"),
      noDO,
      tanggalKirim: now,
      namaSupir: input.namaSupir,
      noHpSupir: input.noHpSupir,
      noPolisiKendaraan: input.noPolisiKendaraan,
      jenisKendaraan: input.jenisKendaraan,
      tarifId: tarif.id,
      areaDistribusi: tarif.areaDistribusi,
      tujuanKirim: tarif.tujuanKirim,
      alamatLengkapTujuan: input.alamatLengkapTujuan,
      namaPenerima: input.namaPenerima,
      noHpPenerima: input.noHpPenerima,
      namaBarang: input.namaBarang,
      jumlahKoli: input.jumlahKoli,
      beratBarangKg: input.beratBarangKg,
      catatanBarang: input.catatanBarang,
      biayaEkspedisi: tarif.total,
      pph2Persen: 2,
      totalSetelahPPh: tarif.totalSetelahPPh,
      status: StatusDO.MENUNGGU_ACC,
      dibuatOleh,
      createdAt: now,
      updatedAt: now,
    };

    return this.doRepository.create(order);
  }

  generateNoDO(sequence) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const padded = String(sequence).padStart(4, "0");
    return `DO/${yyyy}/${mm}/${padded}`;
  }
}
