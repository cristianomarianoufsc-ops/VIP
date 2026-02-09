import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clients table - Clientes dos fotógrafos
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK para users (fotógrafo)
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Galleries table - Galerias de fotos
 */
export const galleries = mysqlTable("galleries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK para users (fotógrafo)
  clientId: int("clientId").notNull(), // FK para clients
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  accessToken: varchar("accessToken", { length: 64 }).notNull().unique(), // Token único para acesso
  expiresAt: timestamp("expiresAt"), // Data de expiração da galeria (opcional)
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Gallery = typeof galleries.$inferSelect;
export type InsertGallery = typeof galleries.$inferInsert;

/**
 * Images table - Imagens das galerias
 */
export const images = mysqlTable("images", {
  id: int("id").autoincrement().primaryKey(),
  galleryId: int("galleryId").notNull(), // FK para galleries
  filename: varchar("filename", { length: 255 }).notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(), // Chave no Supabase Storage
  url: text("url").notNull(), // URL pública da imagem
  thumbnailUrl: text("thumbnailUrl"), // URL da miniatura para Open Graph
  width: int("width"),
  height: int("height"),
  fileSize: int("fileSize"), // Tamanho em bytes
  mimeType: varchar("mimeType", { length: 50 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

/**
 * Gallery Settings table - Configurações de proteção e watermark
 */
export const gallerySettings = mysqlTable("gallerySettings", {
  id: int("id").autoincrement().primaryKey(),
  galleryId: int("galleryId").notNull().unique(), // FK para galleries
  watermarkEnabled: boolean("watermarkEnabled").default(true).notNull(),
  watermarkText: varchar("watermarkText", { length: 255 }).default("© Protected").notNull(),
  watermarkOpacity: decimal("watermarkOpacity", { precision: 3, scale: 2 }).default("0.3").notNull(), // 0.0 - 1.0
  watermarkPosition: mysqlEnum("watermarkPosition", ["top-left", "top-center", "top-right", "center", "bottom-left", "bottom-center", "bottom-right"]).default("bottom-right").notNull(),
  printScreenDetectionEnabled: boolean("printScreenDetectionEnabled").default(true).notNull(),
  rightClickDisabled: boolean("rightClickDisabled").default(true).notNull(),
  downloadDisabled: boolean("downloadDisabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GallerySetting = typeof gallerySettings.$inferSelect;
export type InsertGallerySetting = typeof gallerySettings.$inferInsert;

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  galleries: many(galleries),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  galleries: many(galleries),
}));

export const galleriesRelations = relations(galleries, ({ one, many }) => ({
  user: one(users, { fields: [galleries.userId], references: [users.id] }),
  client: one(clients, { fields: [galleries.clientId], references: [clients.id] }),
  images: many(images),
  settings: one(gallerySettings),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  gallery: one(galleries, { fields: [images.galleryId], references: [galleries.id] }),
}));

export const gallerySettingsRelations = relations(gallerySettings, ({ one }) => ({
  gallery: one(galleries, { fields: [gallerySettings.galleryId], references: [galleries.id] }),
}));