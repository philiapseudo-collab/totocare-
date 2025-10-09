import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Smartphone, Building2, Loader2 } from "lucide-react";

interface DonateDialogProps {
  campaign: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DonateDialog = ({ campaign, open, onOpenChange }: DonateDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'bank'>('mpesa');
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    amount: '',
    anonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create donation record
      const { data: donation, error: donationError } = await supabase
        .from('donations')
        .insert({
          campaign_id: campaign.id,
          donor_name: formData.anonymous ? null : formData.donor_name,
          donor_email: formData.anonymous ? null : formData.donor_email,
          donor_phone: formData.donor_phone,
          amount: parseFloat(formData.amount),
          payment_method: paymentMethod,
          anonymous: formData.anonymous,
        })
        .select()
        .single();

      if (donationError) throw donationError;

      // Process payment based on method
      if (paymentMethod === 'mpesa') {
        const { data, error } = await supabase.functions.invoke('process-mpesa-payment', {
          body: {
            donation_id: donation.id,
            phone_number: formData.donor_phone,
            amount: parseFloat(formData.amount),
          },
        });

        if (error) throw error;

        toast({
          title: "M-Pesa Payment Initiated",
          description: "Please check your phone for the M-Pesa prompt to complete payment.",
        });
      } else {
        // Bank payment
        const { data, error } = await supabase.functions.invoke('process-bank-payment', {
          body: {
            donation_id: donation.id,
            donor_email: formData.donor_email,
            amount: parseFloat(formData.amount),
          },
        });

        if (error) throw error;

        toast({
          title: "Bank Payment Instructions",
          description: "Payment instructions have been sent to your email.",
        });
      }

      onOpenChange(false);
      setFormData({
        donor_name: '',
        donor_email: '',
        donor_phone: '',
        amount: '',
        anonymous: false,
      });
    } catch (error: any) {
      console.error('Donation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Donate to {campaign.title}</DialogTitle>
          <DialogDescription>
            Your contribution helps save lives and improve healthcare outcomes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!formData.anonymous && (
            <>
              <div>
                <Label htmlFor="donor_name">Full Name</Label>
                <Input
                  id="donor_name"
                  value={formData.donor_name}
                  onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                  required={!formData.anonymous}
                />
              </div>

              <div>
                <Label htmlFor="donor_email">Email Address</Label>
                <Input
                  id="donor_email"
                  type="email"
                  value={formData.donor_email}
                  onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                  required={!formData.anonymous}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="donor_phone">Phone Number</Label>
            <Input
              id="donor_phone"
              placeholder="254712345678"
              value={formData.donor_phone}
              onChange={(e) => setFormData({ ...formData, donor_phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder="1000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <Label className="mb-3 block">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                <RadioGroupItem value="mpesa" id="mpesa" />
                <Label htmlFor="mpesa" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Smartphone className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">M-Pesa</div>
                    <div className="text-xs text-muted-foreground">Pay via mobile money</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Building2 className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Bank Transfer</div>
                    <div className="text-xs text-muted-foreground">Pay via bank account</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.anonymous}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, anonymous: checked as boolean })
              }
            />
            <Label htmlFor="anonymous" className="text-sm cursor-pointer">
              Make this donation anonymous
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Donate KES {formData.amount || '0'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
