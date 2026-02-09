import { useEffect, useCallback } from "react";

interface PrintScreenDetectionOptions {
  onDetected?: () => void;
  enabled?: boolean;
}

/**
 * Hook para detectar tentativas de PrintScreen e atalhos de captura de tela
 * Detecta:
 * - Windows: PrintScreen, Win+Shift+S, Win+Print
 * - Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
 * - Linux: Print, Shift+Print
 */
export function usePrintScreenDetection({
  onDetected,
  enabled = true,
}: PrintScreenDetectionOptions = {}) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const isWindows = /Win/.test(navigator.platform);
      const isLinux = /Linux/.test(navigator.platform);

      // Windows: PrintScreen, Win+Shift+S, Win+Print
      if (isWindows) {
        if (event.key === "PrintScreen") {
          event.preventDefault();
          onDetected?.();
          return;
        }

        // Win+Shift+S (Snip & Sketch)
        if (event.metaKey && event.shiftKey && event.key === "s") {
          event.preventDefault();
          onDetected?.();
          return;
        }

        // Win+Print
        if (event.metaKey && event.key === "PrintScreen") {
          event.preventDefault();
          onDetected?.();
          return;
        }
      }

      // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if (isMac) {
        if (event.metaKey && event.shiftKey) {
          if (event.key === "3" || event.key === "4" || event.key === "5") {
            event.preventDefault();
            onDetected?.();
            return;
          }
        }
      }

      // Linux: Print, Shift+Print
      if (isLinux) {
        if (event.key === "PrintScreen") {
          event.preventDefault();
          onDetected?.();
          return;
        }

        if (event.shiftKey && event.key === "PrintScreen") {
          event.preventDefault();
          onDetected?.();
          return;
        }
      }
    },
    [enabled, onDetected]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [enabled, handleKeyDown]);
}
