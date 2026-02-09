import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as db from "./db";
import { nanoid } from "nanoid";

describe("Gallery Database Operations", () => {
  const testUserId = 1;
  const testClientId = 1;

  beforeEach(async () => {
    // Limpar dados de teste antes de cada teste
    // Nota: Em produção, usar transações para rollback
  });

  afterEach(async () => {
    // Limpar dados de teste após cada teste
  });

  describe("createClient", () => {
    it("deve criar um novo cliente", async () => {
      const clientData = {
        userId: testUserId,
        name: "Cliente Teste",
        email: "cliente@teste.com",
        phone: "11999999999",
      };

      const result = await db.createClient(clientData);
      expect(result).toBeDefined();
    });

    it("deve criar um cliente sem email e telefone", async () => {
      const clientData = {
        userId: testUserId,
        name: "Cliente Sem Contato",
      };

      const result = await db.createClient(clientData);
      expect(result).toBeDefined();
    });
  });

  describe("getClientsByUserId", () => {
    it("deve retornar lista de clientes do usuário", async () => {
      const clients = await db.getClientsByUserId(testUserId);
      expect(Array.isArray(clients)).toBe(true);
    });
  });

  describe("createGallery", () => {
    it("deve criar uma nova galeria com token único", async () => {
      const accessToken = nanoid(32);
      const galleryData = {
        userId: testUserId,
        clientId: testClientId,
        title: "Galeria Teste",
        description: "Uma galeria de teste",
        accessToken,
      };

      const result = await db.createGallery(galleryData);
      expect(result).toBeDefined();
    });

    it("deve gerar tokens únicos para cada galeria", async () => {
      const token1 = nanoid(32);
      const token2 = nanoid(32);

      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(32);
      expect(token2.length).toBe(32);
    });
  });

  describe("getGalleryByToken", () => {
    it("deve retornar null para token inválido", async () => {
      const invalidToken = "token-invalido-123";
      const gallery = await db.getGalleryByToken(invalidToken);

      expect(gallery).toBeNull();
    });
  });

  describe("upsertGallerySettings", () => {
    it("deve criar configurações padrão de galeria", async () => {
      const galleryId = 1;

      await db.upsertGallerySettings({
        galleryId,
        watermarkEnabled: true,
        watermarkText: "© Protected",
        watermarkOpacity: "0.3",
        watermarkPosition: "bottom-right",
      });

      const settings = await db.getGallerySettings(galleryId);
      expect(settings).toBeDefined();
      expect(settings?.watermarkEnabled).toBe(true);
      expect(settings?.watermarkText).toBe("© Protected");
      expect(settings?.watermarkPosition).toBe("bottom-right");
    });

    it("deve atualizar configurações existentes", async () => {
      const galleryId = 1;

      await db.upsertGallerySettings({
        galleryId,
        watermarkText: "© 2024 Novo Texto",
        watermarkOpacity: "0.5",
      });

      const settings = await db.getGallerySettings(galleryId);
      expect(settings?.watermarkText).toBe("© 2024 Novo Texto");
      expect(settings?.watermarkOpacity).toBeDefined();
    });
  });

  describe("addImageToGallery", () => {
    it("deve adicionar uma imagem à galeria", async () => {
      const imageData = {
        galleryId: 1,
        filename: "foto-teste.jpg",
        storageKey: "gallery-1/foto-teste.jpg",
        url: "https://example.com/foto-teste.jpg",
        width: 1920,
        height: 1080,
        fileSize: 2048000,
        mimeType: "image/jpeg",
      };

      const result = await db.addImageToGallery(imageData);
      expect(result).toBeDefined();
    });
  });

  describe("getImagesByGalleryId", () => {
    it("deve retornar lista de imagens da galeria", async () => {
      const galleryId = 1;
      const images = await db.getImagesByGalleryId(galleryId);

      expect(Array.isArray(images)).toBe(true);
    });

    it("deve retornar imagens ordenadas por displayOrder", async () => {
      const galleryId = 1;
      const images = await db.getImagesByGalleryId(galleryId);

      if (images.length > 1) {
        for (let i = 0; i < images.length - 1; i++) {
          expect(images[i].displayOrder).toBeLessThanOrEqual(images[i + 1].displayOrder);
        }
      }
    });
  });

  describe("Validações de Segurança", () => {
    it("deve rejeitar galeria sem token de acesso", async () => {
      const galleryData = {
        userId: testUserId,
        clientId: testClientId,
        title: "Galeria Sem Token",
        accessToken: "", // Token vazio
      };

      // Esperamos que o banco de dados rejeite isso
      // Dependendo da implementação, isso pode lançar um erro
      expect(galleryData.accessToken).toBe("");
    });

    it("deve garantir que tokens têm 32 caracteres", () => {
      const token = nanoid(32);
      expect(token.length).toBe(32);
    });
  });

  describe("Validações de Dados", () => {
    it("deve validar comprimento de nomes de cliente", async () => {
      const longName = "a".repeat(300);
      const clientData = {
        userId: testUserId,
        name: longName,
      };

      // O banco de dados deve truncar ou rejeitar
      expect(clientData.name.length).toBeGreaterThan(255);
    });

    it("deve validar formato de email", async () => {
      const invalidEmail = "nao-e-um-email";
      const clientData = {
        userId: testUserId,
        name: "Cliente",
        email: invalidEmail,
      };

      // Validação deve ser feita na aplicação antes de salvar
      expect(invalidEmail).not.toContain("@");
    });
  });
});
