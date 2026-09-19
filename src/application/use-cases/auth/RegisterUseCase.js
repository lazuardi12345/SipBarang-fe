import { IUserRepository } from "./../../domain/repositories/IUserRepository";
import { User, UserRole, toSafeUser, UserWithoutPassword } from "./../../domain/entities/User";
import { simpleHash } from "./../../infrastructure/auth/simpleHash";
import { generateId } from "./../../lib/id";

export class RegisterUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(input) {
    const { nama, email, password, role } = input;

    if (!nama || !email || !password) {
      throw new Error("Semua field wajib diisi");
    }
    if (password.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }
    if (!Object.values(UserRole).includes(role)) {
      throw new Error("Role tidak valid");
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("Email sudah terdaftar, silakan login");
    }

    const newUser = {
      id: generateId("user"),
      nama,
      email,
      passwordHash: simpleHash(password),
      role,
      createdAt: new Date().toISOString(),
    };

    const created = await this.userRepository.create(newUser);
    return toSafeUser(created);
  }
}
