import { useState, useEffect, useCallback } from "react";
import { pengeluaranLainApi } from "../api/pengeluaranLain";

export function usePengeluaranLain(filterParams = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterKey = JSON.stringify(filterParams);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pengeluaranLainApi.list(filterParams);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data pengeluaran lain-lain");
    } finally {
      setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = async (payload) => {
    const res = await pengeluaranLainApi.create(payload);
    await fetchItems();
    return res;
  };

  const updateItem = async (id, payload) => {
    const res = await pengeluaranLainApi.update(id, payload);
    await fetchItems();
    return res;
  };

  const removeItem = async (id) => {
    await pengeluaranLainApi.remove(id);
    await fetchItems();
  };

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
    createItem,
    updateItem,
    removeItem,
  };
}

