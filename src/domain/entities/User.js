/**
 * Domain Entity: User
 * Tidak boleh bergantung pada framework/library apapun (pure business object).
 */

export const UserRole = {
  DIREKTUR: "DIREKTUR",
  ADMIN: "ADMIN",
};

export function toSafeUser(user) {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
