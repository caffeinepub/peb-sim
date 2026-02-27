import { useState, useRef } from 'react';
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
import { useCreateProject, useSaveErectionData, useUpdateProjectStatus } from '../hooks/useQueries';
import { useDxfParser } from '../hooks/useDxfParser';
import { generateSampleBuilding } from '../utils/dxfParser';
import { ProjectStatus } from '../backend';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

interface CreateProjectFormProps {
  open: boolean;
  onClose: () => void;
  isAtLimit: boolean;
}

export default function CreateProjectForm({ open, onClose, isAtLimit }: CreateProjectFormProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProject = useCreateProject();
  const saveErectionData = useSaveErectionData();
  const updateStatus = useUpdateProjectStatus();
  const { parseFile, isLoading: isParsing, error: parseError, reset: resetParser } = useDxfParser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.dxf')) {
        toast.error('Only .dxf files are supported');
        return;
      }
      setSelectedFile(file);
      resetParser();
    }
  };

  const handleUseSample = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name first');
      return;
    }
    setIsSubmitting(true);
    try {
      const projectId = await createProject.mutateAsync({
        name: projectName.trim(),
        uploadedFileName: 'sample-building.dxf',
      });

      await updateStatus.mutateAsync({ projectId, status: ProjectStatus.processing });

      const elements = generateSampleBuilding();
      const dataJSON = JSON.stringify(elements);

      await saveErectionData.mutateAsync({ projectId, dataJSON });
      await updateStatus.mutateAsync({ projectId, status: ProjectStatus.processed });

      toast.success('Sample building project created!');
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create project';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !selectedFile) return;

    setIsSubmitting(true);
    let projectId: bigint | null = null;

    try {
      // Create project record
      projectId = await createProject.mutateAsync({
        name: projectName.trim(),
        uploadedFileName: selectedFile.name,
      });

      // Update status to processing
      await updateStatus.mutateAsync({ projectId, status: ProjectStatus.processing });

      // Parse DXF file
      const elements = await parseFile(selectedFile);
      const dataJSON = JSON.stringify(elements);

      // Save erection data
      await saveErectionData.mutateAsync({ projectId, dataJSON });

      // Mark as processed
      await updateStatus.mutateAsync({ projectId, status: ProjectStatus.processed });

      toast.success(`Project "${projectName}" created with ${elements.length} building elements!`);
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create project';
      toast.error(msg);

      // Mark project as failed if it was created
      if (projectId !== null) {
        try {
          await updateStatus.mutateAsync({ projectId, status: ProjectStatus.failed });
        } catch {
          // ignore
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setProjectName('');
    setSelectedFile(null);
    resetParser();
    setIsSubmitting(false);
    onClose();
  };

  const isLoading = isSubmitting || isParsing;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground font-mono text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber" />
            New Project
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload a DXF file to generate a 3D erection simulation, or use the sample building.
          </DialogDescription>
        </DialogHeader>

        {isAtLimit ? (
          <div className="py-4 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber mx-auto" />
            <p className="text-muted-foreground text-sm">
              You've reached the 2-project limit on the Free tier.
            </p>
            <Button
              onClick={() => { handleClose(); }}
              className="bg-amber text-primary-foreground hover:bg-amber-light font-mono"
            >
              Upgrade to Pro
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* Project name */}
            <div className="space-y-2">
              <Label className="text-foreground font-mono text-xs uppercase tracking-wider">
                Project Name *
              </Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Warehouse Bay A"
                className="bg-secondary border-border text-foreground"
                disabled={isLoading}
                required
              />
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label className="text-foreground font-mono text-xs uppercase tracking-wider">
                DXF File
              </Label>
              <div
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors
                  ${selectedFile
                    ? 'border-amber/50 bg-amber/5'
                    : 'border-border hover:border-amber/40 hover:bg-accent/30'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".dxf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-amber">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-mono text-sm">{selectedFile.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload a <span className="text-amber font-mono">.dxf</span> file
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Layers: COLUMN, RAFTER, PURLIN, GIRT, STRUT, ANCHOR_BOLT
                    </p>
                  </div>
                )}
              </div>

              {parseError && (
                <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-sm p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseSample}
                disabled={isLoading || !projectName.trim()}
                className="flex-1 border-border text-muted-foreground hover:text-foreground gap-2 font-mono text-xs"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <FlaskConical className="w-3 h-3" />
                )}
                Use Sample
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="border-border text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!projectName.trim() || !selectedFile || isLoading}
                className="flex-1 bg-amber text-primary-foreground hover:bg-amber-light font-mono font-semibold gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isParsing ? 'Parsing...' : 'Creating...'}
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
