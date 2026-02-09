import { useEffect, useCallback } from "react";

interface FocusDetectionOptions {
  onBlur?: () => void;
  onFocus?: () => void;
  enabled?: boolean;
}

/**
 * Hook para detectar quando a janela perde foco ou a aba é trocada
 * Útil para bloquear visualização de imagens protegidas
 */
export function useFocusDetection({
  onBlur,
  onFocus,
  enabled = true,
}: FocusDetectionOptions = {}) {
  const handleBlur = useCallback(() => {
    if (!enabled) return;
    onBlur?.();
  }, [enabled, onBlur]);

  const handleFocus = useCallback(() => {
    if (!enabled) return;
    onFocus?.();
  }, [enabled, onFocus]);

  const handleVisibilityChange = useCallback(() => {
    if (!enabled) return;

    if (document.hidden) {
      onBlur?.();
    } else {
      onFocus?.();
    }
  }, [enabled, onBlur, onFocus]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, handleBlur, handleFocus, handleVisibilityChange]);
}
