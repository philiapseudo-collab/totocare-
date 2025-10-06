import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VaccineSchedule {
  vaccine: string;
  diseases: string[];
  dosage: string;
  numberOfDoses: number;
  route: string;
  ageOfAdministration: string[];
}

const kenyaVaccinationSchedule: VaccineSchedule[] = [
  {
    vaccine: "BCG",
    diseases: ["Tuberculosis"],
    dosage: "0.05 ml",
    numberOfDoses: 1,
    route: "Intradermal",
    ageOfAdministration: ["At Birth or at first contact"]
  },
  {
    vaccine: "OPV",
    diseases: ["Poliomyelitis"],
    dosage: "2 drops",
    numberOfDoses: 4,
    route: "Oral",
    ageOfAdministration: [
      "0 dose at birth or within 2 weeks",
      "1st Dose at 6 weeks of life or at first contact with an unvaccinated child under 5 years",
      "2nd Dose at 10 weeks or 4 weeks after OPV 1",
      "3rd Dose at 14 weeks or 4 weeks after OPV 2"
    ]
  },
  {
    vaccine: "Rotavirus",
    diseases: ["Rotavirus Diarrhea"],
    dosage: "1.0 ml",
    numberOfDoses: 2,
    route: "Oral",
    ageOfAdministration: [
      "1st Dose at 6 weeks of life or at first contact with an unvaccinated child under 1 years",
      "2nd Dose at 10 weeks or 4 weeks after Rota 1"
    ]
  },
  {
    vaccine: "IPV",
    diseases: ["Poliomyelitis"],
    dosage: "0.5 ml",
    numberOfDoses: 1,
    route: "Intramuscular (IM) into the upper outer aspect of the right thigh",
    ageOfAdministration: [
      "At 14 weeks or at first contact with an unvaccinated child below one year"
    ]
  },
  {
    vaccine: "Dpt-HepB-Hib (Pentavalent)",
    diseases: ["Diphtheria", "Tetanus", "Whooping cough (pertussis)", "Hepatitis B", "Haemophilus influenzae type b pneumonia and meningitis"],
    dosage: "0.5ml",
    numberOfDoses: 3,
    route: "Intramuscular (IM) into the upper outer aspect of the left thigh",
    ageOfAdministration: [
      "1st Dose at 6 weeks of life or at first contact with an unvaccinated child under 5 years",
      "2nd Dose at 10 weeks or 4 weeks after DPT-HepB-Hib 1",
      "3rd Dose at 14 weeks or 4 weeks after DPT-HepB-Hib 2"
    ]
  },
  {
    vaccine: "Pneumococcal Conjugate Vaccine-10 (PCV10)",
    diseases: ["Pneumococcal", "Severe form of pneumonia", "Meningitis", "Invasive disease", "Acute Otitis Media"],
    dosage: "0.5ml",
    numberOfDoses: 3,
    route: "Intramuscular (IM) into the upper outer aspect of the right thigh",
    ageOfAdministration: [
      "1st Dose at 6 weeks of life or at first contact with an unvaccinated child under 5 years",
      "2nd Dose at 10 weeks or 4 weeks after PCV1",
      "3rd Dose at 14 weeks or 4 weeks after PCV2"
    ]
  },
  {
    vaccine: "Measles Rubella (MR)",
    diseases: ["Measles", "Rubella"],
    dosage: "0.5 ml",
    numberOfDoses: 2,
    route: "Intramuscular (IM) into the right upper arm (deltoid muscle)",
    ageOfAdministration: [
      "1st Dose at 9 months or at first contact after 9 months for children under 5 years",
      "2nd Dose At 18 months or first contact after 18 months"
    ]
  },
  {
    vaccine: "Yellow-Fever",
    diseases: ["Yellow-fever"],
    dosage: "0.5 ml",
    numberOfDoses: 1,
    route: "Intramuscular into the left upper arm",
    ageOfAdministration: [
      "At 9 months or first contact after 9 months – in four high risk counties (Baringo, Elgeyo Marakwet, west Pokot and Turkana"
    ]
  },
  {
    vaccine: "Tetanus Toxoid (TT) Tetanus Diphtheria (Td)",
    diseases: ["Tetanus", "Diphtheria"],
    dosage: "0.5ml",
    numberOfDoses: 5,
    route: "Intramuscular (IM)into the left upper arm",
    ageOfAdministration: [
      "Refer to Schedule for different age groups"
    ]
  },
  {
    vaccine: "HPV",
    diseases: ["Human Papilloma Virus"],
    dosage: "0.5ml",
    numberOfDoses: 2,
    route: "Intramuscular (IM)into the right upper arm",
    ageOfAdministration: [
      "1st Dose at 10 years",
      "2nd Dose 6 Months after the 1st dose"
    ]
  }
];

