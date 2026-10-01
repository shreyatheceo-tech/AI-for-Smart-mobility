import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { User, UserPreferences, Journey, PriorityType, TransportMode } from '../types/index.js';

let pgPool: Pool | null = null;
let usePostgres = false;

// Fallback file DB path
const DATA_FILE = path.join(config.dataDir, 'mobimind_db.json');

interface LocalDatabaseState {
  users: User[];
  userPreferences: UserPreferences[];
  journeys: Journey[];
}

let localDb: LocalDatabaseState = {
  users: [],
  userPreferences: [],
  journeys: [],
};

// Save local DB to disk
function saveLocalDb() {
  try {
    if (!fs.existsSync(config.dataDir)) {
      fs.mkdirSync(config.dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save local database:', err);
  }
}

// Load local DB from disk
function loadLocalDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      localDb = JSON.parse(data);
    } else {
      saveLocalDb();
    }
  } catch (err) {
    console.error('[DB] Failed to load local database, initializing fresh:', err);
    saveLocalDb();
  }
}

// Ensure default demo user exists
async function seedDefaultUser() {
  const demoEmail = 'demo@mobimind.ai';
  const existing = await findUserByEmail(demoEmail);
  if (!existing) {
    const passwordHash = await bcrypt.hash('mobimind123', 10);
    const demoUser = await createUser(demoEmail, passwordHash, 'Alex Chen (Urban Commuter)');
    
    // Set default preferences
    await upsertUserPreferences({
      userId: demoUser.id,
      primaryPriority: 'fastest',
      priorityWeights: { time: 0.35, cost: 0.25, co2: 0.2, safety: 0.1, accessibility: 0.1 },
      accessibilityNeeds: [],
      preferredModes: ['metro', 'bus', 'walk', 'multimodal'],
      maxWalkMeters: 1000,
    });
    console.log('[DB] Seeded demo user: demo@mobimind.ai / password: mobimind123');
  }
}

// Initialize database
export async function initDatabase(): Promise<void> {
  if (config.databaseUrl) {
    try {
      console.log('[DB] Connecting to PostgreSQL at configured DATABASE_URL...');
      pgPool = new Pool({
        connectionString: config.databaseUrl,
        ssl: config.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });

      const client = await pgPool.connect();
      console.log('[DB] Connected successfully to PostgreSQL! Running schema migrations...');

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS user_preferences (
          user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          primary_priority TEXT CHECK (primary_priority IN ('fastest', 'cheapest', 'eco', 'safer', 'accessible')),
          priority_weights JSONB DEFAULT '{"time": 0.3, "cost": 0.25, "co2": 0.2, "safety": 0.15, "accessibility": 0.1}',
          accessibility_needs TEXT[],
          preferred_modes TEXT[],
          max_walk_meters INTEGER DEFAULT 800,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS journeys (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          origin TEXT NOT NULL,
          destination TEXT NOT NULL,
          origin_coords JSONB,
          destination_coords JSONB,
          departure_time TIMESTAMPTZ,
          primary_priority TEXT,
          raw_options JSONB,
          ai_recommendation JSONB,
          explanation TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_journeys_user_id ON journeys(user_id);
        CREATE INDEX IF NOT EXISTS idx_journeys_created_at ON journeys(created_at DESC);
      `);

      client.release();
      usePostgres = true;
      console.log('[DB] PostgreSQL schema initialized successfully.');
    } catch (err: any) {
      console.warn('[DB] Could not connect to PostgreSQL:', err.message);
      console.log('[DB] Falling back to high-resilience local JSON storage.');
      usePostgres = false;
      loadLocalDb();
    }
  } else {
    console.log('[DB] DATABASE_URL not set. Running with embedded persistent storage in data/mobimind_db.json.');
    usePostgres = false;
    loadLocalDb();
  }

  await seedDefaultUser();
}

// ----------------- USERS ----------------- //

export async function createUser(email: string, passwordHash: string, fullName: string): Promise<User> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      `INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, password_hash as "passwordHash", full_name as "fullName", created_at as "createdAt", updated_at as "updatedAt"`,
      [id, email.toLowerCase(), passwordHash, fullName, now, now]
    );
    return res.rows[0];
  } else {
    const user: User = {
      id,
      email: email.toLowerCase(),
      fullName,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };
    localDb.users.push(user);
    saveLocalDb();
    return user;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.toLowerCase();
  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      `SELECT id, email, password_hash as "passwordHash", full_name as "fullName", created_at as "createdAt", updated_at as "updatedAt"
       FROM users WHERE email = $1`,
      [normalized]
    );
    return res.rows[0] || null;
  } else {
    return localDb.users.find(u => u.email === normalized) || null;
  }
}

export async function findUserById(id: string): Promise<User | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      `SELECT id, email, password_hash as "passwordHash", full_name as "fullName", created_at as "createdAt", updated_at as "updatedAt"
       FROM users WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  } else {
    return localDb.users.find(u => u.id === id) || null;
  }
}

// ----------------- USER PREFERENCES ----------------- //

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      `SELECT user_id as "userId", primary_priority as "primaryPriority", priority_weights as "priorityWeights",
              accessibility_needs as "accessibilityNeeds", preferred_modes as "preferredModes",
              max_walk_meters as "maxWalkMeters", updated_at as "updatedAt"
       FROM user_preferences WHERE user_id = $1`,
      [userId]
    );
    return res.rows[0] || null;
  } else {
    return localDb.userPreferences.find(p => p.userId === userId) || null;
  }
}

