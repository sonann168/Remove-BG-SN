import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

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
 * Image processing history table
 * Tracks all background removal operations with original and processed image URLs
 */
export const imageHistory = mysqlTable("imageHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Anonymous users get null
  originalImageUrl: text("originalImageUrl").notNull(),
  originalImageKey: varchar("originalImageKey", { length: 255 }).notNull(),
  processedImageUrl: text("processedImageUrl"),
  processedImageKey: varchar("processedImageKey", { length: 255 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  fileSize: int("fileSize"), // Original file size in bytes
  format: varchar("format", { length: 10 }), // png, jpg, jpeg, webp
  processingTime: int("processingTime"), // Time in milliseconds
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ImageHistory = typeof imageHistory.$inferSelect;
export type InsertImageHistory = typeof imageHistory.$inferInsert;

/**
 * API keys table for developer access
 * Tracks API usage and rate limiting
 */
export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  rateLimit: int("rateLimit").default(100).notNull(), // Requests per hour
  requestCount: int("requestCount").default(0).notNull(),
  lastResetAt: timestamp("lastResetAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * API usage tracking table
 * Logs each API request for analytics and billing
 */
export const apiUsage = mysqlTable("apiUsage", {
  id: int("id").autoincrement().primaryKey(),
  apiKeyId: int("apiKeyId").notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: int("statusCode").notNull(),
  responseTime: int("responseTime"), // in milliseconds
  imageProcessed: boolean("imageProcessed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = typeof apiUsage.$inferInsert;
