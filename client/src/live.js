import { useEffect, useRef } from "react";

// Keeps a screen up to date by itself: runs `load` now, every few seconds,
// and straight away when the person comes back to the tab or window.
// Pauses while the tab is hidden. `active` = false stops it (e.g. finished orders).
export function useLive(load, { every = 4000, active = true, deps = [] } = {}) {
    const latest = useRef(load);
    latest.current = load;

    useEffect(() => {
        if (!active) return undefined;
        let busy = false;
        const run = async () => {
            if (busy || document.hidden) return;
            busy = true;
            try { await latest.current(); } catch { /* the screen shows its own errors */ } finally { busy = false; }
        };
        const timer = setInterval(run, every);
        const onBack = () => { if (!document.hidden) run(); };
        document.addEventListener("visibilitychange", onBack);
        window.addEventListener("focus", onBack);
        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", onBack);
            window.removeEventListener("focus", onBack);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, every, ...deps]);
}
