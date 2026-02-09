import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Painel administrativo para fotógrafos gerenciarem clientes e galerias
 */
export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("galleries");

  // Queries
  const galleriesQuery = trpc.gallery.list.useQuery();
  const clientsQuery = trpc.clients.list.useQuery();

  // Mutations
  const createClientMutation = trpc.clients.create.useMutation();
  const createGalleryMutation = trpc.gallery.create.useMutation();

  // Form states
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryClientId, setNewGalleryClientId] = useState<number | "">("");

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return;

    try {
      await createClientMutation.mutateAsync({
        name: newClientName,
        email: newClientEmail || undefined,
      });

      setNewClientName("");
      setNewClientEmail("");
      clientsQuery.refetch();
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    }
  };

  const handleCreateGallery = async () => {
    if (!newGalleryTitle.trim() || !newGalleryClientId) return;

    try {
      await createGalleryMutation.mutateAsync({
        clientId: newGalleryClientId as number,
        title: newGalleryTitle,
      });

      setNewGalleryTitle("");
      setNewGalleryClientId("");
      galleriesQuery.refetch();
    } catch (error) {
      console.error("Erro ao criar galeria:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Acesso Negado</CardTitle>
            <CardDescription className="text-slate-400">Você precisa estar autenticado para acessar o painel administrativo.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-700 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-sm text-slate-400 mt-1">Bem-vindo, {user.name || user.email}</p>
            </div>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">Sair</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="galleries">Galerias</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
          </TabsList>

          {/* Galerias Tab */}
          <TabsContent value="galleries" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">Minhas Galerias</h2>
                <p className="text-sm text-slate-400">Gerencie suas galerias de fotos protegidas</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Galeria
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Criar Nova Galeria</DialogTitle>
                    <DialogDescription className="text-slate-400">Preencha os dados para criar uma nova galeria de fotos.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gallery-title" className="text-white">Título da Galeria</Label>
                      <Input
                        id="gallery-title"
                        placeholder="Ex: Casamento - João e Maria"
                        value={newGalleryTitle}
                        onChange={e => setNewGalleryTitle(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gallery-client" className="text-white">Cliente</Label>
                      <select
                        id="gallery-client"
                        className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white"
                        value={newGalleryClientId}
                        onChange={e => setNewGalleryClientId(e.target.value ? Number(e.target.value) : "")}
                      >
                        <option value="">Selecione um cliente</option>
                        {clientsQuery.data?.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button onClick={handleCreateGallery} disabled={createGalleryMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                      {createGalleryMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        "Criar Galeria"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {galleriesQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : galleriesQuery.data?.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 text-center">
                  <p className="text-slate-400">Nenhuma galeria criada ainda.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleriesQuery.data?.map(gallery => (
                  <Card key={gallery.id} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">{gallery.title}</CardTitle>
                      <CardDescription className="text-slate-400">{gallery.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-slate-300">
                        <p>
                          <span className="font-semibold text-white">Token:</span> {gallery.accessToken.substring(0, 8)}...
                        </p>
                        <p>
                          <span className="font-semibold text-white">Status:</span> {gallery.isActive ? "✅ Ativa" : "❌ Inativa"}
                        </p>
                        <p>
                          <span className="font-semibold text-white">Criada em:</span> {new Date(gallery.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-white hover:bg-slate-700">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-white hover:bg-slate-700">
                          Compartilhar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Clientes Tab */}
          <TabsContent value="clients" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">Meus Clientes</h2>
                <p className="text-sm text-slate-400">Gerencie seus clientes</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Adicionar Novo Cliente</DialogTitle>
                    <DialogDescription className="text-slate-400">Preencha os dados do novo cliente.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="client-name" className="text-white">Nome</Label>
                      <Input
                        id="client-name"
                        placeholder="Ex: João Silva"
                        value={newClientName}
                        onChange={e => setNewClientName(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-email" className="text-white">Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="joao@example.com"
                        value={newClientEmail}
                        onChange={e => setNewClientEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Button onClick={handleCreateClient} disabled={createClientMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                      {createClientMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        "Adicionar Cliente"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {clientsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : clientsQuery.data?.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 text-center">
                  <p className="text-slate-400">Nenhum cliente cadastrado ainda.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nome</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Telefone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsQuery.data?.map(client => (
                      <tr key={client.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-white">{client.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{client.email || "-"}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{client.phone || "-"}</td>
                        <td className="px-6 py-4 text-sm">
                          <Button variant="outline" size="sm" className="border-slate-600 text-white hover:bg-slate-700">
                            Editar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
