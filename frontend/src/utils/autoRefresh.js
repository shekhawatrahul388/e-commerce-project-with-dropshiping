import { useEffect, useRef } from "react";

export const DATA_UPDATED_EVENT = "app-data-updated";

export const notifyDataUpdated = () => {
  window.dispatchEvent(new Event(DATA_UPDATED_EVENT));
};

export function useAutoRefresh(refresh, { interval = 30000, enabled = true } = {}) {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return undefined;

    const runRefresh = () => {
      if (document.visibilityState === "visible") {
        refreshRef.current();
      }
    };

    window.addEventListener(DATA_UPDATED_EVENT, runRefresh);
    window.addEventListener("focus", runRefresh);
    document.addEventListener("visibilitychange", runRefresh);

    const timer = window.setInterval(runRefresh, interval);

    return () => {
      window.removeEventListener(DATA_UPDATED_EVENT, runRefresh);
      window.removeEventListener("focus", runRefresh);
      document.removeEventListener("visibilitychange", runRefresh);
      window.clearInterval(timer);
    };
  }, [enabled, interval]);
}
