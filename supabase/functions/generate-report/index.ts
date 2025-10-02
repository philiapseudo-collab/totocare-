import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  patientId: string;
  reportType: 'comprehensive' | 'pregnancy' | 'vaccinations' | 'screenings' | 'medications';
  startDate?: string;
  endDate?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { patientId, reportType, startDate, endDate }: ReportRequest = await req.json();

    console.log(`Generating ${reportType} report for patient ${patientId}`);

    // Get patient profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', patientId)
      .single();

    if (profileError) {
      throw new Error('Patient not found');
    }

    let reportData: any = {
      patient: profile,
      generatedAt: new Date().toISOString(),
      reportType,
      dateRange: { startDate, endDate },
    };

    // Fetch data based on report type
    switch (reportType) {
      case 'comprehensive':
        const [pregnancy, appointments, vaccinations, screenings, medications, conditions] = await Promise.all([
          supabase.from('pregnancies').select('*').eq('mother_id', patientId).maybeSingle(),
          supabase.from('appointments').select('*').eq('patient_id', patientId).order('appointment_date', { ascending: false }),
          supabase.from('vaccinations').select('*').eq('patient_id', patientId).order('scheduled_date', { ascending: false }),
          supabase.from('screenings').select('*').eq('patient_id', patientId).order('scheduled_date', { ascending: false }),
          supabase.from('medications').select('*').eq('patient_id', patientId).eq('is_active', true),
          supabase.from('conditions').select('*').eq('patient_id', patientId).eq('is_active', true),
        ]);

        reportData = {
          ...reportData,
          pregnancy: pregnancy.data,
          appointments: appointments.data || [],
          vaccinations: vaccinations.data || [],
          screenings: screenings.data || [],
          medications: medications.data || [],
          conditions: conditions.data || [],
        };
        break;

      case 'pregnancy':
        const { data: pregnancyData } = await supabase
          .from('pregnancies')
          .select('*')
          .eq('mother_id', patientId)
          .maybeSingle();

        const { data: clinicVisits } = await supabase
          .from('clinic_visits')
          .select('*')
          .eq('patient_id', patientId)
          .order('visit_date', { ascending: false });

        reportData = {
          ...reportData,
          pregnancy: pregnancyData,
          clinicVisits: clinicVisits || [],
        };
        break;

      case 'vaccinations':
        const { data: vaccinationData } = await supabase
          .from('vaccinations')
          .select('*')
          .eq('patient_id', patientId)
          .order('scheduled_date', { ascending: false });

        reportData = {
          ...reportData,
          vaccinations: vaccinationData || [],
        };
        break;

      case 'screenings':
        const { data: screeningData } = await supabase
          .from('screenings')
          .select('*')
          .eq('patient_id', patientId)
          .order('scheduled_date', { ascending: false });

        reportData = {
          ...reportData,
          screenings: screeningData || [],
        };
        break;

      case 'medications':
        const { data: medicationData } = await supabase
          .from('medications')
          .select('*')
          .eq('patient_id', patientId)
          .order('start_date', { ascending: false });

        reportData = {
          ...reportData,
          medications: medicationData || [],
        };
        break;
    }

    console.log(`Report generated successfully for ${reportType}`);

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in generate-report function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
