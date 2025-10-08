import { useState } from "react";
import { Plus, FileText, Syringe, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { AddJournalDialog } from "@/components/forms/AddJournalDialog";
import { AddConditionDialog } from "@/components/forms/AddConditionDialog";
import { AddVaccinationDialog } from "@/components/forms/AddVaccinationDialog";

export function QuickActionFAB() {
  const navigate = useNavigate();
  const [journalOpen, setJournalOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [vaccinationOpen, setVaccinationOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setJournalOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              New Journal Entry
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setVaccinationOpen(true)}>
              <Syringe className="mr-2 h-4 w-4" />
              Schedule Vaccination
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConditionOpen(true)}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Add Condition
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/upcoming')}>
              <Calendar className="mr-2 h-4 w-4" />
              View Upcoming Events
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </>
  );
}
