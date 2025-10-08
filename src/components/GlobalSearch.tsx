import { useState, useEffect } from "react";
import { Search, FileText, Calendar, AlertCircle, Syringe } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useConditions } from "@/hooks/useConditions";
import { useVaccinations } from "@/hooks/useVaccinations";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { entries } = useJournalEntries();
  const { conditions } = useConditions();
  const { vaccinations } = useVaccinations();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-muted/50 rounded-md transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search journal, conditions, vaccinations..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {entries.length > 0 && (
            <CommandGroup heading="Journal Entries">
              {entries.slice(0, 5).map((entry) => (
                <CommandItem
                  key={entry.id}
                  onSelect={() => {
                    navigate('/journal');
                    setOpen(false);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{entry.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {conditions.length > 0 && (
            <CommandGroup heading="Conditions">
              {conditions.filter(c => c.is_active).slice(0, 3).map((condition) => (
                <CommandItem
                  key={condition.id}
                  onSelect={() => {
                    navigate('/conditions');
                    setOpen(false);
                  }}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span>{condition.condition_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {vaccinations.length > 0 && (
            <CommandGroup heading="Vaccinations">
              {vaccinations.slice(0, 3).map((vaccine) => (
                <CommandItem
                  key={vaccine.id}
                  onSelect={() => {
                    navigate('/vaccinations');
                    setOpen(false);
                  }}
                >
                  <Syringe className="mr-2 h-4 w-4" />
                  <span>{vaccine.vaccine_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => { navigate('/journal'); setOpen(false); }}>
              <FileText className="mr-2 h-4 w-4" />
              Add Journal Entry
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/upcoming'); setOpen(false); }}>
              <Calendar className="mr-2 h-4 w-4" />
              View Upcoming Events
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/vaccinations'); setOpen(false); }}>
              <Syringe className="mr-2 h-4 w-4" />
              Schedule Vaccination
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
