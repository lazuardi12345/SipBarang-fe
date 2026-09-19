import { IDeliveryOrderRepository } from "./../../domain/repositories/IDeliveryOrderRepository";
import { DeliveryOrder, StatusDO } from "./../../domain/entities/DeliveryOrder";

export class GetDeliveryOrdersUseCase {
  constructor(doRepository) {
    this.doRepository = doRepository;
  }

  async semua() {
    const all = await this.doRepository.list();
    return all.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async menungguACC() {
    return this.doRepository.listByStatus(StatusDO.MENUNGGU_ACC);
  }

  async siapDikirim() {
    const disetujui = await this.doRepository.listByStatus(StatusDO.DISETUJUI);
    const dalamPengiriman = await this.doRepository.listByStatus(
      StatusDO.DALAM_PENGIRIMAN
    );
    return [...disetujui, ...dalamPengiriman];
  }

  async terkirim() {
    return this.doRepository.listByStatus(StatusDO.TERKIRIM);
  }

  async byId(id) {
    return this.doRepository.findById(id);
  }
}
