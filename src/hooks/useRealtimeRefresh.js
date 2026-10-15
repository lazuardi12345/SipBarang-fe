import { useEffect } from "react";

export function useRealtimeRefresh(refresh) {
  useEffect(() => {
    const handleDataChanged = () => {
      refresh({ silent: true });
    };
    window.addEventListener("app:data-changed", handleDataChanged);
    return () => window.removeEventListener("app:data-changed", handleDataChanged);
  }, [refresh]);
}
