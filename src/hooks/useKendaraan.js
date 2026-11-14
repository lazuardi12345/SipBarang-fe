import { useCallback, useEffect, useState } from "react";
import { kendaraanApi } from "../api/kendaraan";
import { useRealtimeRefresh } from "./useRealtimeRefresh";

export function useKendaraan() {
  const [kendaraanList, setKendaraanList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadKendaraan = useCallback(async () => {
    try {
      const data = await kendaraanApi.list();
      setKendaraanList(data);
    } catch (e) {
      console.error("Gagal memuat master kendaraan:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKendaraan();
  }, [loadKendaraan]);

  useRealtimeRefresh(loadKendaraan);

  const createKendaraan = useCallback(async (payload) => {
    const data = await kendaraanApi.create(payload);
    await loadKendaraan();
    return data;
  }, [loadKendaraan]);

  const updateKendaraan = useCallback(async (id, payload) => {
    const data = await kendaraanApi.update(id, payload);
    await loadKendaraan();
    return data;
  }, [loadKendaraan]);

  const deleteKendaraan = useCallback(async (id) => {
    const data = await kendaraanApi.remove(id);
    await loadKendaraan();
    return data;
  }, [loadKendaraan]);

  return {
    kendaraanList,
    loading,
    createKendaraan,
    updateKendaraan,
    deleteKendaraan,
    reload: loadKendaraan,
  };
}

