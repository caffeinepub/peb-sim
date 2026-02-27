import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListProjects, useGetCurrentUser } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectList from '../components/ProjectList';
import CreateProjectForm from '../components/CreateProjectForm';
import ProjectLimitWarning from '../components/ProjectLimitWarning';
import SubscriptionBadge from '../components/SubscriptionBadge';
import { Plus, Building2, RefreshCw } from 'lucide-react';
import { SubscriptionTier } from '../backend';

export default function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: currentUser } = useGetCurrentUser();
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch,
  } = useListProjects();

  const subscriptionTier = currentUser?.subscriptionTier ?? SubscriptionTier.free;
  const projectCount = projects?.length ?? 0;
  const isAtLimit = subscriptionTier === SubscriptionTier.free && projectCount >= 2;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-bold text-foreground">
              Projects
            </h1>
            <SubscriptionBadge tier={subscriptionTier} />
          </div>
          <p className="text-muted-foreground text-sm">
            {userProfile
              ? `Welcome back, ${userProfile.displayName}`
              : 'Manage your PEB simulation projects'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="text-muted-foreground hover:text-foreground"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={isAtLimit}
            className="bg-amber text-primary-foreground hover:bg-amber-light font-mono gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Limit warning */}
      {isAtLimit && <ProjectLimitWarning projectCount={projectCount} />}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Projects',
            value: projectCount,
            sub: subscriptionTier === SubscriptionTier.free ? `/ 2 free` : 'unlimited',
          },
          {
            label: 'Processed',
            value: projects?.filter((p) => p.status === 'processed').length ?? 0,
            sub: 'ready to view',
          },
          {
            label: 'Subscription',
            value: subscriptionTier === SubscriptionTier.pro ? 'PRO' : 'FREE',
            sub: subscriptionTier === SubscriptionTier.pro ? 'unlimited projects' : '2 project limit',
          },
          {
            label: 'Elements',
            value: projects?.reduce((acc, p) => {
              if (p.erectionDataJSON) {
                try {
                  return acc + JSON.parse(p.erectionDataJSON).length;
                } catch { return acc; }
              }
              return acc;
            }, 0) ?? 0,
            sub: 'total parsed',
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="steel-card p-4">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="font-mono text-2xl font-bold text-amber mt-1">{value}</p>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Projects list */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber" />
          <h2 className="font-mono font-semibold text-foreground">Your Projects</h2>
        </div>

        {projectsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full bg-muted" />
            ))}
          </div>
        ) : projectsError ? (
          <div className="steel-card p-6 text-center space-y-3">
            <p className="text-destructive font-mono text-sm">Failed to load projects</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border">
              Try Again
            </Button>
          </div>
        ) : (
          <ProjectList projects={projects ?? []} />
        )}
      </div>

      {/* Create project form */}
      <CreateProjectForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        isAtLimit={isAtLimit}
      />
    </div>
  );
}
