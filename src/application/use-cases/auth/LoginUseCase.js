import { IUserRepository } from "./../../domain/repositories/IUserRepository";
import { toSafeUser, UserWithoutPassword } from "./../../domain/entities/User";
import { simpleHash } from "./../../infrastructure/auth/simpleHash";

export class LoginUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(email, password) {
    if (!email || !password) {
      throw new Error("Email dan password wajib diisi");
    }
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Email atau password salah");
    }
    if (user.passwordHash !== simpleHash(password)) {
      throw new Error("Email atau password salah");
    }
    return toSafeUser(user);
  }
}
