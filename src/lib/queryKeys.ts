// Centralized query keys for React Query
export const queryKeys = {
  // Auth & Profile
  profile: (userId?: string) => ['profile', userId] as const,
  
  // Medications
  medications: {
    all: ['medications'] as const,
    list: (patientId: string) => ['medications', 'list', patientId] as const,
    detail: (id: string) => ['medications', 'detail', id] as const,
    reminders: (profileId: string) => ['medications', 'reminders', profileId] as const,
    adherence: (patientId: string, range: string) => ['medications', 'adherence', patientId, range] as const,
    actions: (medicationId: string) => ['medications', 'actions', medicationId] as const,
  },
  
  // Health Records
  conditions: {
    all: ['conditions'] as const,
    list: (patientId?: string) => ['conditions', 'list', patientId] as const,
    detail: (id: string) => ['conditions', 'detail', id] as const,
  },
  
  vaccinations: {
    all: ['vaccinations'] as const,
    list: (patientId?: string) => ['vaccinations', 'list', patientId] as const,
    upcoming: (patientId: string) => ['vaccinations', 'upcoming', patientId] as const,
    recommendations: (infantId: string) => ['vaccinations', 'recommendations', infantId] as const,
  },
  
  // Journal
  journal: {
    all: ['journal'] as const,
    list: (userId?: string) => ['journal', 'list', userId] as const,
    detail: (id: string) => ['journal', 'detail', id] as const,
  },
  
  // Pregnancy
  pregnancy: {
    all: ['pregnancy'] as const,
    current: (motherId: string) => ['pregnancy', 'current', motherId] as const,
    analytics: (motherId: string) => ['pregnancy', 'analytics', motherId] as const,
  },
  
  // Pregnancies (alternate naming)
  pregnancies: {
    active: (motherId?: string) => ['pregnancies', 'active', motherId] as const,
  },
  
  // Upcoming Events (consolidated)
  upcomingEvents: (userId?: string) => ['upcomingEvents', userId] as const,
  
  // Analytics
  analytics: {
    health: (profileId: string) => ['analytics', 'health', profileId] as const,
    symptoms: (profileId: string) => ['analytics', 'symptoms', profileId] as const,
  },
  
  // Campaigns
  campaigns: {
    all: ['campaigns'] as const,
    active: ['campaigns', 'active'] as const,
    detail: (id: string) => ['campaigns', 'detail', id] as const,
  },
  
  // Events
  events: {
    upcoming: (profileId: string) => ['events', 'upcoming', profileId] as const,
  },
  
  // Cycle
  cycle: {
    data: (userId: string) => ['cycle', 'data', userId] as const,
    prediction: (userId: string) => ['cycle', 'prediction', userId] as const,
  },

  // Immunization Schedule (static data)
  immunizationSchedule: {
    all: ['immunizationSchedule'] as const,
    list: (patientType?: string) => ['immunizationSchedule', 'list', patientType] as const,
  },
} as const;
