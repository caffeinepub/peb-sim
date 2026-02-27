import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsStripeConfigured, useSetStripeConfiguration, useIsCallerAdmin } from '../hooks/useQueries';
import { CreditCard, Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeSetupPanel() {
  const [open, setOpen] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB,AU,DE,FR');

  const { data: isAdmin } = useIsCallerAdmin();
  const { data: isConfigured } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  // Only show for admins when Stripe is not configured
  if (!isAdmin || isConfigured) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) return;

    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    try {
      await setConfig.mutateAsync({ secretKey: secretKey.trim(), allowedCountries });
      toast.success('Stripe configured successfully!');
      setOpen(false);
    } catch (err) {
      toast.error('Failed to configure Stripe.');
    }
  };

  return (
    <>
      {/* Admin notice banner */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="bg-amber/20 border border-amber/40 text-amber hover:bg-amber/30 font-mono gap-2"
          variant="outline"
        >
          <Settings className="w-3 h-3" />
          Configure Stripe
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-sm bg-amber/20 border border-amber/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber" />
              </div>
              <DialogTitle className="text-foreground font-mono">
                Configure Stripe
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Set up Stripe to enable Pro subscription payments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-foreground font-mono text-xs uppercase tracking-wider">
                Stripe Secret Key
              </Label>
              <Input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_live_..."
                className="bg-secondary border-border text-foreground font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-mono text-xs uppercase tracking-wider">
                Allowed Countries (comma-separated)
              </Label>
              <Input
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="US,CA,GB"
                className="bg-secondary border-border text-foreground font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 border-border text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!secretKey.trim() || setConfig.isPending}
                className="flex-1 bg-amber text-primary-foreground hover:bg-amber-light font-mono"
              >
                {setConfig.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Save Config'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
