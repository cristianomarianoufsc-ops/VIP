import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Image, Share2, Zap, Shield, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

/**
 * Página inicial - Landing page para o VIP
 */
export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-white">VIP</span>
            <span className="text-sm text-slate-400">Visualizador de Imagens Protegido</span>
          </div>
          <div className="flex gap-3">
            {user ? (
              <>
                <Button variant="outline" onClick={() => setLocation("/admin")}>
                  Painel Admin
                </Button>
                <Button onClick={() => setLocation("/admin")}>
                  Minha Conta
                </Button>
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())}>
                Entrar
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Compartilhe suas fotos com <span className="text-blue-500">segurança total</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Proteja suas imagens profissionais com múltiplas camadas de segurança. Bloqueie PrintScreen, 
              clique direito, download e muito mais. Seus clientes verão as fotos, mas não conseguirão salvá-las.
            </p>
            <div className="flex gap-4">
              {user ? (
                <Button size="lg" onClick={() => setLocation("/admin")} className="bg-blue-600 hover:bg-blue-700">
                  Acessar Painel
                </Button>
              ) : (
                <Button size="lg" onClick={() => (window.location.href = getLoginUrl())} className="bg-blue-600 hover:bg-blue-700">
                  Começar Agora
                </Button>
              )}
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                Ver Demo
              </Button>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-xl opacity-20"></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-lg p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-white">PrintScreen bloqueado</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
                  <Lock className="w-5 h-5 text-green-500" />
                  <span className="text-white">Clique direito desabilitado</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
                  <Eye className="w-5 h-5 text-green-500" />
                  <span className="text-white">Watermark automático</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
                  <Share2 className="w-5 h-5 text-green-500" />
                  <span className="text-white">Links únicos por cliente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Recursos Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Lock className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Proteção Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Múltiplas camadas de proteção contra captura de tela, clique direito e download não autorizado.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Image className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Renderização via Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                As imagens são renderizadas via Canvas, ocultando URLs e dificultando a extração de dados.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Zap className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Watermark Dinâmico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Adicione marca d'água personalizável em qualquer posição da imagem com opacidade ajustável.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Share2 className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Links Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Gere links únicos para cada cliente. Controle acesso e rastreie quem visualizou suas fotos.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Eye className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Detecção de Aba</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Bloqueie automaticamente as imagens quando o cliente trocar de aba ou minimizar a janela.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Shield className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Miniaturas no WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Compartilhe galerias no WhatsApp com miniaturas automáticas para aumentar confiança do cliente.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para proteger suas fotos?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Comece agora e compartilhe suas galerias com total segurança
          </p>
          {user ? (
            <Button size="lg" onClick={() => setLocation("/admin")} className="bg-white text-blue-600 hover:bg-slate-100">
              Ir para o Painel
            </Button>
          ) : (
            <Button size="lg" onClick={() => (window.location.href = getLoginUrl())} className="bg-white text-blue-600 hover:bg-slate-100">
              Entrar Agora
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              <span className="text-white font-semibold">VIP</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 Visualizador de Imagens Protegido. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
