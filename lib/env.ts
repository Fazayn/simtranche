
import { z } from "zod";

const envSchema = z.object({
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
