import { IInvoiceRepository } from "./../../domain/repositories/IInvoiceRepository";
import { IDeliveryOrderRepository } from "./../../domain/repositories/IDeliveryOrderRepository";
import {
  CreateInvoiceInput,
  Invoice,
  InvoiceItem,
  StatusInvoice,
} from "./../../domain/entities/Invoice";
import { StatusDO } from "./../../domain/entities/DeliveryOrder";
import { generateId } from "./../../lib/id";

export class GenerateInvoiceUseCase {
  constructor(
    invoiceRepository,
    doRepository
  ) {
    this.invoiceRepository = invoiceRepository;
    this.doRepository = doRepository;
  }

  async execute(input, dibuatOleh) {
    if (!input.namaPelanggan) {
      throw new Error("Nama pelanggan wajib diisi");
    }
    if (!input.deliveryOrderIds || input.deliveryOrderIds.length === 0) {
      throw new Error("Pilih minimal 1 data pengiriman untuk dibuatkan invoice");
    }

    const items = [];
    for (const doId of input.deliveryOrderIds) {
      const order = await this.doRepository.findById(doId);
      if (!order) continue;
      if (order.status !== StatusDO.TERKIRIM) {
        throw new Error(
          `${order.noDO} belum berstatus Terkirim, tidak bisa ditagihkan`
        );
      }
      const pph2 = order.biayaEkspedisi - order.totalSetelahPPh;
      items.push({
        deliveryOrderId: order.id,
        noDO: order.noDO,
        tujuanKirim: order.tujuanKirim,
        tanggalKirim: order.tanggalKirim,
        biayaEkspedisi: order.biayaEkspedisi,
        pph2,
        totalSetelahPPh: order.totalSetelahPPh,
      });
    }

    if (items.length === 0) {
      throw new Error("Tidak ada data pengiriman valid yang dipilih");
    }

    const subtotal = items.reduce((sum, i) => sum + i.biayaEkspedisi, 0);
    const totalPPh2 = items.reduce((sum, i) => sum + i.pph2, 0);
    const totalTagihan = items.reduce((sum, i) => sum + i.totalSetelahPPh, 0);

    const existing = await this.invoiceRepository.list();
    const noInvoice = this.generateNoInvoice(existing.length + 1);

    const invoice = {
      id: generateId("inv"),
      noInvoice,
      tanggalInvoice: new Date().toISOString(),
      namaPelanggan: input.namaPelanggan,
      alamatPelanggan: input.alamatPelanggan,
      items,
      subtotal,
      totalPPh2,
      totalTagihan,
      status: StatusInvoice.BELUM_LUNAS,
      dibuatOleh,
      createdAt: new Date().toISOString(),
    };

    return this.invoiceRepository.create(invoice);
  }

  generateNoInvoice(sequence) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const padded = String(sequence).padStart(4, "0");
    return `INV/AYT/${yyyy}/${mm}/${padded}`;
  }
}
