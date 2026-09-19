import { IUserRepository } from "./../domain/repositories/IUserRepository";
import { User, UserRole } from "./../domain/entities/User";
import { LocalStorageClient } from "../storage/LocalStorageClient";
import { USERS_KEY } from "./../lib/constants";
import { simpleHash } from "../auth/simpleHash";
import { generateId } from "./../lib/id";

export class LocalUserRepository {
  constructor() {
    this.client = new LocalStorageClient(USERS_KEY);
    // Seed 1 akun direktur & 1 akun admin default supaya bisa langsung dicoba.
    this.client.seedIfEmpty([
      {
        id: generateId("user"),
        nama: "Direktur Utama",
        email: "direktur@ayt.co.id",
        passwordHash: simpleHash("direktur123"),
        role: UserRole.DIREKTUR,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId("user"),
        nama: "Admin Operasional",
        email: "admin@ayt.co.id",
        passwordHash: simpleHash("admin123"),
        role: UserRole.ADMIN,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  async findByEmail(email) {
    const users = this.client.getAll();
    return (
      users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ??
      null
    );
  }

  async findById(id) {
    const users = this.client.getAll();
    return users.find((u) => u.id === id) ?? null;
  }

  async create(user) {
    const users = this.client.getAll();
    users.push(user);
    this.client.saveAll(users);
    return user;
  }

  async list() {
    return this.client.getAll();
  }
}
