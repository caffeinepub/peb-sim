import { useNavigate } from '@tanstack/react-router';
import { useGetCurrentUser, useCreateCheckoutSession } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { SubscriptionTier, type ShoppingItem } from '../backend';
import { Check, Zap, Lock, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const FREE_FEATURES = [
  'Up to 2 projects',
  'DXF file parsing',
  'Interactive 3D viewer',
  'Basic timeline controls',
  'Orbit camera controls',
];

const PRO_FEATURES = [
  'Unlimited projects',
  'DXF file parsing',
  'Interactive 3D viewer',
  'Full animation controls',
  'Export simulation data',
  'Priority support',
  'Advanced element filtering',
];

const PRO_ITEM: ShoppingItem = {
  productName: 'PEB-Sim Pro Subscription',
  productDescription: 'Unlimited projects and full animation controls for PEB-Sim',
  currency: 'usd',
  quantity: BigInt(1),
  priceInCents: BigInt(2900), // $29/month
};

export default function Pricing() {
  const navigate = useNavigate();
  const { data: currentUser } = useGetCurrentUser();
  const createCheckout = useCreateCheckoutSession();

  const isPro = currentUser?.subscriptionTier === SubscriptionTier.pro;

  const handleUpgrade = async () => {
    try {
      const session = await createCheckout.mutateAsync([PRO_ITEM]);
      if (!session?.url) throw new Error('Stripe session missing url');
      window.location.href = session.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start checkout';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-sm px-3 py-1">
          <Zap className="w-3 h-3 text-amber" />
          <span className="font-mono text-xs text-amber uppercase tracking-wider">Pricing</span>
        </div>
        <h1 className="text-3xl font-mono font-bold text-foreground">
          Simple, Transparent Pricing
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Start for free and upgrade when you need more. No hidden fees.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free tier */}
        <div className={`steel-card p-6 space-y-6 ${!isPro ? 'border-amber/30' : ''}`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-mono font-bold text-xl text-foreground">Free</h2>
              {!isPro && (
                <span className="ml-auto font-mono text-xs bg-muted text-muted-foreground border border-border rounded-sm px-2 py-0.5">
                  Current Plan
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground font-mono text-sm">/ month</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Perfect for exploring PEB-Sim capabilities.
            </p>
          </div>

          <ul className="space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant="outline"
            className="w-full border-border text-muted-foreground font-mono"
            onClick={() => navigate({ to: '/' })}
            disabled={!isPro}
          >
            {isPro ? 'Downgrade to Free' : 'Current Plan'}
          </Button>
        </div>

        {/* Pro tier */}
        <div className={`steel-card p-6 space-y-6 border-amber/40 amber-glow relative overflow-hidden`}>
          {/* Glow accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber/5 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="space-y-2 relative">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber" />
              <h2 className="font-mono font-bold text-xl text-foreground">Pro</h2>
              {isPro && (
                <span className="ml-auto font-mono text-xs bg-amber/20 text-amber border border-amber/30 rounded-sm px-2 py-0.5">
                  Current Plan
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-amber">$29</span>
              <span className="text-muted-foreground font-mono text-sm">/ month</span>
            </div>
            <p className="text-muted-foreground text-sm">
              For professionals and teams working on multiple projects.
            </p>
          </div>

          <ul className="space-y-3 relative">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-amber flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            onClick={handleUpgrade}
            disabled={isPro || createCheckout.isPending}
            className="w-full bg-amber text-primary-foreground hover:bg-amber-light font-mono font-semibold gap-2 relative"
          >
            {createCheckout.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to Checkout...
              </>
            ) : isPro ? (
              'Current Plan'
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Upgrade to Pro
              </>
            )}
          </Button>
        </div>
      </div>

      {/* FAQ */}
      <div className="steel-card p-6 space-y-4">
        <h3 className="font-mono font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber" />
          Frequently Asked Questions
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              q: 'What DXF layers are supported?',
              a: 'COLUMN, RAFTER, PURLIN, GIRT, STRUT, and ANCHOR_BOLT layers are automatically detected and assigned erection order.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes, you can cancel your Pro subscription at any time. Your projects remain accessible.',
            },
            {
              q: 'What file formats are supported?',
              a: 'Currently only .dxf (AutoCAD Drawing Exchange Format) files are supported for parsing.',
            },
            {
              q: 'Is my data secure?',
              a: 'All data is stored on the Internet Computer blockchain, providing tamper-proof storage.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="space-y-1">
              <p className="font-mono text-sm font-semibold text-foreground">{q}</p>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
