import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Zap } from 'lucide-react';

interface ProjectLimitWarningProps {
  projectCount: number;
}

export default function ProjectLimitWarning({ projectCount }: ProjectLimitWarningProps) {
  const navigate = useNavigate();

  if (projectCount < 2) return null;

  return (
    <div className="border border-amber/30 bg-amber/5 rounded-sm p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono font-semibold text-amber">Free Tier Limit Reached</p>
        <p className="text-sm text-muted-foreground mt-1">
          You've used {projectCount}/2 free projects. Upgrade to Pro for unlimited projects.
        </p>
      </div>
      <Button
        size="sm"
        onClick={() => navigate({ to: '/pricing' })}
        className="bg-amber text-primary-foreground hover:bg-amber-light font-mono gap-1 flex-shrink-0"
      >
        <Zap className="w-3 h-3" />
        Upgrade
      </Button>
    </div>
  );
}
