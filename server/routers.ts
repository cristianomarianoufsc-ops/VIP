import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Gallery procedures
  gallery: router({
    /**
     * Obter galeria por token (público)
     */
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const gallery = await db.getGalleryByToken(input.token);
        if (!gallery) {
          throw new Error("Galeria não encontrada ou expirada");
        }

        const images = await db.getImagesByGalleryId(gallery.id);
        const settings = await db.getGallerySettings(gallery.id);

        return {
          id: gallery.id,
          title: gallery.title,
          description: gallery.description,
          images: images.map(img => ({
            id: img.id,
            filename: img.filename,
            url: img.url,
            width: img.width,
            height: img.height,
          })),
          settings,
        };
      }),

    /**
     * Listar galerias do usuário autenticado
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      const galleries = await db.getGalleriesByUserId(ctx.user.id);
      return galleries;
    }),

    /**
     * Criar nova galeria
     */
    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          title: z.string().min(1),
          description: z.string().optional(),
          expiresAt: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const accessToken = nanoid(32);

        await db.createGallery({
          userId: ctx.user.id,
          clientId: input.clientId,
          title: input.title,
          description: input.description,
          accessToken,
          expiresAt: input.expiresAt,
        });

        // Obter a galeria criada
        const galleries = await db.getGalleriesByUserId(ctx.user.id);
        const newGallery = galleries[galleries.length - 1];

        // Criar configurações padrão
        if (newGallery) {
          await db.upsertGallerySettings({
            galleryId: newGallery.id,
          });
        }

        return {
          id: newGallery?.id || 0,
          accessToken,
        };
      }),

    /**
     * Obter detalhes da galeria (apenas para o proprietário)
     */
    getDetails: protectedProcedure
      .input(z.object({ galleryId: z.number() }))
      .query(async ({ input, ctx }) => {
        const gallery = await db.getGalleryById(input.galleryId);

        if (!gallery || gallery.userId !== ctx.user.id) {
          throw new Error("Galeria não encontrada ou acesso negado");
        }

        const images = await db.getImagesByGalleryId(gallery.id);
        const settings = await db.getGallerySettings(gallery.id);

        return {
          ...gallery,
          images,
          settings,
        };
      }),

    /**
     * Atualizar configurações da galeria
     */
    updateSettings: protectedProcedure
      .input(
        z.object({
          galleryId: z.number(),
          watermarkEnabled: z.boolean().optional(),
          watermarkText: z.string().optional(),
          watermarkOpacity: z.string().optional(),
          watermarkPosition: z.enum(["top-left", "top-center", "top-right", "center", "bottom-left", "bottom-center", "bottom-right"]).optional(),
          printScreenDetectionEnabled: z.boolean().optional(),
          rightClickDisabled: z.boolean().optional(),
          downloadDisabled: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const gallery = await db.getGalleryById(input.galleryId);

        if (!gallery || gallery.userId !== ctx.user.id) {
          throw new Error("Galeria não encontrada ou acesso negado");
        }

        const { galleryId, ...settings } = input;
        await db.upsertGallerySettings({
          galleryId,
          ...settings,
        });

        return { success: true };
      }),
  }),

  // Clients procedures
  clients: router({
    /**
     * Listar clientes do usuário autenticado
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getClientsByUserId(ctx.user.id);
    }),

    /**
     * Criar novo cliente
     */
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.createClient({
          userId: ctx.user.id,
          name: input.name,
          email: input.email,
          phone: input.phone,
        });

        // Obter o cliente criado
        const clients = await db.getClientsByUserId(ctx.user.id);
        const newClient = clients[clients.length - 1];

        return {
          id: newClient?.id || 0,
          ...input,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
