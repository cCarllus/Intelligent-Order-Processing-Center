import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_PATH: z.string().default('./data/orders.db'),
});

const parsed = envSchema.parse(process.env);

export const env = {
  port: parsed.PORT,
  frontendUrl: parsed.FRONTEND_URL,
  databasePath: path.resolve(process.cwd(), parsed.DATABASE_PATH),
};
