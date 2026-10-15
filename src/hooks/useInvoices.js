import { useCallback, useEffect, useState } from "react";
import { invoiceApi } from "../api/invoices";
import { useRealtimeRefresh } from "./useRealtimeRefresh";

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const all = await invoiceApi.list();
      const sorted = [...all].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInvoices(sorted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat invoice");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);
  useRealtimeRefresh(refresh);

  const generate = useCallback(
    async (input) => {
      setError(null);
      try {
        const invoice = await invoiceApi.create(input);
        await refresh();
        return invoice;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal membuat invoice";
        setError(msg);
        throw e;
      }
    },
    [refresh]
  );

  const updateStatus = useCallback(
    async (invoiceId, status) => {
      setError(null);
      try {
        await invoiceApi.updateStatus(invoiceId, status);
        await refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal memperbarui status invoice";
        setError(msg);
        throw e;
      }
    },
    [refresh]
  );

  return { invoices, loading, error, refresh, generate, updateStatus };
}
