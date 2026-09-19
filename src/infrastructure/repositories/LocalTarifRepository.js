import { ITarifRepository } from "./../domain/repositories/ITarifRepository";
import { TarifPengiriman } from "./../domain/entities/TarifPengiriman";
import { LocalStorageClient } from "../storage/LocalStorageClient";
import { TARIF_KEY } from "./../lib/constants";
import { SEED_TARIF } from "./seedTarif";

export class LocalTarifRepository {
  constructor() {
    this.client = new LocalStorageClient(TARIF_KEY);
    this.client.seedIfEmpty(SEED_TARIF);
  }

  async list() {
    return this.client.getAll();
  }

  async findById(id) {
    const all = this.client.getAll();
    return all.find((t) => t.id === id) ?? null;
  }
}
