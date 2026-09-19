import { IDeliveryOrderRepository } from "./../domain/repositories/IDeliveryOrderRepository";
import { DeliveryOrder, StatusDO } from "./../domain/entities/DeliveryOrder";
import { LocalStorageClient } from "../storage/LocalStorageClient";
import { DO_KEY } from "./../lib/constants";

export class LocalDeliveryOrderRepository {
  constructor() {
    this.client = new LocalStorageClient(DO_KEY);
  }

  async create(order) {
    const all = this.client.getAll();
    all.unshift(order);
    this.client.saveAll(all);
    return order;
  }

  async update(order) {
    const all = this.client.getAll();
    const idx = all.findIndex((o) => o.id === order.id);
    if (idx === -1) throw new Error("Data pengiriman tidak ditemukan");
    all[idx] = order;
    this.client.saveAll(all);
    return order;
  }

  async findById(id) {
    const all = this.client.getAll();
    return all.find((o) => o.id === id) ?? null;
  }

  async list() {
    return this.client.getAll();
  }

  async listByStatus(status) {
    const all = this.client.getAll();
    return all.filter((o) => o.status === status);
  }
}