interface VaccinationScheduleTableProps {
  onSchedule?: (vaccine: string, dose: number) => void;
  onComplete?: (vaccine: string, dose: number) => void;
}

export const VaccinationScheduleTable = ({ onSchedule, onComplete }: VaccinationScheduleTableProps) => {
  const [markedDoses, setMarkedDoses] = useState<Record<string, 'scheduled' | 'completed'>>({});

  const handleSchedule = (vaccine: string, dose: number) => {
    const key = `${vaccine}-${dose}`;
    setMarkedDoses(prev => ({ ...prev, [key]: 'scheduled' }));
    onSchedule?.(vaccine, dose);
  };

  const handleComplete = (vaccine: string, dose: number) => {
    const key = `${vaccine}-${dose}`;
    setMarkedDoses(prev => ({ ...prev, [key]: 'completed' }));
    onComplete?.(vaccine, dose);
  };

  const getDoseStatus = (vaccine: string, dose: number) => {
    const key = `${vaccine}-${dose}`;
    return markedDoses[key];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Kenya Routine Immunization Schedule</CardTitle>
        <p className="text-sm text-muted-foreground">
          Official vaccination schedule - Mark doses as scheduled or completed
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Vaccine</TableHead>
                <TableHead className="font-bold">Diseases Prevented</TableHead>
                <TableHead className="font-bold">Dosage</TableHead>
                <TableHead className="font-bold">Number of Doses</TableHead>
                <TableHead className="font-bold">Route of Administration</TableHead>
                <TableHead className="font-bold">Age of Administration</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kenyaVaccinationSchedule.map((vaccine, index) => (
                <TableRow key={index} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{vaccine.vaccine}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {vaccine.diseases.map((disease, i) => (
                        <li key={i}>{disease}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{vaccine.dosage}</TableCell>
                  <TableCell className="text-center">{vaccine.numberOfDoses}</TableCell>
                  <TableCell className="text-sm">{vaccine.route}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {vaccine.ageOfAdministration.map((age, i) => {
                        const doseNumber = i + 1;
                        const status = getDoseStatus(vaccine.vaccine, doseNumber);
                        return (
                          <li key={i} className="mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{age}</span>
                              {status && (
                                <Badge 
                                  variant={status === 'completed' ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {status === 'completed' ? 'Completed' : 'Scheduled'}
                                </Badge>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: vaccine.numberOfDoses }, (_, i) => {
                        const doseNumber = i + 1;
                        const status = getDoseStatus(vaccine.vaccine, doseNumber);
                        return (
                          <div key={i} className="flex gap-1 items-center">
                            <span className="text-xs font-medium min-w-[50px]">Dose {doseNumber}:</span>
                            {status === 'completed' ? (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Done
                              </Badge>
                            ) : (
                              <div className="flex gap-1">
                                {status === 'scheduled' ? (
                                  <>
                                    <Badge variant="outline" className="text-xs">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      Scheduled
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handleComplete(vaccine.vaccine, doseNumber)}
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handleSchedule(vaccine.vaccine, doseNumber)}
                                    >
                                      <Calendar className="w-3 h-3 mr-1" />
                                      Schedule
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handleComplete(vaccine.vaccine, doseNumber)}
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
