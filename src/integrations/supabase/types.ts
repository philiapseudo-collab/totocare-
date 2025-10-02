export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_type: string
          created_at: string
          duration_minutes: number | null
          healthcare_provider_id: string | null
          id: string
          notes: string | null
          patient_id: string
          reminder_sent: boolean | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_type: string
          created_at?: string
          duration_minutes?: number | null
          healthcare_provider_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          reminder_sent?: boolean | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_type?: string
          created_at?: string
          duration_minutes?: number | null
          healthcare_provider_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          reminder_sent?: boolean | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_healthcare_provider_id_fkey"
            columns: ["healthcare_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_visits: {
        Row: {
          blood_pressure: string | null
          created_at: string
          healthcare_provider_id: string | null
          id: string
          next_visit_date: string | null
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
          visit_date: string
          visit_type: string
          weight: number | null
        }
        Insert: {
          blood_pressure?: string | null
          created_at?: string
          healthcare_provider_id?: string | null
          id?: string
          next_visit_date?: string | null
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          visit_date: string
          visit_type: string
          weight?: number | null
        }
        Update: {
          blood_pressure?: string | null
          created_at?: string
          healthcare_provider_id?: string | null
          id?: string
          next_visit_date?: string | null
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          visit_date?: string
          visit_type?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_visits_healthcare_provider_id_fkey"
            columns: ["healthcare_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conditions: {
        Row: {
          condition_name: string
          created_at: string
          diagnosed_date: string | null
          healthcare_provider_id: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          patient_id: string
          severity: Database["public"]["Enums"]["condition_severity"] | null
          treatment: string | null
          updated_at: string
        }
        Insert: {
          condition_name: string
          created_at?: string
          diagnosed_date?: string | null
          healthcare_provider_id?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id: string
          severity?: Database["public"]["Enums"]["condition_severity"] | null
          treatment?: string | null
          updated_at?: string
        }
        Update: {
          condition_name?: string
          created_at?: string
          diagnosed_date?: string | null
          healthcare_provider_id?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id?: string
          severity?: Database["public"]["Enums"]["condition_severity"] | null
          treatment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conditions_healthcare_provider_id_fkey"
            columns: ["healthcare_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conditions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      infants: {
        Row: {
          birth_date: string
          birth_height: number | null
          birth_weight: number | null
          created_at: string
          current_height: number | null
          current_weight: number | null
          first_name: string
          gender: string | null
          id: string
          mother_id: string
          pregnancy_id: string | null
          updated_at: string
        }
        Insert: {
          birth_date: string
          birth_height?: number | null
          birth_weight?: number | null
          created_at?: string
          current_height?: number | null
          current_weight?: number | null
          first_name: string
          gender?: string | null
          id?: string
          mother_id: string
          pregnancy_id?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string
          birth_height?: number | null
          birth_weight?: number | null
          created_at?: string
          current_height?: number | null
          current_weight?: number | null
          first_name?: string
          gender?: string | null
          id?: string
          mother_id?: string
          pregnancy_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "infants_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "infants_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          content: string | null
          created_at: string
          entry_date: string
          entry_type: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          who: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          entry_date?: string
          entry_type: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          who: string
        }
        Update: {
          content?: string | null
          created_at?: string
          entry_date?: string
          entry_type?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          who?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          medication_name: string
          notes: string | null
          patient_id: string
          prescribed_by: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          medication_name: string
          notes?: string | null
          patient_id: string
          prescribed_by?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          medication_name?: string
          notes?: string | null
          patient_id?: string
          prescribed_by?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancies: {
        Row: {
          conception_date: string | null
          created_at: string
          current_trimester: Database["public"]["Enums"]["trimester"] | null
          current_week: number | null
          due_date: string
          id: string
          mother_id: string
          multiparity_count: number | null
          status: Database["public"]["Enums"]["pregnancy_status"]
          updated_at: string
        }
        Insert: {
          conception_date?: string | null
          created_at?: string
          current_trimester?: Database["public"]["Enums"]["trimester"] | null
          current_week?: number | null
          due_date: string
          id?: string
          mother_id: string
          multiparity_count?: number | null
          status?: Database["public"]["Enums"]["pregnancy_status"]
          updated_at?: string
        }
        Update: {
          conception_date?: string | null
          created_at?: string
          current_trimester?: Database["public"]["Enums"]["trimester"] | null
          current_week?: number | null
          due_date?: string
          id?: string
          mother_id?: string
          multiparity_count?: number | null
          status?: Database["public"]["Enums"]["pregnancy_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pregnancies_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          blood_group: string | null
          created_at: string
          current_weight: number | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          healthcare_provider_id: string | null
          id: string
          last_name: string
          phone: string | null
          profile_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          blood_group?: string | null
          created_at?: string
          current_weight?: number | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          healthcare_provider_id?: string | null
          id?: string
          last_name: string
          phone?: string | null
          profile_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          blood_group?: string | null
          created_at?: string
          current_weight?: number | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          healthcare_provider_id?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          profile_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_healthcare_provider_id_fkey"
            columns: ["healthcare_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reproductive_health: {
        Row: {
          created_at: string
          cycle_length: number | null
          flow_intensity: string | null
          id: string
          menstrual_cycle_day: number | null
          mood: string | null
          mother_id: string
          notes: string | null
          record_date: string
          symptoms: string[] | null
          temperature: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_length?: number | null
          flow_intensity?: string | null
          id?: string
          menstrual_cycle_day?: number | null
          mood?: string | null
          mother_id: string
          notes?: string | null
          record_date: string
          symptoms?: string[] | null
          temperature?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_length?: number | null
          flow_intensity?: string | null
          id?: string
          menstrual_cycle_day?: number | null
          mood?: string | null
          mother_id?: string
          notes?: string | null
          record_date?: string
          symptoms?: string[] | null
          temperature?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reproductive_health_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      screenings: {
        Row: {
          completed_date: string | null
          created_at: string
          healthcare_provider_id: string | null
          id: string
          notes: string | null
          patient_id: string
          results: Json | null
          scheduled_date: string
          screening_type: string
          status: Database["public"]["Enums"]["screening_status"]
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          healthcare_provider_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          results?: Json | null
          scheduled_date: string
          screening_type: string
          status?: Database["public"]["Enums"]["screening_status"]
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          healthcare_provider_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          results?: Json | null
          scheduled_date?: string
          screening_type?: string
          status?: Database["public"]["Enums"]["screening_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "screenings_healthcare_provider_id_fkey"
            columns: ["healthcare_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screenings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          administered_date: string | null
          created_at: string
          healthcare_provider_id: string | null
          id: string
          notes: string | null
          patient_id: string
          patient_type: string
          scheduled_date: string
          status: Database["public"]["Enums"]["vaccination_status"]
          updated_at: string
          vaccine_name: string
        }
        Insert: {
          administered_date?: string | null
          created_at?: string
          healthcare_provider_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          patient_type: string
          scheduled_date: string
          status?: Database["public"]["Enums"]["vaccination_status"]
          updated_at?: string
          vaccine_name: string
        }
        Update: {
          administered_date?: string | null
          created_at?: string
          healthcare_provider_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          patient_type?: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["vaccination_status"]
          updated_at?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_healthcare_provider_id_fkey"
            columns: ["healthcare_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status: "scheduled" | "completed" | "cancelled" | "no_show"
      condition_severity: "mild" | "moderate" | "severe"
      pregnancy_status: "pregnant" | "postpartum" | "not_pregnant"
      screening_status: "due" | "completed" | "abnormal" | "normal"
      trimester: "first" | "second" | "third"
      user_role: "mother" | "healthcare_provider" | "admin"
      vaccination_status: "due" | "completed" | "overdue" | "not_applicable"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: ["scheduled", "completed", "cancelled", "no_show"],
      condition_severity: ["mild", "moderate", "severe"],
      pregnancy_status: ["pregnant", "postpartum", "not_pregnant"],
      screening_status: ["due", "completed", "abnormal", "normal"],
      trimester: ["first", "second", "third"],
      user_role: ["mother", "healthcare_provider", "admin"],
      vaccination_status: ["due", "completed", "overdue", "not_applicable"],
    },
  },
} as const
