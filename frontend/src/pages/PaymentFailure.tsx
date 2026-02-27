import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full steel-card p-8 text-center space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="font-mono font-bold text-2xl text-foreground">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground">
            Your payment was not completed. No charges have been made to your account.
            You can try again whenever you're ready.
          </p>
        </div>

        {/* Info box */}
        <div className="bg-muted/30 border border-border rounded-sm p-4 text-left space-y-2">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            What happened?
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>· The checkout session was cancelled or timed out</li>
            <li>· Your payment method may have been declined</li>
            <li>· You navigated away before completing payment</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate({ to: '/pricing' })}
            className="w-full bg-amber text-primary-foreground hover:bg-amber-light font-mono font-semibold gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={() => navigate({ to: '/' })}
            variant="outline"
            className="w-full border-border text-muted-foreground hover:text-foreground font-mono gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground">
          Need help?{' '}
          <span className="text-amber">
            Contact support
          </span>{' '}
          if you believe this is an error.
        </p>
      </div>
    </div>
  );
}
