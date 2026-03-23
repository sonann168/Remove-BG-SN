import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createImageHistory, 
  getImageHistory, 
  updateImageHistory, 
  getImageHistoryById,
  createApiKey,
  getApiKeysByUserId,
  getApiKeyByKey,
  updateApiKey,
  deleteApiKey,
} from "./db";
import { generateImage } from "./_core/imageGeneration";
import { storagePut, storageGet } from "./storage";
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

  // Image Processing Router
  image: router({
    // Upload original image to S3
    uploadOriginal: publicProcedure
      .input(z.object({
        base64Data: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Convert base64 to buffer
          const base64String = input.base64Data.split(',')[1] || input.base64Data;
          const buffer = Buffer.from(base64String, 'base64');
          
          // Upload to S3
          const uploadKey = `uploads/${nanoid()}`;
          const result = await storagePut(uploadKey, buffer, input.mimeType);
          
          return {
            success: true,
            url: result.url,
            key: result.key,
          };
        } catch (error) {
          console.error('[Image Upload] Error:', error);
          throw new Error('Failed to upload image');
        }
      }),

    // Process image to remove background
    removeBackground: publicProcedure
      .input(z.object({
        imageUrl: z.string().url(),
        imageKey: z.string(),
        format: z.enum(['png', 'jpg']).default('png'),
        mimeType: z.string().default('image/jpeg'),
      }))
      .mutation(async ({ input }) => {
        try {
          const startTime = Date.now();
          
          // Create history record
          const historyRecords = await createImageHistory({
            userId: 0, // Anonymous user
            originalImageUrl: input.imageUrl,
            originalImageKey: input.imageKey,
            status: 'processing',
            format: input.format,
          });

          // Get the ID from the first record or use a placeholder
          let historyId = 0;
          if (Array.isArray(historyRecords) && historyRecords.length > 0) {
            historyId = (historyRecords[0] as any).id || 0;
          }

          try {
            // Call image generation API with background removal prompt
            const result = await generateImage({
              prompt: 'Remove the background from this image, make it transparent. Keep the subject in focus.',
              originalImages: [{
                url: input.imageUrl,
                mimeType: input.mimeType,
              }],
            });

            // Upload processed image to S3
            const processedImageKey = `processed/${nanoid()}.${input.format}`;
            const mimeType = input.format === 'png' ? 'image/png' : 'image/jpeg';
            
            // Fetch the processed image and upload it
            if (!result.url) throw new Error('No processed image URL returned');
            const response = await fetch(result.url);
            const buffer = await response.arrayBuffer();
            
            const uploadResult = await storagePut(
              processedImageKey,
              new Uint8Array(buffer),
              mimeType
            );

            const processingTime = Date.now() - startTime;

            // Update history record with success
            await updateImageHistory(historyId, {
              processedImageUrl: uploadResult.url,
              processedImageKey: uploadResult.key,
              status: 'completed',
              processingTime,
            });

            return {
              success: true,
              historyId,
              processedImageUrl: uploadResult.url,
              processingTime,
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            // Update history record with failure
            await updateImageHistory(historyId, {
              status: 'failed',
              errorMessage,
            });

            throw error;
          }
        } catch (error) {
          console.error('[Image Processing] Error:', error);
          throw new Error('Failed to process image');
        }
      }),

    // Get image history
    getHistory: publicProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        try {
          const history = await getImageHistory(null, input.limit, input.offset);
          return history;
        } catch (error) {
          console.error('[Image History] Error:', error);
          return [];
        }
      }),

    // Get single image history
    getHistoryById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const record = await getImageHistoryById(input.id);
          return record;
        } catch (error) {
          console.error('[Image History] Error:', error);
          return null;
        }
      }),

    // Generate download URL for processed image
    getDownloadUrl: publicProcedure
      .input(z.object({
        imageKey: z.string(),
        expiresIn: z.number().default(3600),
      }))
      .query(async ({ input }) => {
        try {
          const result = await storageGet(input.imageKey);
          return result;
        } catch (error) {
          console.error('[Download] Error:', error);
          throw new Error('Failed to generate download URL');
        }
      }),
  }),

  // API Key Management Router
  apiKey: router({
    // Create new API key
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        rateLimit: z.number().default(100),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const key = `sk_${nanoid(32)}`;
          
          const result = await createApiKey({
            userId: ctx.user.id,
            key,
            name: input.name,
            rateLimit: input.rateLimit,
          });

          let keyId = 0;
          if (Array.isArray(result) && result.length > 0) {
            keyId = (result[0] as any).id || 0;
          }

          return {
            id: keyId,
            key,
            name: input.name,
            rateLimit: input.rateLimit,
          };
        } catch (error) {
          console.error('[API Key] Error:', error);
          throw new Error('Failed to create API key');
        }
      }),

    // Get user's API keys
    list: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const keys = await getApiKeysByUserId(ctx.user.id);
          // Don't return full key values for security
          return keys.map(k => ({
            id: k.id,
            name: k.name,
            key: `${k.key.substring(0, 10)}...${k.key.substring(k.key.length - 4)}`,
            isActive: k.isActive,
            rateLimit: k.rateLimit,
            requestCount: k.requestCount,
            createdAt: k.createdAt,
          }));
        } catch (error) {
          console.error('[API Key] Error:', error);
          return [];
        }
      }),

    // Revoke API key
    revoke: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          await deleteApiKey(input.id);
          return { success: true };
        } catch (error) {
          console.error('[API Key] Error:', error);
          throw new Error('Failed to revoke API key');
        }
      }),

    // Regenerate API key
    regenerate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const newKey = `sk_${nanoid(32)}`;
          
          await updateApiKey(input.id, { key: newKey });

          return {
            id: input.id,
            key: newKey,
          };
        } catch (error) {
          console.error('[API Key] Error:', error);
          throw new Error('Failed to regenerate API key');
        }
      }),
  }),

  // Public API Router (for developers)
  publicApi: router({
    // Remove background via API
    removeBackground: publicProcedure
      .input(z.object({
        apiKey: z.string(),
        imageUrl: z.string().url(),
        format: z.enum(['png', 'jpg']).default('png'),
      }))
      .mutation(async ({ input }) => {
        try {
          // Verify API key
          const apiKey = await getApiKeyByKey(input.apiKey);
          
          if (!apiKey || !apiKey.isActive) {
            throw new Error('Invalid or inactive API key');
          }

          // Check rate limit
          const now = new Date();
          const lastReset = new Date(apiKey.lastResetAt);
          const hoursPassed = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

          if (hoursPassed >= 1) {
            // Reset counter
            await updateApiKey(apiKey.id, {
              requestCount: 0,
              lastResetAt: now,
            });
          } else if (apiKey.requestCount >= apiKey.rateLimit) {
            throw new Error('Rate limit exceeded');
          }

          // Increment request count
          await updateApiKey(apiKey.id, {
            requestCount: apiKey.requestCount + 1,
          });

          // Process image (same as user endpoint)
          const startTime = Date.now();
          
          // Determine mime type from format
          const mimeType = input.format === 'png' ? 'image/png' : 'image/jpeg';
          
          const result = await generateImage({
            prompt: 'Remove the background from this image, make it transparent. Keep the subject in focus.',
            originalImages: [{
              url: input.imageUrl,
              mimeType,
            }],
          });

          if (!result.url) throw new Error('No processed image URL returned');

          const processedImageKey = `api-processed/${nanoid()}.${input.format}`;
          const processingMimeType = input.format === 'png' ? 'image/png' : 'image/jpeg';
          
          const response = await fetch(result.url);
          const buffer = await response.arrayBuffer();
          
          const uploadResult = await storagePut(
            processedImageKey,
            new Uint8Array(buffer),
            processingMimeType
          );

          const processingTime = Date.now() - startTime;

          return {
            success: true,
            processedImageUrl: uploadResult.url,
            processingTime,
          };
        } catch (error) {
          console.error('[Public API] Error:', error);
          throw new Error(error instanceof Error ? error.message : 'Failed to process image');
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