export async function upsertUserPreferences(prefs: UserPreferences): Promise<UserPreferences> {
  const now = new Date().toISOString();
  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      `INSERT INTO user_preferences (user_id, primary_priority, priority_weights, accessibility_needs, preferred_modes, max_walk_meters, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         primary_priority = EXCLUDED.primary_priority,
         priority_weights = EXCLUDED.priority_weights,
         accessibility_needs = EXCLUDED.accessibility_needs,
         preferred_modes = EXCLUDED.preferred_modes,
         max_walk_meters = EXCLUDED.max_walk_meters,
         updated_at = EXCLUDED.updated_at
       RETURNING user_id as "userId", primary_priority as "primaryPriority", priority_weights as "priorityWeights",
                 accessibility_needs as "accessibilityNeeds", preferred_modes as "preferredModes",
                 max_walk_meters as "maxWalkMeters", updated_at as "updatedAt"`,
      [
        prefs.userId,
        prefs.primaryPriority,
        JSON.stringify(prefs.priorityWeights),
        prefs.accessibilityNeeds,
        prefs.preferredModes,
        prefs.maxWalkMeters,
        now,
      ]
    );
    return res.rows[0];
  } else {
    const idx = localDb.userPreferences.findIndex(p => p.userId === prefs.userId);
    const updated = { ...prefs, updatedAt: now };
    if (idx >= 0) {
      localDb.userPreferences[idx] = updated;
    } else {
      localDb.userPreferences.push(updated);
    }
    saveLocalDb();
    return updated;
  }
}

// ----------------- JOURNEYS ----------------- //

export async function createJourney(data: Omit<Journey, 'id' | 'createdAt'>): Promise<Journey> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      `INSERT INTO journeys (id, user_id, origin, destination, origin_coords, destination_coords, departure_time, primary_priority, raw_options, ai_recommendation, explanation, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, user_id as "userId", origin, destination, origin_coords as "originCoords",
                 destination_coords as "destinationCoords", departure_time as "departureTime",
                 primary_priority as "primaryPriority", raw_options as "rawOptions",
                 ai_recommendation as "aiRecommendation", explanation, created_at as "createdAt"`,
      [
        id,
        data.userId || null,
        data.origin,
        data.destination,
        JSON.stringify(data.originCoords || null),
        JSON.stringify(data.destinationCoords || null),
        data.departureTime,
        data.primaryPriority,
        JSON.stringify(data.rawOptions),
        JSON.stringify(data.aiRecommendation),
        data.explanation,
        now,
      ]
    );
    return res.rows[0];
  } else {
    const journey: Journey = {
      id,
      ...data,
      createdAt: now,
    };
    localDb.journeys.unshift(journey);
    saveLocalDb();
    return journey;
  }
}

export async function getJourneysByUserId(userId: string): Promise<Journey[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      `SELECT id, user_id as "userId", origin, destination, origin_coords as "originCoords",
              destination_coords as "destinationCoords", departure_time as "departureTime",
              primary_priority as "primaryPriority", raw_options as "rawOptions",
              ai_recommendation as "aiRecommendation", explanation, created_at as "createdAt"
       FROM journeys WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    return res.rows;
  } else {
    return localDb.journeys.filter(j => j.userId === userId);
  }
}

export async function getJourneyById(id: string, userId?: string): Promise<Journey | null> {
  if (usePostgres && pgPool) {
    const query = userId
      ? `SELECT id, user_id as "userId", origin, destination, origin_coords as "originCoords",
                destination_coords as "destinationCoords", departure_time as "departureTime",
                primary_priority as "primaryPriority", raw_options as "rawOptions",
                ai_recommendation as "aiRecommendation", explanation, created_at as "createdAt"
         FROM journeys WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)`
      : `SELECT id, user_id as "userId", origin, destination, origin_coords as "originCoords",
                destination_coords as "destinationCoords", departure_time as "departureTime",
                primary_priority as "primaryPriority", raw_options as "rawOptions",
                ai_recommendation as "aiRecommendation", explanation, created_at as "createdAt"
         FROM journeys WHERE id = $1`;
    const params = userId ? [id, userId] : [id];
    const res = await pgPool.query(query, params);
    return res.rows[0] || null;
  } else {
    const found = localDb.journeys.find(j => j.id === id);
    if (!found) return null;
    if (userId && found.userId && found.userId !== userId) return null;
    return found;
  }
}

export async function deleteJourney(id: string, userId: string): Promise<boolean> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      `DELETE FROM journeys WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return (res.rowCount ?? 0) > 0;
  } else {
    const initialLen = localDb.journeys.length;
    localDb.journeys = localDb.journeys.filter(j => !(j.id === id && j.userId === userId));
    const changed = localDb.journeys.length !== initialLen;
    if (changed) saveLocalDb();
    return changed;
  }
}
