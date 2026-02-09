import React, { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProtectedImage from "@/components/ProtectedImage";

/**
 * Página de configurações de galeria
 * Permite configurar watermark, proteção e outras opções
 */
export default function GallerySettings() {
  const params = useParams();
  const galleryId = params?.galleryId ? Number(params.galleryId) : null;

  const galleryQuery = trpc.gallery.getDetails.useQuery(
    { galleryId: galleryId || 0 },
    { enabled: !!galleryId }
  );

  const updateSettingsMutation = trpc.gallery.updateSettings.useMutation();

  // Form states
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkText, setWatermarkText] = useState("© Protected");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkPosition, setWatermarkPosition] = useState("bottom-right");
  const [printScreenDetectionEnabled, setPrintScreenDetectionEnabled] = useState(true);
  const [rightClickDisabled, setRightClickDisabled] = useState(true);
  const [downloadDisabled, setDownloadDisabled] = useState(true);

  // Carregar dados da galeria
  useEffect(() => {
    if (galleryQuery.data?.settings) {
      const settings = galleryQuery.data.settings;
      setWatermarkEnabled(settings.watermarkEnabled ?? true);
      setWatermarkText(settings.watermarkText || "© Protected");
      setWatermarkOpacity(parseFloat(settings.watermarkOpacity || "0.3"));
      setWatermarkPosition(settings.watermarkPosition || "bottom-right");
      setPrintScreenDetectionEnabled(settings.printScreenDetectionEnabled ?? true);
      setRightClickDisabled(settings.rightClickDisabled ?? true);
      setDownloadDisabled(settings.downloadDisabled ?? true);
    }
  }, [galleryQuery.data]);

  const handleSaveSettings = async () => {
    if (!galleryId) return;

    try {
      await updateSettingsMutation.mutateAsync({
        galleryId,
        watermarkEnabled,
        watermarkText,
        watermarkOpacity: watermarkOpacity.toString(),
        watermarkPosition: watermarkPosition as any,
        printScreenDetectionEnabled,
        rightClickDisabled,
        downloadDisabled,
      });

      // Mostrar mensagem de sucesso
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações");
    }
  };

  if (galleryQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!galleryQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Galeria não encontrada</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const firstImage = galleryQuery.data.images?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Configurações da Galeria</h1>
          <p className="text-sm text-gray-600 mt-1">{galleryQuery.data.title}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pré-visualização</CardTitle>
                <CardDescription>Como o watermark aparecerá</CardDescription>
              </CardHeader>
              <CardContent>
                {firstImage ? (
                  <ProtectedImage
                    src={firstImage.url}
                    alt={firstImage.filename}
                    watermarkText={watermarkEnabled ? watermarkText : ""}
                    watermarkOpacity={watermarkOpacity}
                    watermarkPosition={watermarkPosition as any}
                    disablePrintScreen={false}
                    disableRightClick={false}
                    disableDownload={false}
                    containerClassName="rounded-lg overflow-hidden"
                  />
                ) : (
                  <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                    <p className="text-gray-600">Nenhuma imagem na galeria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Watermark Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Watermark</CardTitle>
                <CardDescription>Personalize o watermark das suas imagens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="watermark-enabled"
                    checked={watermarkEnabled}
                    onCheckedChange={(checked) => setWatermarkEnabled(checked === true)}
                  />
                  <Label htmlFor="watermark-enabled" className="cursor-pointer">
                    Ativar Watermark
                  </Label>
                </div>

                {watermarkEnabled && (
                  <>
                    <div>
                      <Label htmlFor="watermark-text">Texto do Watermark</Label>
                      <Input
                        id="watermark-text"
                        value={watermarkText}
                        onChange={e => setWatermarkText(e.target.value)}
                        placeholder="Ex: © 2024 Seu Nome"
                      />
                    </div>

                    <div>
                      <Label htmlFor="watermark-opacity">Opacidade: {(watermarkOpacity * 100).toFixed(0)}%</Label>
                      <Slider
                        id="watermark-opacity"
                        min={0}
                        max={1}
                        step={0.1}
                        value={[watermarkOpacity]}
                        onValueChange={value => setWatermarkOpacity(value[0])}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label htmlFor="watermark-position">Posição</Label>
                      <select
                        id="watermark-position"
                        value={watermarkPosition}
                        onChange={e => setWatermarkPosition(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="top-left">Canto Superior Esquerdo</option>
                        <option value="top-center">Topo Centro</option>
                        <option value="top-right">Canto Superior Direito</option>
                        <option value="center">Centro</option>
                        <option value="bottom-left">Canto Inferior Esquerdo</option>
                        <option value="bottom-center">Rodapé Centro</option>
                        <option value="bottom-right">Canto Inferior Direito</option>
                      </select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Protection Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Proteção</CardTitle>
                <CardDescription>Controle como as imagens são protegidas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="print-screen"
                    checked={printScreenDetectionEnabled}
                    onCheckedChange={(checked) => setPrintScreenDetectionEnabled(checked === true)}
                  />
                  <Label htmlFor="print-screen" className="cursor-pointer">
                    Detectar PrintScreen
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="right-click"
                    checked={rightClickDisabled}
                    onCheckedChange={(checked) => setRightClickDisabled(checked === true)}
                  />
                  <Label htmlFor="right-click" className="cursor-pointer">
                    Bloquear Clique Direito
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="download"
                    checked={downloadDisabled}
                    onCheckedChange={(checked) => setDownloadDisabled(checked === true)}
                  />
                  <Label htmlFor="download" className="cursor-pointer">
                    Bloquear Download
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
              className="w-full"
              size="lg"
            >
              {updateSettingsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configurações"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
