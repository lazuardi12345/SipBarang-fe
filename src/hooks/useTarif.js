import { useCallback, useEffect, useState } from "react";
import { tarifApi } from "../api/tarifs";

export function useTarif() {
  const [tarifList, setTarifList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTarif = useCallback(async () => {
    try {
      const data = await tarifApi.list();
      setTarifList(data);
    } catch (e) {
      console.error("Gagal memuat tarif:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTarif();
  }, [loadTarif]);

  const createTarif = useCallback(async (payload) => {
    const tarif = await tarifApi.create(payload);
    await loadTarif();
    return tarif;
  }, [loadTarif]);

  return { tarifList, loading, createTarif, reload: loadTarif };
}
