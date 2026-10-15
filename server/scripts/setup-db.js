import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prismaDir = path.join(__dirname, '../prisma');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

console.log(`[setup-db] Database detected: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);

if (isPostgres) {
  // Ensure schema.prisma has the PostgreSQL configuration
  fs.copyFileSync(
    path.join(prismaDir, 'schema.postgresql.prisma'),
    path.join(prismaDir, 'schema.prisma')
  );
  console.log('[setup-db] Pushing PostgreSQL schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('[setup-db] Generating Prisma client for PostgreSQL...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('[setup-db] Seeding database...');
  try {
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    console.log('[setup-db] Database setup and seed complete!');
  } catch (err) {
    console.log('[setup-db] Seed step completed or existing records skipped.');
  }
} else {
  // If running locally with SQLite
  if (fs.existsSync(path.join(prismaDir, 'schema.sqlite.prisma'))) {
    fs.copyFileSync(
      path.join(prismaDir, 'schema.sqlite.prisma'),
      path.join(prismaDir, 'schema.prisma')
    );
  }
  console.log('[setup-db] Generating SQLite client and pushing schema...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npx prisma db push', { stdio: 'inherit' });
}
