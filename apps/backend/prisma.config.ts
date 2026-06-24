import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);
const envPath = resolve(currentDir, '.env');

loadEnv({ path: envPath });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in apps/backend/.env');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
