import { supabase } from '@/integrations/supabase/client';

export interface HealthRecord {
  vaccinations: any[];
  screenings: any[];
  medications: any[];
  conditions: any[];
  clinicVisits: any[];
}

export const healthRecordsApi = {
  /**
   * Fetch comprehensive health records for the current user
   */
  async getHealthRecords(): Promise<HealthRecord> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const [vaccinations, screenings, medications, conditions, clinicVisits] = await Promise.all([
      supabase
        .from('vaccinations')
        .select('*')
        .eq('patient_id', profile.id)
        .order('scheduled_date', { ascending: false }),
      supabase
        .from('screenings')
        .select('*')
        .eq('patient_id', profile.id)
        .order('scheduled_date', { ascending: false }),
      supabase
        .from('medications')
        .select('*')
        .eq('patient_id', profile.id)
        .eq('is_active', true)
        .order('start_date', { ascending: false }),
      supabase
        .from('conditions')
        .select('*')
        .eq('patient_id', profile.id)
        .eq('is_active', true)
        .order('diagnosed_date', { ascending: false }),
      supabase
        .from('clinic_visits')
        .select('*')
        .eq('patient_id', profile.id)
        .order('visit_date', { ascending: false }),
    ]);

    if (vaccinations.error) throw vaccinations.error;
    if (screenings.error) throw screenings.error;
    if (medications.error) throw medications.error;
    if (conditions.error) throw conditions.error;
    if (clinicVisits.error) throw clinicVisits.error;

    return {
      vaccinations: vaccinations.data || [],
      screenings: screenings.data || [],
      medications: medications.data || [],
      conditions: conditions.data || [],
      clinicVisits: clinicVisits.data || [],
    };
  },

  /**
   * Generate a health report
   */
  async generateReport(
    reportType: 'comprehensive' | 'pregnancy' | 'vaccinations' | 'screenings' | 'medications',
    startDate?: string,
    endDate?: string
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: {
        patientId: profile.id,
        reportType,
        startDate,
        endDate,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Get vaccinations
   */
  async getVaccinations() {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('patient_id', profile.id)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get screenings
   */
  async getScreenings() {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('screenings')
      .select('*')
      .eq('patient_id', profile.id)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get active medications
   */
  async getMedications() {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', profile.id)
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get active conditions
   */
  async getConditions() {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('conditions')
      .select('*')
      .eq('patient_id', profile.id)
      .eq('is_active', true)
      .order('diagnosed_date', { ascending: false });

    if (error) throw error;
    return data;
  },
};
