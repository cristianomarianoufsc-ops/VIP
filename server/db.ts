import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, galleries, images, gallerySettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Gallery-related queries
// ============================================

/**
 * Criar um novo cliente
 */
export async function createClient(data: {
  userId: number;
  name: string;
  email?: string;
  phone?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(clients).values(data);
  return result;
}

/**
 * Obter cliente por ID
 */
export async function getClientById(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Listar clientes de um fotógrafo
 */
export async function getClientsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(clients).where(eq(clients.userId, userId));
}

/**
 * Criar uma nova galeria
 */
export async function createGallery(data: {
  userId: number;
  clientId: number;
  title: string;
  description?: string;
  accessToken: string;
  expiresAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(galleries).values(data);
  return result;
}

/**
 * Obter galeria por token de acesso
 */
export async function getGalleryByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(galleries)
    .where(and(eq(galleries.accessToken, token), eq(galleries.isActive, true)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Obter galeria por ID
 */
export async function getGalleryById(galleryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(galleries).where(eq(galleries.id, galleryId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Listar galerias de um fotógrafo
 */
export async function getGalleriesByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(galleries).where(eq(galleries.userId, userId));
}

/**
 * Listar galerias de um cliente
 */
export async function getGalleriesByClientId(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(galleries).where(eq(galleries.clientId, clientId));
}

/**
 * Adicionar imagem a uma galeria
 */
export async function addImageToGallery(data: {
  galleryId: number;
  filename: string;
  storageKey: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  displayOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(images).values(data);
  return result;
}

/**
 * Obter imagens de uma galeria
 */
export async function getImagesByGalleryId(galleryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(images)
    .where(eq(images.galleryId, galleryId))
    .orderBy(images.displayOrder);
}

/**
 * Obter primeira imagem de uma galeria (para thumbnail do Open Graph)
 */
export async function getFirstImageByGalleryId(galleryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(images)
    .where(eq(images.galleryId, galleryId))
    .orderBy(images.displayOrder)
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Obter configurações de galeria
 */
export async function getGallerySettings(galleryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(gallerySettings)
    .where(eq(gallerySettings.galleryId, galleryId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Criar ou atualizar configurações de galeria
 */
export async function upsertGallerySettings(data: {
  galleryId: number;
  watermarkEnabled?: boolean;
  watermarkText?: string;
  watermarkOpacity?: string;
  watermarkPosition?: string;
  printScreenDetectionEnabled?: boolean;
  rightClickDisabled?: boolean;
  downloadDisabled?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se já existe
  const existing = await getGallerySettings(data.galleryId);

  if (existing) {
    // Atualizar
    const updateData: Record<string, unknown> = {};
    if (data.watermarkEnabled !== undefined) updateData.watermarkEnabled = data.watermarkEnabled;
    if (data.watermarkText !== undefined) updateData.watermarkText = data.watermarkText;
    if (data.watermarkOpacity !== undefined) updateData.watermarkOpacity = data.watermarkOpacity;
    if (data.watermarkPosition !== undefined) updateData.watermarkPosition = data.watermarkPosition;
    if (data.printScreenDetectionEnabled !== undefined) updateData.printScreenDetectionEnabled = data.printScreenDetectionEnabled;
    if (data.rightClickDisabled !== undefined) updateData.rightClickDisabled = data.rightClickDisabled;
    if (data.downloadDisabled !== undefined) updateData.downloadDisabled = data.downloadDisabled;

    await db.update(gallerySettings).set(updateData).where(eq(gallerySettings.galleryId, data.galleryId));
  } else {
    // Criar
    await db.insert(gallerySettings).values({
      galleryId: data.galleryId,
      watermarkEnabled: data.watermarkEnabled ?? true,
      watermarkText: data.watermarkText ?? "© Protected",
      watermarkOpacity: data.watermarkOpacity ?? "0.3",
      watermarkPosition: (data.watermarkPosition as any) ?? "bottom-right",
      printScreenDetectionEnabled: data.printScreenDetectionEnabled ?? true,
      rightClickDisabled: data.rightClickDisabled ?? true,
      downloadDisabled: data.downloadDisabled ?? true,
    });
  }
}

// TODO: add feature queries here as your schema grows.
