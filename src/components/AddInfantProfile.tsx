import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";

interface AddInfantProfileProps {
  open: boolean;
  onClose: () => void;
}

export function AddInfantProfile({ open, onClose }: AddInfantProfileProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    infantName: "Ava Grace",
    preferredName: "",
    sexAtBirth: "Female",
    dateOfBirth: "Oct 05, 2025",
    guardian: "Alex Johnson (you)",
    relationship: "Parent",
    medicalId: "",
    pediatrician: "",
    notes: "Any important info to start with..."
  });

  const steps = [
    { number: 1, label: "Basic info", active: currentStep === 1 },
    { number: 2, label: "Birth", active: currentStep === 2 },
    { number: 3, label: "Vaccines", active: currentStep === 3 },
    { number: 4, label: "Conditions", active: currentStep === 4 },
    { number: 5, label: "Review", active: currentStep === 5 }
  ];

  const sidebarSteps = [
    { label: "Basic info", active: currentStep === 1, completed: false },
    { label: "Birth details", active: currentStep === 2, completed: false },
    { label: "Vaccines", active: currentStep === 3, completed: false },
    { label: "Conditions", active: currentStep === 4, completed: false },
    { label: "Review", active: currentStep === 5, completed: false },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">Add Infant Profile</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="ml-2">Close</span>
          </Button>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-80 bg-secondary p-6 space-y-6">
            <div>
              <h3 className="font-medium text-muted-foreground mb-4">Setup steps</h3>
              <div className="space-y-2">
                {sidebarSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      step.active 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background hover:bg-accent"
                    }`}
                    onClick={() => setCurrentStep(index + 1)}
                  >
                    {step.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground mb-2">Tips</h3>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <p className="text-sm text-warning-foreground">
                  You can complete only Basic info now and finish other steps later.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-4 mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className="ml-2 text-sm font-medium">{step.label}</span>
                  {index < steps.length - 1 && <span className="mx-4 text-muted-foreground">•</span>}
                </div>
              ))}
            </div>

            {/* Form Content */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="infantName">Infant name</Label>
                  <Input
                    id="infantName"
                    placeholder="E.g., Ava Grace"
                    value={formData.infantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, infantName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred name</Label>
                  <Input
                    id="preferredName"
                    placeholder="Optional"
                    value={formData.preferredName}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sexAtBirth">Sex at birth</Label>
                  <Select value={formData.sexAtBirth} onValueChange={(value) => setFormData(prev => ({ ...prev, sexAtBirth: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of birth</Label>
                  <Input
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="guardian">Associated guardian</Label>
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">AJ</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{formData.guardian}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select value={formData.relationship} onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Caregiver">Caregiver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="medicalId">Medical ID</Label>
                  <Input
                    id="medicalId"
                    placeholder="Optional"
                    value={formData.medicalId}
                    onChange={(e) => setFormData(prev => ({ ...prev, medicalId: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pediatrician">Pediatrician</Label>
                  <Button variant="outline" className="w-full justify-start text-muted-foreground">
                    Add provider
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                You can update this profile anytime from Resources › Profiles.
              </p>
              <div className="flex gap-3">
                <Button variant="outline">Back</Button>
                <Button variant="outline">Save & Exit</Button>
                <Button>Continue to Birth Details</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}