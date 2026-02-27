import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useGetStripeSessionStatus } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Zap } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  // Get session_id from URL params
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const sessionId = params.get('session_id');

  const { data: sessionStatus, isLoading } = useGetStripeSessionStatus(sessionId);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full steel-card p-8 text-center space-y-6 amber-glow">
        {isLoading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-amber animate-spin mx-auto" />
            <p className="font-mono text-muted-foreground">Verifying payment...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>

            <div className="space-y-2">
              <h1 className="font-mono font-bold text-2xl text-foreground">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground">
                Your subscription has been upgraded to{' '}
                <span className="text-amber font-mono font-semibold">Pro</span>.
                You now have unlimited projects and full access to all features.
              </p>
            </div>

            <div className="bg-amber/5 border border-amber/20 rounded-sm p-4 space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <Zap className="w-4 h-4 text-amber" />
                <span className="font-mono text-sm font-semibold text-amber">Pro Features Unlocked</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Unlimited projects</li>
                <li>✓ Full animation controls</li>
                <li>✓ Export simulation data</li>
              </ul>
            </div>

            <Button
              onClick={() => navigate({ to: '/' })}
              className="w-full bg-amber text-primary-foreground hover:bg-amber-light font-mono font-semibold"
            >
              Go to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
