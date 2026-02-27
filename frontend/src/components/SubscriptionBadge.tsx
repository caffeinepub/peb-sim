import { Badge } from '@/components/ui/badge';
import { SubscriptionTier } from '../backend';
import { Zap, Lock } from 'lucide-react';

interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  className?: string;
}

export default function SubscriptionBadge({ tier, className }: SubscriptionBadgeProps) {
  if (tier === SubscriptionTier.pro) {
    return (
      <Badge
        className={`bg-amber/20 text-amber border-amber/40 font-mono text-xs gap-1 ${className}`}
        variant="outline"
      >
        <Zap className="w-3 h-3" />
        PRO
      </Badge>
    );
  }

  return (
    <Badge
      className={`bg-muted text-muted-foreground border-border font-mono text-xs gap-1 ${className}`}
      variant="outline"
    >
      <Lock className="w-3 h-3" />
      FREE
    </Badge>
  );
}
