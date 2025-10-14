import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CycleEntry, CycleSettings, CyclePredictions } from '../cycleCalculations';

interface CycleDB extends DBSchema {
  cycles: {
    key: string;
    value: CycleEntry;
    indexes: { 'by-date': string };
  };
  settings: {
    key: string;
    value: CycleSettings;
  };
  predictions: {
    key: string;
    value: CyclePredictions;
  };
}

const DB_NAME = 'nurture-care-cycle-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<CycleDB> | null = null;

async function getDB(): Promise<IDBPDatabase<CycleDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<CycleDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create cycles store
      if (!db.objectStoreNames.contains('cycles')) {
        const cycleStore = db.createObjectStore('cycles', { keyPath: 'id' });
        cycleStore.createIndex('by-date', 'periodStartDate');
      }

      // Create settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }

      // Create predictions store
      if (!db.objectStoreNames.contains('predictions')) {
        db.createObjectStore('predictions');
      }
    },
  });

  return dbInstance;
}

// Cycle entries
export async function saveCycleEntry(entry: CycleEntry): Promise<void> {
  const db = await getDB();
  await db.put('cycles', entry);
}

export async function getAllCycles(): Promise<CycleEntry[]> {
  const db = await getDB();
  return db.getAll('cycles');
}

export async function getCycleById(id: string): Promise<CycleEntry | undefined> {
  const db = await getDB();
  return db.get('cycles', id);
}

export async function deleteCycleEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('cycles', id);
}

export async function updateCycleEntry(id: string, updates: Partial<CycleEntry>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('cycles', id);
  if (existing) {
    await db.put('cycles', { ...existing, ...updates });
  }
}

// Settings
export async function saveSettings(userId: string, settings: CycleSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, userId);
}

export async function getSettings(userId: string): Promise<CycleSettings | undefined> {
  const db = await getDB();
  return db.get('settings', userId);
}

// Predictions
export async function savePredictions(userId: string, predictions: CyclePredictions): Promise<void> {
  const db = await getDB();
  await db.put('predictions', predictions, userId);
}

export async function getPredictions(userId: string): Promise<CyclePredictions | undefined> {
  const db = await getDB();
  return db.get('predictions', userId);
}

// Clear all data
export async function clearAllCycleData(): Promise<void> {
  const db = await getDB();
  await db.clear('cycles');
  await db.clear('settings');
  await db.clear('predictions');
}
