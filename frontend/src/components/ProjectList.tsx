import { useNavigate } from '@tanstack/react-router';
import { Project, ProjectStatus } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteProject } from '../hooks/useQueries';
import { Eye, Trash2, Clock, CheckCircle2, XCircle, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ProjectListProps {
  projects: Project[];
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const configs = {
    [ProjectStatus.queued]: { label: 'Queued', icon: Clock, className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    [ProjectStatus.processing]: { label: 'Processing', icon: Loader2, className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    [ProjectStatus.processed]: { label: 'Ready', icon: CheckCircle2, className: 'bg-green-500/10 text-green-400 border-green-500/30' },
    [ProjectStatus.failed]: { label: 'Failed', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`font-mono text-xs gap-1 ${config.className}`}>
      <Icon className={`w-3 h-3 ${status === ProjectStatus.processing ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}

export default function ProjectList({ projects }: ProjectListProps) {
  const navigate = useNavigate();
  const deleteProject = useDeleteProject();

  const handleDelete = async (projectId: bigint, name: string) => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast.success(`Project "${name}" deleted`);
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const formatDate = (timestamp: bigint) => {
    try {
      const ms = Number(timestamp) / 1_000_000;
      return formatDistanceToNow(new Date(ms), { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-sm bg-muted border border-border flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-foreground font-mono font-semibold">No projects yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Create your first project to start simulating building erection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div
          key={project.id.toString()}
          className="steel-card p-4 flex items-center gap-4 hover:border-amber/30 transition-colors group"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-sm bg-amber/10 border border-amber/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-amber/70" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-mono font-semibold text-foreground truncate">
                {project.name}
              </h3>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-mono">
              <span>{project.uploadedFileName}</span>
              <span>·</span>
              <span>{formatDate(project.createdAt)}</span>
            </div>
            {project.status === ProjectStatus.failed && (
              <p className="text-xs text-destructive mt-1">
                Parsing failed — check that your DXF contains valid layer names.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate({ to: '/project/$projectId', params: { projectId: project.id.toString() } })}
              disabled={project.status !== ProjectStatus.processed}
              className="text-muted-foreground hover:text-amber gap-1 font-mono text-xs"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground font-mono">Delete Project?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will permanently delete "{project.name}" and all its simulation data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border text-muted-foreground">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(project.id, project.name)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}
