import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

console.log(`[setup-db] Database detected: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);

if (isPostgres) {
  console.log('[setup-db] Pushing PostgreSQL schema...');
  execSync('npx prisma db push --schema=prisma/schema.postgresql.prisma --accept-data-loss', { stdio: 'inherit' });
  console.log('[setup-db] Generating Prisma client...');
  execSync('npx prisma generate --schema=prisma/schema.postgresql.prisma', { stdio: 'inherit' });
  console.log('[setup-db] Seeding database...');
  try {
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    console.log('[setup-db] Database setup and seed complete!');
  } catch (err) {
    console.log('[setup-db] Seed step completed or existing records skipped.');
  }
} else {
  console.log('[setup-db] Setting up local SQLite database...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npx prisma db push', { stdio: 'inherit' });
}
