import React, { useState, useEffect } from "react";
import { useParams } from "wouter";
import ProtectedImage from "@/components/ProtectedImage";
import { trpc } from "@/lib/trpc";
import { Loader2, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GalleryImage {
  id: number;
  filename: string;
  url: string;
  width?: number;
  height?: number;
}

interface GalleryData {
  id: number;
  title: string;
  description?: string;
  images: GalleryImage[];
  settings?: {
    watermarkEnabled?: boolean;
    watermarkText?: string;
    watermarkOpacity?: string;
    watermarkPosition?: string;
    printScreenDetectionEnabled?: boolean;
    rightClickDisabled?: boolean;
    downloadDisabled?: boolean;
  };
}

/**
 * Página de visualização de galeria protegida
 * Renderiza imagens com proteção contra PrintScreen, clique direito e download
 */
export default function GalleryView() {
  const params = useParams();
  const token = params?.token as string;

  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Buscar dados da galeria
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/trpc/gallery.getByToken?input=${JSON.stringify({ token })}`);
        if (!response.ok) {
          throw new Error("Galeria não encontrada");
        }

        const data = await response.json();
        setGallery(data.result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar galeria");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchGallery();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-lg">Carregando galeria...</p>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="bg-slate-800 border-slate-700 p-8 max-w-md">
          <div className="text-center">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Galeria Não Encontrada</h1>
            <p className="text-slate-400">{error || "A galeria que você está procurando não existe ou expirou."}</p>
          </div>
        </Card>
      </div>
    );
  }

  const currentImage = gallery.images[selectedImageIndex];
  const hasMultipleImages = gallery.images.length > 1;

  const handlePrevious = () => {
    setSelectedImageIndex(prev => (prev === 0 ? gallery.images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex(prev => (prev === gallery.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-700 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{gallery.title}</h1>
              {gallery.description && <p className="text-slate-400 text-sm mt-1">{gallery.description}</p>}
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">
                Imagem {selectedImageIndex + 1} de {gallery.images.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Image Viewer */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="relative bg-black aspect-video flex items-center justify-center">
                {currentImage ? (
                  <ProtectedImage
                    src={currentImage.url}
                    alt={currentImage.filename}
                    watermarkText={gallery.settings?.watermarkEnabled ? gallery.settings?.watermarkText : ""}
                    watermarkOpacity={parseFloat(gallery.settings?.watermarkOpacity || "0.3")}
                    watermarkPosition={(gallery.settings?.watermarkPosition || "bottom-right") as any}
                    disablePrintScreen={gallery.settings?.printScreenDetectionEnabled ?? true}
                    disableRightClick={gallery.settings?.rightClickDisabled ?? true}
                    disableDownload={gallery.settings?.downloadDisabled ?? true}
                    containerClassName="w-full h-full"
                  />
                ) : (
                  <p className="text-slate-400">Nenhuma imagem disponível</p>
                )}
              </div>

              {/* Navigation Controls */}
              {hasMultipleImages && (
                <div className="flex items-center justify-between p-4 bg-slate-700/50 border-t border-slate-700">
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>

                  <div className="flex gap-1 flex-wrap justify-center flex-1 mx-4">
                    {gallery.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === selectedImageIndex ? "bg-blue-500" : "bg-slate-500 hover:bg-slate-400"
                        }`}
                        aria-label={`Ir para imagem ${index + 1}`}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={handleNext}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </Card>

            {/* Image Info */}
            <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-slate-300 text-sm">
                <span className="font-semibold text-white">Arquivo:</span> {currentImage?.filename}
              </p>
              {currentImage?.width && currentImage?.height && (
                <p className="text-slate-300 text-sm mt-2">
                  <span className="font-semibold text-white">Dimensões:</span> {currentImage.width} x {currentImage.height}px
                </p>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <h2 className="text-white font-semibold mb-4">Miniaturas</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {gallery.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex
                        ? "border-blue-500 ring-2 ring-blue-500"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Security Info */}
            <div className="mt-4 bg-blue-900/30 border border-blue-800 rounded-lg p-4">
              <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Proteção Ativa
              </h3>
              <ul className="text-blue-200 text-sm space-y-1">
                {gallery.settings?.printScreenDetectionEnabled && <li>✓ PrintScreen bloqueado</li>}
                {gallery.settings?.rightClickDisabled && <li>✓ Clique direito desabilitado</li>}
                {gallery.settings?.downloadDisabled && <li>✓ Download protegido</li>}
                {gallery.settings?.watermarkEnabled && <li>✓ Watermark ativo</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
