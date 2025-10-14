import { openDB, IDBPDatabase } from 'idb';

interface Medication {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  reminder_times: any[];
  notification_enabled: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  snooze_until: string | null;
  last_notified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface MedicationAction {
  id?: number;
  medication_id: string;
  status: 'taken' | 'skipped' | 'missed' | 'snoozed';
  timestamp: string;
  synced: boolean;
  notes?: string;
}

interface SyncQueueItem {
  id?: number;
  type: 'medication' | 'action';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  synced: boolean;
}

const DB_NAME = 'MedicationReminderDB';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

export async function getMedicationDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`);

      // Create medications store
      if (!db.objectStoreNames.contains('medications')) {
        const medicationStore = db.createObjectStore('medications', { keyPath: 'id' });
        medicationStore.createIndex('by-patient', 'patient_id', { unique: false });
        medicationStore.createIndex('by-active', 'is_active', { unique: false });
      }

      // Create medication_actions store
      if (!db.objectStoreNames.contains('medication_actions')) {
        const actionStore = db.createObjectStore('medication_actions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        actionStore.createIndex('by-synced', 'synced', { unique: false });
        actionStore.createIndex('by-medication', 'medication_id', { unique: false });
      }

      // Create sync_queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', {
          keyPath: 'id',
          autoIncrement: true,
        });
        syncStore.createIndex('by-synced', 'synced', { unique: false });
      }
    },
  });

  return dbInstance;
}

// Medication CRUD operations
export async function saveMedicationsToCache(medications: any[]): Promise<void> {
  const db = await getMedicationDB();
  const tx = db.transaction('medications', 'readwrite');
  
  // Clear existing medications
  await tx.store.clear();
  
  // Add new medications
  for (const med of medications) {
    await tx.store.put(med);
  }
  
  await tx.done;
  console.log(`Saved ${medications.length} medications to IndexedDB cache`);
}

export async function getMedicationsFromCache(patientId?: string): Promise<any[]> {
  const db = await getMedicationDB();
  
  if (patientId) {
    return await db.getAllFromIndex('medications', 'by-patient', patientId);
  }
  
  return await db.getAll('medications');
}

export async function getActiveMedicationsFromCache(): Promise<any[]> {
  const db = await getMedicationDB();
  const allMeds = await db.getAll('medications');
  return allMeds.filter(med => med.is_active === true);
}

export async function getMedicationFromCache(id: string): Promise<any | undefined> {
  const db = await getMedicationDB();
  return await db.get('medications', id);
}

export async function updateMedicationInCache(medication: any): Promise<void> {
  const db = await getMedicationDB();
  await db.put('medications', medication);
  console.log('Updated medication in cache:', medication.id);
}

export async function deleteMedicationFromCache(id: string): Promise<void> {
  const db = await getMedicationDB();
  await db.delete('medications', id);
  console.log('Deleted medication from cache:', id);
}

// Medication action operations
export async function logMedicationAction(action: {
  medication_id: string;
  status: 'taken' | 'skipped' | 'missed' | 'snoozed';
  timestamp?: string;
  notes?: string;
}): Promise<any> {
  const db = await getMedicationDB();
  
  const actionRecord = {
    medication_id: action.medication_id,
    status: action.status,
    timestamp: action.timestamp || new Date().toISOString(),
    synced: false,
    notes: action.notes,
  };
  
  const id = await db.add('medication_actions', actionRecord);
  console.log('Logged medication action:', id, actionRecord);
  
  return id;
}

export async function getUnsyncedActions(): Promise<any[]> {
  const db = await getMedicationDB();
  const allActions = await db.getAll('medication_actions');
  return allActions.filter(action => action.synced === false);
}

export async function markActionAsSynced(id: any): Promise<void> {
  const db = await getMedicationDB();
  const action = await db.get('medication_actions', id);
  
  if (action) {
    action.synced = true;
    await db.put('medication_actions', action);
    console.log('Marked action as synced:', id);
  }
}

export async function getActionsByMedication(medicationId: string): Promise<any[]> {
  const db = await getMedicationDB();
  return await db.getAllFromIndex('medication_actions', 'by-medication', medicationId);
}

// Sync queue operations
export async function addToSyncQueue(item: {
  type: 'medication' | 'action';
  operation: 'create' | 'update' | 'delete';
  data: any;
}): Promise<any> {
  const db = await getMedicationDB();
  
  const queueItem = {
    type: item.type,
    operation: item.operation,
    data: item.data,
    timestamp: new Date().toISOString(),
    synced: false,
  };
  
  return await db.add('sync_queue', queueItem);
}

export async function getUnsyncedQueueItems(): Promise<any[]> {
  const db = await getMedicationDB();
  const allItems = await db.getAll('sync_queue');
  return allItems.filter(item => item.synced === false);
}

export async function markQueueItemAsSynced(id: any): Promise<void> {
  const db = await getMedicationDB();
  const item = await db.get('sync_queue', id);
  
  if (item) {
    item.synced = true;
    await db.put('sync_queue', item);
  }
}

export async function clearSyncedQueueItems(): Promise<void> {
  const db = await getMedicationDB();
  const allItems = await db.getAll('sync_queue');
  const syncedItems = allItems.filter(item => item.synced === true);
  
  const tx = db.transaction('sync_queue', 'readwrite');
  for (const item of syncedItems) {
    if (item.id) {
      await tx.store.delete(item.id);
    }
  }
  await tx.done;
  
  console.log(`Cleared ${syncedItems.length} synced queue items`);
}

// Utility functions
export async function clearAllData(): Promise<void> {
  const db = await getMedicationDB();
  
  const tx = db.transaction(['medications', 'medication_actions', 'sync_queue'], 'readwrite');
  await tx.objectStore('medications').clear();
  await tx.objectStore('medication_actions').clear();
  await tx.objectStore('sync_queue').clear();
  await tx.done;
  
  console.log('Cleared all IndexedDB data');
}

export async function getDatabaseStats(): Promise<{
  medications: number;
  actions: number;
  queueItems: number;
}> {
  const db = await getMedicationDB();
  
  return {
    medications: await db.count('medications'),
    actions: await db.count('medication_actions'),
    queueItems: await db.count('sync_queue'),
  };
}
