import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { initialSeedData } from './seedData';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export let pool: Pool | null = null;
export let isUsingPostgres = false;

// In-Memory store for offline fallback / rapid local testing
export const memoryStore = {
  users: [...initialSeedData.users],
  member_profiles: [...initialSeedData.member_profiles],
  family_details: [...initialSeedData.family_details],
  matrimony_profiles: [...initialSeedData.matrimony_profiles],
  matrimony_interests: [...initialSeedData.matrimony_interests],
  events: [...initialSeedData.events],
  event_rsvps: [...initialSeedData.event_rsvps],
  announcements: [...initialSeedData.announcements],
  funds: [...initialSeedData.funds],
  donations: [...initialSeedData.donations],
  expenses: [...initialSeedData.expenses],
  businesses: [...initialSeedData.businesses],
  blood_donors: [...initialSeedData.blood_donors],
  education_careers: [...initialSeedData.education_careers],
  temple_directory: [...initialSeedData.temple_directory],
  committee_members: [...initialSeedData.committee_members],
  audit_logs: [...initialSeedData.audit_logs],
};

export async function initDatabase() {
  if (connectionString && connectionString.startsWith('postgres')) {
    try {
      console.log('Connecting to PostgreSQL database...');
      pool = new Pool({
        connectionString,
        ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
      });

      // Test connection
      const client = await pool.connect();
      console.log('PostgreSQL connected successfully.');

      // Run schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('PostgreSQL schema applied / verified.');
      }
      client.release();
      isUsingPostgres = true;
    } catch (err: any) {
      console.warn('PostgreSQL connection error, falling back to embedded memory store:', err.message);
      isUsingPostgres = false;
    }
  } else {
    console.log('No DATABASE_URL configured. Running with embedded in-memory database store (100% functional with full seed data).');
    isUsingPostgres = false;
  }
}

// Universal query runner helper
export async function query(text: string, params?: any[]) {
  if (isUsingPostgres && pool) {
    return pool.query(text, params);
  }
  return null;
}
