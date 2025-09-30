import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function QuickAddForm() {
  const [formData, setFormData] = useState({
    entryType: "Vaccination",
    date: "Oct 20, 2025",
    who: "Infant",
    clinic: "Happy Kids Clinic",
    notes: "Mild fever after previous dose"
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Quick Add</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entry-type" className="text-sm font-medium">Entry type</Label>
            <Select value={formData.entryType} onValueChange={(value) => setFormData(prev => ({...prev, entryType: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vaccination">Vaccination</SelectItem>
                <SelectItem value="Appointment">Appointment</SelectItem>
                <SelectItem value="Screening">Screening</SelectItem>
                <SelectItem value="Medication">Medication</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">Date</Label>
            <Input 
              id="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="who" className="text-sm font-medium">Who</Label>
            <Select value={formData.who} onValueChange={(value) => setFormData(prev => ({...prev, who: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Infant">Infant</SelectItem>
                <SelectItem value="Mother">Mother</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clinic" className="text-sm font-medium">Clinic</Label>
            <Input 
              id="clinic"
              value={formData.clinic}
              onChange={(e) => setFormData(prev => ({...prev, clinic: e.target.value}))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
            rows={3}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button variant="outline" className="w-full sm:w-auto">Save Draft</Button>
          <Button className="bg-cyan-500 hover:bg-cyan-600 w-full sm:w-auto">Add Entry</Button>
        </div>
      </CardContent>
    </Card>
  );
}