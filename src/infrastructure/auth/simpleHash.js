/**
 * PERINGATAN: Ini BUKAN hashing yang aman secara kriptografis.
 * Ini hanya simulasi di sisi client supaya app bisa didemokan tanpa backend.
 */
export function simpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash)}_${text.length}`;
}
