import { IDeliveryOrderRepository } from "./../../domain/repositories/IDeliveryOrderRepository";
import { DeliveryOrder, StatusDO } from "./../../domain/entities/DeliveryOrder";

export class ApprovalUseCase {
  constructor(doRepository) {
    this.doRepository = doRepository;
  }

  async setujui(orderId, direkturId, catatan) {
    const order = await this.getOrThrow(orderId);
    this.pastikanMenungguACC(order);

    const updated = {
      ...order,
      status: StatusDO.DISETUJUI,
      disetujuiOleh: direkturId,
      disetujuiPada: new Date().toISOString(),
      catatanDirektur: catatan,
      updatedAt: new Date().toISOString(),
    };
    return this.doRepository.update(updated);
  }

  async tolak(orderId, direkturId, catatan) {
    const order = await this.getOrThrow(orderId);
    this.pastikanMenungguACC(order);

    if (!catatan) {
      throw new Error("Alasan penolakan wajib diisi");
    }

    const updated = {
      ...order,
      status: StatusDO.DITOLAK,
      disetujuiOleh: direkturId,
      disetujuiPada: new Date().toISOString(),
      catatanDirektur: catatan,
      updatedAt: new Date().toISOString(),
    };
    return this.doRepository.update(updated);
  }

  async getOrThrow(orderId) {
    const order = await this.doRepository.findById(orderId);
    if (!order) throw new Error("Data pengiriman tidak ditemukan");
    return order;
  }

  pastikanMenungguACC(order) {
    if (order.status !== StatusDO.MENUNGGU_ACC) {
      throw new Error("Data pengiriman ini sudah diproses sebelumnya");
    }
  }
}
