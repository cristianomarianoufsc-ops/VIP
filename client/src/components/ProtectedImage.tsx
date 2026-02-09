import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePrintScreenDetection } from "@/hooks/usePrintScreenDetection";
import { useFocusDetection } from "@/hooks/useFocusDetection";

interface ProtectedImageProps {
  src: string;
  alt: string;
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkPosition?: "top-left" | "top-center" | "top-right" | "center" | "bottom-left" | "bottom-center" | "bottom-right";
  className?: string;
  containerClassName?: string;
  disablePrintScreen?: boolean;
  disableRightClick?: boolean;
  disableDownload?: boolean;
  onProtectionViolation?: () => void;
}

/**
 * Componente que renderiza imagens protegidas via Canvas
 * Impede:
 * - PrintScreen
 * - Clique direito e "Salvar como"
 * - Download direto
 * - Visualização quando a aba perde foco
 */
export const ProtectedImage: React.FC<ProtectedImageProps> = ({
  src,
  alt,
  watermarkText = "© Protected",
  watermarkOpacity = 0.3,
  watermarkPosition = "bottom-right",
  className = "",
  containerClassName = "",
  disablePrintScreen = true,
  disableRightClick = true,
  disableDownload = true,
  onProtectionViolation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Renderizar imagem no canvas com watermark
  const renderImageOnCanvas = useCallback(
    (imageUrl: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Definir dimensões do canvas
        canvas.width = img.width;
        canvas.height = img.height;

        // Desenhar imagem
        ctx.drawImage(img, 0, 0);

        // Desenhar watermark
        if (watermarkText) {
          drawWatermark(ctx, canvas.width, canvas.height, watermarkText, watermarkOpacity, watermarkPosition);
        }

        setImageLoaded(true);
      };

      img.onerror = () => {
        console.error("Failed to load image:", imageUrl);
        setImageLoaded(false);
      };

      img.src = imageUrl;
    },
    [watermarkText, watermarkOpacity, watermarkPosition]
  );

  // Desenhar watermark no canvas
  const drawWatermark = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    text: string,
    opacity: number,
    position: string
  ) => {
    const fontSize = Math.max(width, height) * 0.05;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Calcular posição do watermark
    let x = width / 2;
    let y = height / 2;

    switch (position) {
      case "top-left":
        x = fontSize * 2;
        y = fontSize * 1.5;
        break;
      case "top-center":
        x = width / 2;
        y = fontSize * 1.5;
        break;
      case "top-right":
        x = width - fontSize * 2;
        y = fontSize * 1.5;
        break;
      case "center":
        x = width / 2;
        y = height / 2;
        break;
      case "bottom-left":
        x = fontSize * 2;
        y = height - fontSize * 1.5;
        break;
      case "bottom-center":
        x = width / 2;
        y = height - fontSize * 1.5;
        break;
      case "bottom-right":
        x = width - fontSize * 2;
        y = height - fontSize * 1.5;
        break;
    }

    ctx.fillText(text, x, y);
  };

  // Detectar PrintScreen
  usePrintScreenDetection({
    enabled: disablePrintScreen,
    onDetected: () => {
      setShowOverlay(true);
      onProtectionViolation?.();
      setTimeout(() => setShowOverlay(false), 2000);
    },
  });

  // Detectar perda de foco
  useFocusDetection({
    enabled: true,
    onBlur: () => setIsBlurred(true),
    onFocus: () => setIsBlurred(false),
  });

  // Bloquear clique direito
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (disableRightClick) {
        e.preventDefault();
        onProtectionViolation?.();
      }
    },
    [disableRightClick, onProtectionViolation]
  );

  // Bloquear drag (para evitar arrastar para salvar)
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (disableDownload) {
        e.preventDefault();
        onProtectionViolation?.();
      }
    },
    [disableDownload, onProtectionViolation]
  );

  // Renderizar imagem quando src mudar
  useEffect(() => {
    renderImageOnCanvas(src);
  }, [src, renderImageOnCanvas]);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <canvas
        ref={canvasRef}
        className={`w-full h-auto block ${className}`}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        style={{
          filter: isBlurred ? "blur(10px)" : "none",
          cursor: "default",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      />

      {isBlurred && (
        <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-center font-bold text-lg">
            <p>🔒 Imagem protegida</p>
            <p className="text-sm mt-2">Retorne à aba para visualizar</p>
          </div>
        </div>
      )}

      {showOverlay && (
        <div className="absolute inset-0 bg-red-500 bg-opacity-70 flex items-center justify-center z-50 animate-pulse">
          <div className="text-white text-center font-bold text-xl">
            <p>⛔ Captura de tela bloqueada</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtectedImage;
