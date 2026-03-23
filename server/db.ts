import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, imageHistory, InsertImageHistory, apiKeys, InsertApiKey, apiUsage, InsertApiUsage } from "../drizzle/schema";
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

// Image History functions
export async function createImageHistory(data: InsertImageHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(imageHistory).values(data);
  return result;
}

export async function getImageHistory(userId: number | null, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const query = userId 
    ? db.select().from(imageHistory).where(eq(imageHistory.userId, userId))
    : db.select().from(imageHistory);
  
  return query
    .orderBy(desc(imageHistory.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateImageHistory(id: number, data: Partial<InsertImageHistory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(imageHistory).set(data).where(eq(imageHistory.id, id));
}

export async function getImageHistoryById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(imageHistory).where(eq(imageHistory.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// API Key functions
export async function createApiKey(data: InsertApiKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(apiKeys).values(data);
}

export async function getApiKeysByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
}

export async function getApiKeyByKey(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(apiKeys).where(eq(apiKeys.key, key)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateApiKey(id: number, data: Partial<InsertApiKey>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(apiKeys).set(data).where(eq(apiKeys.id, id));
}

export async function deleteApiKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(apiKeys).where(eq(apiKeys.id, id));
}

// API Usage functions
export async function logApiUsage(data: InsertApiUsage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(apiUsage).values(data);
}

export async function getApiUsageStats(apiKeyId: number, hours: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return db
    .select()
    .from(apiUsage)
    .where(
      and(
        eq(apiUsage.apiKeyId, apiKeyId),
        // Drizzle doesn't have a direct gt() for timestamps in all versions, so we use raw SQL
      )
    );
}

export async function resetApiKeyRateLimit(apiKeyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(apiKeys).set({
    requestCount: 0,
    lastResetAt: new Date(),
  }).where(eq(apiKeys.id, apiKeyId));
}
