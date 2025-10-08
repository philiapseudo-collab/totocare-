import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export const useMedications = () => {
  const { profile } = useProfile();
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedications = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("patient_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error("Error fetching medications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();

    // Set up realtime subscription
    const channel = supabase
      .channel("medications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "medications",
          filter: `patient_id=eq.${profile?.id}`,
        },
        () => {
          fetchMedications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return {
    medications,
    loading,
    refetch: fetchMedications,
  };
};
