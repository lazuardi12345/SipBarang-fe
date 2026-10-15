import ApiClient, { API_BASE_URL } from "./client";

function waitForReconnect(signal) {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, 2000);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        resolve();
      },
      { once: true }
    );
  });
}

function dispatchDataChanged(payload) {
  window.dispatchEvent(new CustomEvent("app:data-changed", { detail: payload }));
}

export async function connectRealtime(signal) {
  while (!signal.aborted) {
    const token = ApiClient.getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        signal,
      });
      if (!response.ok || !response.body) {
        throw new Error(`Sambungan realtime gagal (HTTP ${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (!signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const data = frame
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .join("\n");
          if (data) {
            try {
              dispatchDataChanged(JSON.parse(data));
            } catch (error) {
              console.error("Pesan realtime tidak valid:", error);
            }
          }
          boundary = buffer.indexOf("\n\n");
        }
      }
      if (!signal.aborted) await waitForReconnect(signal);
    } catch (error) {
      if (signal.aborted) return;
      console.warn("Sambungan realtime terputus; mencoba menyambung kembali.", error);
      await waitForReconnect(signal);
    }
  }
}
