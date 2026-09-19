import { IInvoiceRepository } from "./../domain/repositories/IInvoiceRepository";
import { Invoice } from "./../domain/entities/Invoice";
import { LocalStorageClient } from "../storage/LocalStorageClient";
import { INVOICE_KEY } from "./../lib/constants";

export class LocalInvoiceRepository {
  constructor() {
    this.client = new LocalStorageClient(INVOICE_KEY);
  }

  async create(invoice) {
    const all = this.client.getAll();
    all.unshift(invoice);
    this.client.saveAll(all);
    return invoice;
  }

  async update(invoice) {
    const all = this.client.getAll();
    const idx = all.findIndex((i) => i.id === invoice.id);
    if (idx === -1) throw new Error("Invoice tidak ditemukan");
    all[idx] = invoice;
    this.client.saveAll(all);
    return invoice;
  }

  async findById(id) {
    const all = this.client.getAll();
    return all.find((i) => i.id === id) ?? null;
  }

  async list() {
    return this.client.getAll();
  }
}
