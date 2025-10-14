// Service Worker for Medication Reminders
const CACHE_NAME = 'medication-reminders-v1';
const DB_NAME = 'MedicationReminderDB';
const DB_VERSION = 1;

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - receive push notifications from server
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  let notificationData = {
    title: '💊 Medication Reminder',
    body: 'Time to take your medication',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    tag: 'medication-reminder',
    requireInteraction: true,
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: `💊 ${payload.medication_name || 'Medication Reminder'}`,
        body: `Time to take ${payload.medication_name || 'your medication'}${payload.dosage ? ` (${payload.dosage})` : ''}`,
        icon: '/placeholder.svg',
        badge: '/placeholder.svg',
        tag: payload.medication_id || 'medication-reminder',
        requireInteraction: true,
        data: payload,
        actions: [
          { action: 'taken', title: 'Mark as Taken' },
          { action: 'snooze', title: 'Snooze 10min' }
        ]
      };
    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  event.notification.close();

  const action = event.action;
  const medicationId = event.notification.data?.medication_id;

  if (action === 'taken') {
    // Log medication as taken
    event.waitUntil(
      logMedicationAction(medicationId, 'taken')
    );
  } else if (action === 'snooze') {
    // Snooze for 10 minutes
    event.waitUntil(
      snoozeMedication(medicationId, 10)
    );
  }

  // Open/focus the app window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow('/medications');
        }
      })
  );
});

// Helper function to log medication action
async function logMedicationAction(medicationId, status) {
  try {
    // Store action in IndexedDB for sync when online
    const db = await openDB();
    const tx = db.transaction('medication_actions', 'readwrite');
    const store = tx.objectStore('medication_actions');
    
    await store.add({
      medication_id: medicationId,
      status: status,
      timestamp: new Date().toISOString(),
      synced: false
    });
    
    console.log('[Service Worker] Medication action logged:', status);
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      await syncMedicationActions();
    }
  } catch (error) {
    console.error('[Service Worker] Error logging medication action:', error);
  }
}

// Helper function to snooze medication
async function snoozeMedication(medicationId, minutes) {
  try {
    const db = await openDB();
    const tx = db.transaction('medications', 'readwrite');
    const store = tx.objectStore('medications');
    
    const medication = await store.get(medicationId);
    if (medication) {
      medication.snooze_until = new Date(Date.now() + minutes * 60000).toISOString();
      await store.put(medication);
      console.log('[Service Worker] Medication snoozed for', minutes, 'minutes');
    }
  } catch (error) {
    console.error('[Service Worker] Error snoozing medication:', error);
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('medications')) {
        db.createObjectStore('medications', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('medication_actions')) {
        const actionStore = db.createObjectStore('medication_actions', { keyPath: 'id', autoIncrement: true });
        actionStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

// Sync medication actions with server
async function syncMedicationActions() {
  try {
    const db = await openDB();
    const tx = db.transaction('medication_actions', 'readonly');
    const store = tx.objectStore('medication_actions');
    const index = store.index('synced');
    
    const unsyncedActions = await index.getAll(false);
    
    if (unsyncedActions.length > 0) {
      // Send to server via message to client
      const clients = await self.clients.matchAll();
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'SYNC_MEDICATION_ACTIONS',
          actions: unsyncedActions
        });
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error syncing medication actions:', error);
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-medication-actions') {
    event.waitUntil(syncMedicationActions());
  }
});

// Message event - receive messages from the app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'UPDATE_MEDICATIONS') {
    event.waitUntil(updateMedicationsCache(event.data.medications));
  }
});

// Update medications in IndexedDB
async function updateMedicationsCache(medications) {
  try {
    const db = await openDB();
    const tx = db.transaction('medications', 'readwrite');
    const store = tx.objectStore('medications');
    
    // Clear existing medications
    await store.clear();
    
    // Add new medications
    for (const med of medications) {
      await store.put(med);
    }
    
    console.log('[Service Worker] Medications cache updated:', medications.length);
  } catch (error) {
    console.error('[Service Worker] Error updating medications cache:', error);
  }
}
