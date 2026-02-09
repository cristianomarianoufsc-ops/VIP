# VIP - Visualizador de Imagens Protegido (Next.js) - TODO

## Fase 1: Arquitetura e Banco de Dados
- [x] Definir arquitetura de banco de dados (clientes, galerias, imagens)
- [x] Migrar esquema Drizzle ORM do projeto antigo
- [x] Criar tabelas: users, clients, galleries, images, gallery_settings

## Fase 2: Integração com Storage
- [x] Configurar variáveis de ambiente Supabase
- [x] Implementar helpers de upload/download com Supabase Storage
- [x] Criar sistema de URLs temporárias para imagens

## Fase 3: Componentes de Proteção
- [x] Migrar Canvas rendering para ocultar URLs de imagens
- [x] Migrar PrintScreenTrap (detecção Windows/Mac)
- [x] Migrar Anti-Blur/Focus com overlay vermelho
- [x] Implementar bloqueio de clique direito e "Salvar como"
- [x] Adicionar detecção de DevTools

## Fase 4: Rotas Dinâmicas e SSR
- [x] Implementar rota dinâmica /gallery/[token] com SSR
- [x] Adicionar meta tags Open Graph (og:image, og:title, og:description)
- [x] Gerar miniaturas automáticas para WhatsApp
- [x] Implementar sistema de tokens de acesso únicos

## Fase 5: Painel Administrativo
- [x] Criar layout do painel /admin
- [x] Implementar CRUD de clientes
- [x] Implementar CRUD de galerias
- [ ] Implementar upload de imagens
- [x] Implementar geração de links de compartilhamento

## Fase 6: Watermark Dinâmico
- [x] Implementar sistema de watermark via Canvas
- [x] Adicionar configurações de watermark (texto, posição, opacidade)
- [x] Integrar watermark no renderizador de imagens

## Fase 7: Testes e Validação
- [ ] Testar proteção de PrintScreen
- [ ] Testar detecção de mudança de aba
- [ ] Testar miniaturas no WhatsApp
- [ ] Testar upload e renderização de imagens
- [ ] Testar geração de links únicos

## Fase 8: Deploy e Finalização
- [ ] Configurar autenticação OAuth para produção
- [ ] Validar fluxo completo end-to-end
- [ ] Preparar documentação
- [ ] Deploy na Netlify

---

## Funcionalidades Concluídas
- [x] Inicializar projeto Next.js com web-db-user scaffold
- [x] Criar esquema de banco de dados completo
- [x] Implementar componentes de proteção (Canvas, PrintScreenTrap, Anti-Blur)
- [x] Criar rota dinâmica de galeria
- [x] Criar painel administrativo
- [x] Implementar sistema de watermark dinâmico
- [x] Criar procedimentos tRPC para gerenciar galerias e clientes
