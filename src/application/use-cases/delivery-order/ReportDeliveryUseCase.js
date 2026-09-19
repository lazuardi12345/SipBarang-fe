import { IDeliveryOrderRepository } from "./../../domain/repositories/IDeliveryOrderRepository";
import { DeliveryOrder, StatusDO } from "./../../domain/entities/DeliveryOrder";

export class ReportDeliveryUseCase {
  constructor(doRepository) {
    this.doRepository = doRepository;
  }

  async execute(input) {
    const order = await this.doRepository.findById(input.orderId);
    if (!order) throw new Error("Data pengiriman tidak ditemukan");

    if (
      order.status !== StatusDO.DISETUJUI &&
      order.status !== StatusDO.DALAM_PENGIRIMAN
    ) {
      throw new Error(
        "Pengiriman hanya bisa dilaporkan setelah disetujui direktur"
      );
    }
    if (!input.namaPenerimaBarang) {
      throw new Error("Nama penerima barang wajib diisi");
    }

    const updated = {
      ...order,
      status: StatusDO.TERKIRIM,
      namaPenerimaBarang: input.namaPenerimaBarang,
      catatanPelaporan: input.catatanPelaporan,
      buktiPengirimanUrl: input.buktiPengirimanUrl,
      tanggalDiterima: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.doRepository.update(updated);
  }
}
