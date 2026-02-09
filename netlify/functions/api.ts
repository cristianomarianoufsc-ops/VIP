import serverless from "serverless-http";
import { createServer } from "http";
import express from "express";
import { getDb, upsertUser, getUserByOpenId } from "../../server/db";
import { appRouter } from "../../server/routers";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createContext } from "../../server/_core/context";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// tRPC handler
app.use(
  "/api/trpc",
  createHTTPHandler({
    router: appRouter,
    createContext,
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

export const handler = serverless(app);
