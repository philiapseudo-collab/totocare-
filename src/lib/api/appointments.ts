import { supabase } from '@/integrations/supabase/client';

export interface Appointment {
  id: string;
  patient_id: string;
  healthcare_provider_id?: string;
  appointment_date: string;
  appointment_type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  duration_minutes?: number;
  notes?: string;
  reminder_sent?: boolean;
  created_at: string;
  updated_at: string;
}

export const appointmentsApi = {
  /**
   * Fetch all appointments for the current user
   */
  async getAppointments() {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('appointments')
      .select('id, patient_id, healthcare_provider_id, appointment_date, appointment_type, status, duration_minutes, notes, reminder_sent, created_at, updated_at')
      .eq('patient_id', profile.id)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data as Appointment[];
  },

  /**
   * Get a single appointment by ID
   */
  async getAppointment(id: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  /**
   * Create a new appointment
   */
  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  /**
   * Update an existing appointment
   */
  async updateAppointment(id: string, updates: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  /**
   * Delete an appointment
   */
  async deleteAppointment(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(limit = 5) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('appointments')
      .select('id, patient_id, appointment_date, appointment_type, status, notes')
      .eq('patient_id', profile.id)
      .eq('status', 'scheduled')
      .gte('appointment_date', new Date().toISOString())
      .order('appointment_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as Appointment[];
  },

  /**
   * Send appointment reminder
   */
  async sendReminder(appointmentId: string) {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        appointmentId,
        type: 'appointment',
      },
    });

    if (error) throw error;
    return data;
  },
};
