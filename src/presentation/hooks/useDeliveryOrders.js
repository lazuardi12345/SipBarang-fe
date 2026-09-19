"use client";

import { useCallback, useEffect, useState } from "react";
import Container from "./../../infrastructure/container";

export function useDeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const all = await Container.deliveryOrderRepository.list();
      // Sort terbaru di atas
      const sorted = [...all].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data pengiriman");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input) => {
      setError(null);
      try {
        await Container.deliveryOrderRepository.create(input);
        await refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal menyimpan surat jalan";
        setError(msg);
        throw e;
      }
    },
    [refresh]
  );

  const setujui = useCallback(
    async (orderId, direkturNama, catatan) => {
      setError(null);
      try {
        await Container.deliveryOrderRepository.approve(orderId, catatan || "");
        await refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal menyetujui pengiriman";
        setError(msg);
        throw e;
      }
    },
    [refresh]
  );

  const tolak = useCallback(
    async (orderId, direkturNama, catatan) => {
      setError(null);
      try {
        await Container.deliveryOrderRepository.reject(orderId, catatan);
        await refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal menolak pengiriman";
        setError(msg);
        throw e;
      }
    },
    [refresh]
  );

  const laporkanTerkirim = useCallback(
    async ({ orderId, namaPenerimaBarang, catatanPelaporan, buktiPengirimanUrl }) => {
      setError(null);
      try {
        await Container.deliveryOrderRepository.reportDelivery({
          orderId,
          namaPenerimaBarang,
          catatanPelaporan,
          buktiPengirimanUrl,
        });
        await refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal melaporkan pengiriman";
        setError(msg);
        throw e;
      }
    },
    [refresh]
  );

  const submitToDirector = useCallback(
    async (orderId, docData = {}) => {
      setError(null);
      try {
        await Container.deliveryOrderRepository.submit(orderId, docData);
        await refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal mengajukan surat jalan ke Direktur";
        setError(msg);
        throw e;
      }
    },
    [refresh]
  );

  const attachDocPerusahaan = useCallback(
    async (orderId, docData) => {
      setError(null);
      try {
        const res = await Container.deliveryOrderRepository.attachDocPerusahaan(orderId, docData);
        await refresh();
        return res;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal menyimpan surat jalan pabrik";
        setError(msg);
        throw e;
      }
    },
    [refresh]
  );

  const konfirmasiTerkirim = useCallback(
    async (orderId, catatan = "") => {
      setError(null);
      try {
        await Container.deliveryOrderRepository.confirmDelivered(orderId, catatan);
        await refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal mengonfirmasi pengiriman selesai";
        setError(msg);
        throw e;
      }
    },
    [refresh]
  );

  const consolidateRun = useCallback(
    async (payload) => {
      setError(null);
      try {
        const res = await Container.deliveryOrderRepository.consolidateRun(payload);
        await refresh();
        return res;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal menyatukan pengiriman ke satu kali jalan";
        setError(msg);
        throw e;
      }
    },
    [refresh]
  );

  return {
    orders,
    loading,
    error,
    refresh,
    create,
    consolidateRun,
    attachDocPerusahaan,
    setujui,
    tolak,
    laporkanTerkirim,
    submitToDirector,
    konfirmasiTerkirim,
  };
}
