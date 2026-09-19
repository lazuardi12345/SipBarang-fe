"use client";

import { useCallback, useEffect, useState } from "react";
import Container from "./../../infrastructure/container";

export function useTarif() {
  const [tarifList, setTarifList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTarif = useCallback(async () => {
    try {
      const data = await Container.tarifRepository.list();
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

  return { tarifList, loading };
}
