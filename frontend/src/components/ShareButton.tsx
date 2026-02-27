import React, { useState } from 'react';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCreateSharedLink } from '@/hooks/useQueries';

interface ShareButtonProps {
  projectId: bigint;
  projectName?: string;
}

export default function ShareButton({ projectId, projectName = 'Project' }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const createSharedLink = useCreateSharedLink();

  const handleShare = async () => {
    try {
      const token = await createSharedLink.mutateAsync(projectId);
      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);
      setOpen(true);
    } catch (err) {
      toast.error('Failed to generate share link.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={createSharedLink.isPending}
        className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        {createSharedLink.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        Share
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Share "{projectName}"</DialogTitle>
            <DialogDescription className="text-slate-400">
              Anyone with this link can view the model in read-only mode.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Input
              value={shareUrl}
              readOnly
              className="bg-slate-800 border-slate-600 text-slate-300 text-xs font-mono"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-black"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            This link provides view-only access. No editing controls will be shown.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
